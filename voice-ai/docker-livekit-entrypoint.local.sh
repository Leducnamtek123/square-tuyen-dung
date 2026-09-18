#!/bin/sh
set -eu

: "${LIVEKIT_API_KEY:?LIVEKIT_API_KEY is required}"
: "${LIVEKIT_API_SECRET:?LIVEKIT_API_SECRET is required}"

# Local variant: disable external IP discovery (STUN) which fails inside the
# Cloud Agent VM and crash-loops the server. Voice/WebRTC is not exercised in
# the local environment, but the server still needs to boot healthy so the
# Nginx gateway dependency is satisfied.
cat > /tmp/livekit.yaml <<EOF
port: 7880
bind_addresses:
  - "0.0.0.0"
rtc:
  use_external_ip: false
  port_range_start: 50000
  port_range_end: 50100
keys:
  ${LIVEKIT_API_KEY}: ${LIVEKIT_API_SECRET}
logging:
  level: info
room:
  empty_timeout: 3600
redis:
  address: redis:6379
webhook:
  api_key: ${LIVEKIT_API_KEY}
  urls:
    - http://backend:8000/api/livekit/webhook
EOF

exec /livekit-server --config /tmp/livekit.yaml
