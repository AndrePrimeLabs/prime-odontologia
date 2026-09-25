#!/usr/bin/env bash
set -euo pipefail

KEY="$HOME/.ssh/primeos_key"

if [ ! -f "$KEY" ]; then
  echo "Generating SSH key at $KEY"
  ssh-keygen -t ed25519 -f "$KEY" -C "deploy@primeos" -N ""
fi

echo "Copying public key to root@82.29.56.236 (you will be prompted for the VPS password)"
if command -v ssh-copy-id >/dev/null 2>&1; then
  ssh-copy-id -i "${KEY}.pub" root@82.29.56.236
else
  echo "ssh-copy-id not available; falling back to scp. You will still be prompted for the password."
  scp "${KEY}.pub" root@82.29.56.236:/root/primeos_key.pub
  echo "On the VPS as root run: mkdir -p /root/.ssh && cat /root/primeos_key.pub >> /root/.ssh/authorized_keys && rm /root/primeos_key.pub && chmod 700 /root/.ssh && chmod 600 /root/.ssh/authorized_keys"
fi

echo "Public key copied. Next: run the bootstrap script on the VPS as root to create the deploy user and install Docker." 

echo "Local helper finished."
