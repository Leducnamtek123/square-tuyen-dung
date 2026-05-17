#!/bin/sh
set -eu

: "${LIVEKIT_API_KEY:?LIVEKIT_API_KEY is required}"
: "${LIVEKIT_API_SECRET:?LIVEKIT_API_SECRET is required}"

cat > /tmp/egress.yaml <<EOF
api_key: ${LIVEKIT_API_KEY}
api_secret: ${LIVEKIT_API_SECRET}
ws_url: ws://livekit:7880
redis:
  address: "redis:6379"
EOF

export EGRESS_CONFIG_FILE=/tmp/egress.yaml
exec /entrypoint.sh
