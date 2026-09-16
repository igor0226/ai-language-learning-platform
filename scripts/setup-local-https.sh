#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
CERT_DIR="$ROOT/certs"

if ! command -v mkcert >/dev/null 2>&1; then
	echo "mkcert is required. Install it with:"
	echo "  brew install mkcert nss"
	echo "  mkcert -install"
	exit 1
fi

mkdir -p "$CERT_DIR"
mkcert -install
mkcert -cert-file "$CERT_DIR/llp.test.pem" -key-file "$CERT_DIR/llp.test-key.pem" \
	"app.llp.test" "media.llp.test"

echo
echo "Certificates written to $CERT_DIR"
echo
echo "Add these lines to /etc/hosts (requires sudo):"
echo "127.0.0.1 app.llp.test media.llp.test"
echo "::1       app.llp.test media.llp.test"
echo
echo "Then start the stack: docker compose up --build"
echo "App: https://app.llp.test  (UI + /api on the same origin)"
