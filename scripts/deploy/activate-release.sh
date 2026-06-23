#!/usr/bin/env bash
# Dijalankan DI VPS oleh GitHub Actions via:
#   ssh deploy@host bash -s -- <git-sha> < scripts/deploy/activate-release.sh
# Mengaktifkan release baru secara atomik (symlink switch) dengan health check
# dan auto-rollback ke release sebelumnya bila gagal.
set -euo pipefail

SHA="${1:?usage: activate-release.sh <git-sha>}"
ROOT="/srv/nextlevel"
TARBALL="$ROOT/releases/incoming-$SHA.tar.gz"
RELEASE="$ROOT/releases/$SHA"
HEALTH_URL="http://127.0.0.1:3000/"

[ -f "$TARBALL" ] || { echo "ERROR: tarball tidak ditemukan: $TARBALL"; exit 1; }

PREV="$(readlink -f "$ROOT/current" 2>/dev/null || true)"

rm -rf "$RELEASE"
mkdir -p "$RELEASE"
tar -xzf "$TARBALL" -C "$RELEASE"
rm -f "$TARBALL"

ln -sfn "$RELEASE" "$ROOT/current"
sudo systemctl restart nextlevel

echo "Menunggu health check ($HEALTH_URL)..."
for i in $(seq 1 20); do
  sleep 3
  if curl -fsS -o /dev/null "$HEALTH_URL"; then
    echo "OK: release $SHA aktif."
    # Simpan 5 release terakhir, buang sisanya:
    ls -dt "$ROOT"/releases/*/ 2>/dev/null | tail -n +6 | xargs -r rm -rf
    exit 0
  fi
done

echo "HEALTH CHECK GAGAL — rollback ke release sebelumnya."
if [ -n "$PREV" ] && [ "$PREV" != "$RELEASE" ] && [ -d "$PREV" ]; then
  ln -sfn "$PREV" "$ROOT/current"
  sudo systemctl restart nextlevel
  echo "Rollback ke: $PREV"
else
  echo "Tidak ada release sebelumnya — service dibiarkan down untuk diagnosa."
fi
echo "Log app: sudo journalctl -u nextlevel -n 100"
exit 1