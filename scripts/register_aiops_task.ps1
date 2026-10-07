$pythonPath = (Get-Command pythonw.exe).Source
$action = New-ScheduledTaskAction -Execute $pythonPath -Argument "C:\Users\WIN10\Documents\square-tuyen-dung\scripts\aiops_bot.py" -WorkingDirectory "C:\Users\WIN10\Documents\square-tuyen-dung"
$trigger = New-ScheduledTaskTrigger -AtLogOn
$settings = New-ScheduledTaskSettingsSet -AllowStartIfOnBatteries -DontStopIfGoingOnBatteries -RestartCount 5 -RestartInterval (New-TimeSpan -Minutes 1) -ExecutionTimeLimit (New-TimeSpan -Days 365)
Register-ScheduledTask -TaskName "InfoHR_AIOps_Agent" -Action $action -Trigger $trigger -Settings $settings -Force
Start-ScheduledTask -TaskName "InfoHR_AIOps_Agent"
Write-Host "✅ Scheduled Task 'InfoHR_AIOps_Agent' registered with pythonw (Headless Background) & started successfully!"
