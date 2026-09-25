#!/usr/bin/env bash
set -euo pipefail

# Usage: run as root on the VPS (or via sudo)
# This script creates a deploy user, installs Docker and docker compose plugin,
# clones the repo to /opt/primeos and ensures a docker network named 'traefik'.

username=deploy

if id -u "$username" >/dev/null 2>&1; then
  echo "User $username already exists"
else
  echo "Creating user $username"
  adduser --gecos "" "$username"
  usermod -aG sudo "$username"
fi

mkdir -p /home/"$username"/.ssh
chown "$username":"$username" /home/"$username"/.ssh

# If public key was copied to /root/primeos_key.pub (via scp fallback), install it
if [ -f /root/primeos_key.pub ]; then
  echo "Installing public key from /root/primeos_key.pub into $username authorized_keys"
  cat /root/primeos_key.pub >> /home/"$username"/.ssh/authorized_keys
  chown "$username":"$username" /home/"$username"/.ssh/authorized_keys
  chmod 700 /home/"$username"/.ssh
  chmod 600 /home/"$username"/.ssh/authorized_keys
  rm -f /root/primeos_key.pub
else
  echo "No /root/primeos_key.pub file found. You may paste a public key for the $username user now (Ctrl-D to finish):"
  su - "$username" -s /bin/bash -c 'cat >> ~/.ssh/authorized_keys'
  su - "$username" -s /bin/bash -c 'chmod 700 ~/.ssh && chmod 600 ~/.ssh/authorized_keys'
fi

# Install Docker (Ubuntu 24.04 compatible non-interactive steps)
apt update
apt install -y ca-certificates curl gnupg lsb-release
mkdir -p /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | gpg --dearmor -o /etc/apt/keyrings/docker.gpg
echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" \
  | tee /etc/apt/sources.list.d/docker.list > /dev/null
apt update
apt install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin
systemctl enable --now docker

# Prepare repo and clone as deploy user
mkdir -p /opt && chown "$username":"$username" /opt
su - "$username" -c 'cd /opt && (git clone https://github.com/PrimeOsHub/primeos.git primeos || (cd primeos && git pull origin main))'

# Ensure traefik network exists
if ! docker network ls | grep -q traefik; then
  docker network create traefik
fi

echo "Bootstrap complete. As $username: cd /opt/primeos && docker compose up -d --build"
