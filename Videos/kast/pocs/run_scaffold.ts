/**
 * Standalone (non-jest) runner for the m_ext scaled-ui scaffold. Run: npx ts-node pocs/run_scaffold.ts
 * Avoids jest's worker/module isolation which destabilizes the litesvm native addon.
 * Boots the real M protocol + prebuilt scaled-ui program (ext_b.so) in litesvm and drives the full lifecycle.
 */
import { Program, BN } from "@coral-xyz/anchor";
import { LiteSVM } from "litesvm";
import { LiteSVMProvider } from "anchor-litesvm";
import { PublicKey, Keypair, LAMPORTS_PER_SOL, SystemProgram, Transaction } from "@solana/web3.js";
import {
  TOKEN_2022_PROGRAM_ID, ASSOCIATED_TOKEN_PROGRAM_ID, ExtensionType, AccountState, AuthorityType,
  getMintLen, getAssociatedTokenAddressSync, getAccount, getMint, getExtensionData,
  createInitializeMintInstruction, createInitializeScaledUiAmountConfigInstruction,
  createInitializeDefaultAccountStateInstruction, createInitializePermanentDelegateInstruction,
  createUpdateDefaultAccountStateInstruction, createSetAuthorityInstruction,
  createAssociatedTokenAccountInstruction, createMintToCheckedInstruction,
} from "@solana/spl-token";
import { MerkleTree, ZERO_WORD } from "../tests/test-utils";
import * as path from "path";
import * as fs from "fs";

const assert = (c: boolean, m: string) => { if (!c) throw new Error("ASSERT FAIL: " + m); };
const REPO = path.join(__dirname, "..");          // kast-src
const DIR = path.join(REPO, "tests", "programs");
const IDL_DIR = __dirname;                          // pocs
const EXT_B_ID = new PublicKey("HSMnbWEkB7sEQAGSzBPeACNUCXC9FgNeeESLnHtKfoy3");
const loadIdl = (p: string, a: PublicKey) => { const i = JSON.parse(fs.readFileSync(p, "utf8")); i.address = a.toBase58(); return i; };

