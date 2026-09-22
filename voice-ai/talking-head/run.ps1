# Script khởi chạy dịch vụ Lipsync GPU Talking Head
param(
  [int]$Port = 8010,
  [string]$HostIP = "0.0.0.0"
)

$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $ScriptDir

Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "  Khoi chay InfoHR Real-Time Talking Head Lipsync Engine  " -ForegroundColor Green
Write-Host "  Port: $Port | Host: $HostIP | GPU: NVIDIA RTX 4070 Ti  " -ForegroundColor Yellow
Write-Host "==========================================================" -ForegroundColor Cyan

python -m uvicorn server:app --host $HostIP --port $Port --reload
