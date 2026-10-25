#!/bin/sh
set -eu

if [ "$#" -ne 2 ]; then
  echo "Usage: render-config.sh TEMPLATE OUTPUT" >&2
  exit 1
fi

: "${LIVEKIT_API_KEY:?LIVEKIT_API_KEY is required}"
: "${LIVEKIT_API_SECRET:?LIVEKIT_API_SECRET is required}"

# Generated credentials use hex. Restrict characters before inserting them into YAML.
case "$LIVEKIT_API_KEY$LIVEKIT_API_SECRET" in
  *[!a-zA-Z0-9_-]*)
    echo "LiveKit credentials must contain only letters, digits, underscores, or hyphens" >&2
    exit 1
    ;;
esac
if [ "${#LIVEKIT_API_SECRET}" -lt 32 ]; then
  echo "LIVEKIT_API_SECRET must be at least 32 characters" >&2
  exit 1
fi

umask 077
sed "s/__LIVEKIT_API_KEY__/$LIVEKIT_API_KEY/g" "$1" > "$2"
printf '\nkeys:\n  "%s": "%s"\n' "$LIVEKIT_API_KEY" "$LIVEKIT_API_SECRET" >> "$2"