async function main() {
  const svm = new LiteSVM().withDefaultPrograms().withBuiltins().withSysvars().withPrecompiles().withBlockhashCheck(true);
  const earnJson = path.join(DIR, "earn.json");
  const earnAddr = new PublicKey(JSON.parse(fs.readFileSync(earnJson, "utf8")).address);
  svm.addProgramFromFile(earnAddr, path.join(DIR, "earn.so"));
  svm.addProgramFromFile(TOKEN_2022_PROGRAM_ID, path.join(DIR, "spl_token_2022.so"));
  svm.addProgramFromFile(EXT_B_ID, path.join(DIR, "ext_b.so"));
  const provider = new LiteSVMProvider(svm);
  const earn = new Program(loadIdl(earnJson, earnAddr), provider);
  const ext = new Program(loadIdl(path.join(IDL_DIR, "USDKY_idl.json"), EXT_B_ID), provider);

  const admin = new Keypair(), mMintAuth = new Keypair(), user = new Keypair(), wrapAuth = new Keypair();
  const mMint = new Keypair(), extMint = new Keypair();
  for (const k of [admin, mMintAuth, user, wrapAuth]) svm.airdrop(k.publicKey, BigInt(100 * LAMPORTS_PER_SOL));

  const earnGlobal = () => PublicKey.findProgramAddressSync([Buffer.from("global")], earn.programId)[0];
  const extMintAuth = () => PublicKey.findProgramAddressSync([Buffer.from("mint_authority")], ext.programId)[0];
  const mVault = () => PublicKey.findProgramAddressSync([Buffer.from("m_vault")], ext.programId)[0];
  const ata = (m: PublicKey, o: PublicKey) => getAssociatedTokenAddressSync(m, o, true, TOKEN_2022_PROGRAM_ID, ASSOCIATED_TOKEN_PROGRAM_ID);
  const bal = async (a: PublicKey) => (await getAccount(provider.connection, a, undefined, TOKEN_2022_PROGRAM_ID)).amount;
  const newMult = async (m: PublicKey) => getExtensionData(ExtensionType.ScaledUiAmountConfig,
    (await getMint(provider.connection, m, undefined, TOKEN_2022_PROGRAM_ID)).tlvData)!.readDoubleLE(48);
  const send = (ixs: any[], signers: Keypair[]) => {
    const tx = new Transaction().add(...ixs);
    tx.recentBlockhash = svm.latestBlockhash(); tx.feePayer = signers[0].publicKey; tx.sign(...signers);
    const res: any = svm.sendTransaction(tx);
    if (res && res.err && res.err()) throw new Error("tx failed: " + JSON.stringify(res.err()) + "\n" + (res.logs ? res.logs().join("\n") : ""));
    svm.expireBlockhash();
  };
  const sendIx = async (builder: any, signers: Keypair[]) => send([await builder.instruction()], signers);

  // 1) M mint (frozen-by-default; scaled-ui/freeze/permanent-delegate authority = earn global)
  const g = earnGlobal(); const adminM = ata(mMint.publicKey, admin.publicKey);
  const mlen = getMintLen([ExtensionType.ScaledUiAmountConfig, ExtensionType.DefaultAccountState, ExtensionType.PermanentDelegate]);
  send([
    SystemProgram.createAccount({ fromPubkey: admin.publicKey, newAccountPubkey: mMint.publicKey, space: mlen, lamports: await provider.connection.getMinimumBalanceForRentExemption(mlen), programId: TOKEN_2022_PROGRAM_ID }),
    createInitializeScaledUiAmountConfigInstruction(mMint.publicKey, g, 1.0, TOKEN_2022_PROGRAM_ID),
    createInitializeDefaultAccountStateInstruction(mMint.publicKey, AccountState.Initialized, TOKEN_2022_PROGRAM_ID),
    createInitializePermanentDelegateInstruction(mMint.publicKey, g, TOKEN_2022_PROGRAM_ID),
    createInitializeMintInstruction(mMint.publicKey, 6, admin.publicKey, admin.publicKey, TOKEN_2022_PROGRAM_ID),
    createAssociatedTokenAccountInstruction(admin.publicKey, adminM, admin.publicKey, mMint.publicKey, TOKEN_2022_PROGRAM_ID),
    createMintToCheckedInstruction(mMint.publicKey, adminM, admin.publicKey, 100_000_000, 6, undefined, TOKEN_2022_PROGRAM_ID),
    createUpdateDefaultAccountStateInstruction(mMint.publicKey, AccountState.Frozen, admin.publicKey, undefined, TOKEN_2022_PROGRAM_ID),
    createSetAuthorityInstruction(mMint.publicKey, admin.publicKey, AuthorityType.FreezeAccount, g, undefined, TOKEN_2022_PROGRAM_ID),
    createSetAuthorityInstruction(mMint.publicKey, admin.publicKey, AuthorityType.MintTokens, mMintAuth.publicKey, undefined, TOKEN_2022_PROGRAM_ID),
  ], [admin, mMint]);
  console.log("M mint ok");

  // 2) earn.initialize
  await sendIx(earn.methods.initialize(new BN(1e12)).accounts({ admin: admin.publicKey, mMint: mMint.publicKey }), [admin]);
  console.log("earn.initialize ok");

  // 3) ext mint (scaled-ui; authority = ext mint_authority PDA; freeze = admin)
  const elen = getMintLen([ExtensionType.ScaledUiAmountConfig]);
  send([
    SystemProgram.createAccount({ fromPubkey: admin.publicKey, newAccountPubkey: extMint.publicKey, space: elen, lamports: await provider.connection.getMinimumBalanceForRentExemption(elen), programId: TOKEN_2022_PROGRAM_ID }),
    createInitializeScaledUiAmountConfigInstruction(extMint.publicKey, extMintAuth(), 1.0, TOKEN_2022_PROGRAM_ID),
    createInitializeMintInstruction(extMint.publicKey, 6, extMintAuth(), admin.publicKey, TOKEN_2022_PROGRAM_ID),
  ], [admin, extMint]);
  console.log("ext mint ok");

  // 4) create + thaw the vault M ATA via earner registration (BEFORE ext.initialize)
  const vaultM = ata(mMint.publicKey, mVault());
  send([createAssociatedTokenAccountInstruction(admin.publicKey, vaultM, mVault(), mMint.publicKey, TOKEN_2022_PROGRAM_ID)], [admin]);
  const tree = new MerkleTree([mVault()]);
  await sendIx(earn.methods.propagateIndex(new BN(1e12), tree.getRoot()).accounts({ signer: admin.publicKey }), [admin]);
  await sendIx(earn.methods.addRegistrarEarner(mVault(), tree.getInclusionProof(mVault()).proof).accountsPartial({ signer: admin.publicKey, userTokenAccount: vaultM }), [admin]);
  console.log("vault thawed (earner) ok");

  // 5) ext.initialize
  await sendIx(ext.methods.initialize([wrapAuth.publicKey], new BN(0)).accounts({ admin: admin.publicKey, mMint: mMint.publicKey, extMint: extMint.publicKey, extTokenProgram: TOKEN_2022_PROGRAM_ID }), [admin]);
  console.log("ext.initialize ok");

  // 6) user ext ATA + WRAP 1_000_000 from admin's thawed M
  const userExt = ata(extMint.publicKey, user.publicKey);
  send([createAssociatedTokenAccountInstruction(admin.publicKey, userExt, user.publicKey, extMint.publicKey, TOKEN_2022_PROGRAM_ID)], [admin]);
  await sendIx(ext.methods.wrap(new BN(1_000_000)).accounts({
    tokenAuthority: admin.publicKey, wrapAuthority: wrapAuth.publicKey, mMint: mMint.publicKey, extMint: extMint.publicKey,
    fromMTokenAccount: adminM, toExtTokenAccount: userExt, extTokenProgram: TOKEN_2022_PROGRAM_ID,
  }), [admin, wrapAuth]);
  const wExt = await bal(userExt), wVault = await bal(vaultM);
  console.log(`WRAP ok: user ext principal=${wExt}  vault M principal=${wVault}`);
  assert(wExt > 0n && wVault > 0n, "wrap produced balances");

  // 7) YIELD 1.0 -> 1.10 + permissionless SYNC
  await sendIx(earn.methods.propagateIndex(new BN(1.1e12), ZERO_WORD).accounts({ signer: admin.publicKey }), [admin]);
  const b4 = await newMult(extMint.publicKey);
  await sendIx(ext.methods.sync().accounts({ mMint: mMint.publicKey, extMint: extMint.publicKey, extTokenProgram: TOKEN_2022_PROGRAM_ID }), []);
  const af = await newMult(extMint.publicKey);
  console.log(`SYNC ok: M newMult=${await newMult(mMint.publicKey)}  ext newMult ${b4} -> ${af}`);
  assert(af > b4, "sync raised ext multiplier");

  // 8) UNWRAP 500_000 back to admin M
  await sendIx(ext.methods.unwrap(new BN(500_000)).accounts({
    tokenAuthority: admin.publicKey, unwrapAuthority: wrapAuth.publicKey, mMint: mMint.publicKey, extMint: extMint.publicKey,
    toMTokenAccount: adminM, fromExtTokenAccount: userExt, extTokenProgram: TOKEN_2022_PROGRAM_ID,
  }), [admin, wrapAuth]);
  const extInfo = await getMint(provider.connection, extMint.publicKey, undefined, TOKEN_2022_PROGRAM_ID);
  const vaultUi = Number(await bal(vaultM)) * (await newMult(mMint.publicKey));
  const supplyUi = Number(extInfo.supply) * (await newMult(extMint.publicKey));
  console.log(`UNWRAP ok. SOLVENCY vaultUi=${vaultUi.toFixed(2)} supplyUi=${supplyUi.toFixed(2)} margin=${(vaultUi - supplyUi).toFixed(4)}`);
  assert(vaultUi >= supplyUi - 2, "vault solvent within dust");
  console.log("\nSCAFFOLD OK ✅  full M+ext lifecycle drove the real scaled-ui program in litesvm");
}
main().then(() => process.exit(0)).catch((e) => { console.error("FAILED:", e.message || e); process.exit(1); });
