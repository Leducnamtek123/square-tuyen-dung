param(
  [Parameter(Mandatory = $true)]
  [string]$HostName,

  [int]$Port = 22,

  [string]$User = "root",

  [string]$KeyPath = "$env:USERPROFILE\.ssh\square_ai_fpt_gpu_rsa"
)

$ErrorActionPreference = "Stop"

scp -P $Port -i $KeyPath .\infra\fpt-gpu\bootstrap-square-ai.sh "${User}@${HostName}:/models/bootstrap-square-ai.sh"
ssh -p $Port -i $KeyPath "${User}@${HostName}" "chmod +x /models/bootstrap-square-ai.sh && bash /models/bootstrap-square-ai.sh"
