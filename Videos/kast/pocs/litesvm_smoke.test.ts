import { LiteSVM } from "litesvm";
import { PublicKey, Keypair, Transaction, SystemProgram } from "@solana/web3.js";
import * as path from "path";

test("litesvm loads scaled-ui(ext_b) + no-yield(ext_a) + earn + token2022; base runtime works", () => {
  const svm = new LiteSVM();
  const dir = path.join(__dirname, "..", "programs");
  const progs: [string, string][] = [
    ["HSMnbWEkB7sEQAGSzBPeACNUCXC9FgNeeESLnHtKfoy3", "ext_b.so"], // scaled-ui (USDKY variant)
    ["3joDhmLtHLrSBGfeAe1xQiv3gjikes3x8S4N3o6Ld8zB", "ext_a.so"], // no-yield  (USDK variant)
    ["mz2vDzjbQDUDXBH6FPF5s4odCJ4y8YLE5QWaZ8XdZ9Z", "earn.so"],
  ];
  for (const [id, f] of progs) {
    const pk = new PublicKey(id);
    svm.addProgramFromFile(pk, path.join(dir, f));
    const acct = svm.getAccount(pk);
    expect(acct).not.toBeNull();
    expect(acct!.executable).toBe(true);
    console.log(`  loaded ${f.padEnd(9)} @ ${id}  executable=${acct!.executable} len=${acct!.data.length}`);
  }
  // sanity: fund an account and confirm the SVM runtime executes a real tx
  const payer = new Keypair();
  svm.airdrop(payer.publicKey, BigInt(2_000_000_000));
  const dest = new Keypair();
  const tx = new Transaction();
  tx.recentBlockhash = svm.latestBlockhash();
  tx.feePayer = payer.publicKey;
  tx.add(SystemProgram.transfer({ fromPubkey: payer.publicKey, toPubkey: dest.publicKey, lamports: 1_000_000 }));
  tx.sign(payer);
  svm.sendTransaction(tx);
  const bal = svm.getBalance(dest.publicKey);
  console.log(`  runtime tx ok: dest balance = ${bal}`);
  expect(bal).toBe(BigInt(1_000_000));
});
