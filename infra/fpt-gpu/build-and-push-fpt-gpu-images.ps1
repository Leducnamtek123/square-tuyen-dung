param(
  [Parameter(Mandatory = $true)]
  [string]$Registry
)

$ErrorActionPreference = "Stop"

$registry = $Registry.TrimEnd("/")
if ($registry -notmatch "^registry\.fke\.fptcloud\.com/.+") {
  throw "Registry must look like registry.fke.fptcloud.com/<registry-name>"
}

docker build -t "$registry/square-whisper:latest" .\voice-ai\inference\whisper
docker push "$registry/square-whisper:latest"

docker build -t "$registry/square-vieneu-tts:latest" .\voice-ai\inference\vieneu-text-to-speech
docker push "$registry/square-vieneu-tts:latest"
