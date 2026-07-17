#!/usr/bin/env bash
set -e
cd "$HOME"
mkdir -p "$HOME/bin"
if [ ! -x "$HOME/bin/micromamba" ]; then
  echo "== download micromamba tar.bz2 =="
  curl -Ls https://micro.mamba.pm/api/micromamba/linux-64/latest -o /tmp/mm.tar.bz2
  echo "== extract via python bz2/tarfile =="
  python3 - <<'PY'
import bz2, tarfile, io, os
data = bz2.decompress(open("/tmp/mm.tar.bz2","rb").read())
tf = tarfile.open(fileobj=io.BytesIO(data))
m = tf.extractfile("bin/micromamba").read()
os.makedirs(os.path.expanduser("~/bin"), exist_ok=True)
p = os.path.expanduser("~/bin/micromamba")
open(p,"wb").write(m); os.chmod(p, 0o755)
print("micromamba extracted:", len(m), "bytes")
PY
fi
"$HOME/bin/micromamba" --version
export MAMBA_ROOT_PREFIX="$HOME/mmroot"
echo "== create compiler env (gcc gxx make) =="
"$HOME/bin/micromamba" create -y -p "$HOME/ctool" -c conda-forge gcc gxx make >/tmp/mm.log 2>&1 || { tail -25 /tmp/mm.log; exit 1; }
echo "== bins =="; ls "$HOME/ctool/bin" | grep -E "gcc$|g\+\+$|^make$|-gcc$|-g\+\+$" | head
echo "DONE"
