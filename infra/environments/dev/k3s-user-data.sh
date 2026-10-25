#!/bin/bash
set -euxo pipefail

if ! swapon --show | grep -q /swapfile; then
  fallocate -l 1G /swapfile
  chmod 600 /swapfile
  mkswap /swapfile
  swapon /swapfile
  echo '/swapfile none swap sw 0 0' >> /etc/fstab
fi

curl -sfL https://get.k3s.io | INSTALL_K3S_VERSION="v1.36.5+k3s1" sh -s - server \
  --disable traefik \
  --tls-san 127.0.0.1 \
  --write-kubeconfig-mode 644

aws ssm put-parameter \
  --region eu-north-1 \
  --name /llp/dev/kubeconfig \
  --type SecureString \
  --overwrite \
  --value "file:///etc/rancher/k3s/k3s.yaml"
