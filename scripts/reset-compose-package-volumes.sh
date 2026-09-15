#!/usr/bin/env bash
# Remove stale Compose node_modules / Next cache volumes only.
# Never deletes postgres_data or minio_data (use this instead of `docker compose down -v`).
set -euo pipefail

root="$(cd "$(dirname "$0")/.." && pwd)"
cd "$root"

cache_volumes=(
	backend_node_modules
	backend_pkg_node_modules
	contracts_node_modules
	frontend_node_modules
	frontend_pkg_node_modules
	contracts_frontend_node_modules
	frontend_next
)

docker compose down

project="${COMPOSE_PROJECT_NAME:-$(basename "$root")}"

for name in "${cache_volumes[@]}"; do
	volume="${project}_${name}"
	if docker volume inspect "$volume" >/dev/null 2>&1; then
		docker volume rm "$volume"
		echo "removed ${volume}"
	else
		echo "skip missing ${volume}"
	fi
done
