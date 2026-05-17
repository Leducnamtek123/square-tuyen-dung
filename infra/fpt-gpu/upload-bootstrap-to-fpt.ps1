param(
  [Parameter(Mandatory = $true)]
  [string]$HostName,

  [int]$Port = 22,

  [string]$User = "root",

  [string]$KeyPath = "$env:USERPROFILE\.ssh\square_ai_fpt_gpu_rsa"
)

$ErrorActionPreference = "Stop"

$sshOptions = @("-o", "StrictHostKeyChecking=accept-new", "-o", "ServerAliveInterval=30")

ssh @sshOptions -p $Port -i $KeyPath "${User}@${HostName}" "mkdir -p /models/square-ai"
scp @sshOptions -P $Port -i $KeyPath .\infra\fpt-gpu\bootstrap-square-ai.sh "${User}@${HostName}:/models/bootstrap-square-ai.sh"
scp @sshOptions -P $Port -i $KeyPath .\voice-ai\inference\vieneu-text-to-speech\api.py "${User}@${HostName}:/models/square-ai/tts_api.py"
ssh @sshOptions -p $Port -i $KeyPath "${User}@${HostName}" "chmod +x /models/bootstrap-square-ai.sh && bash /models/bootstrap-square-ai.sh"
