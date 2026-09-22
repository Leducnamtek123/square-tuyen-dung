@echo off
title InfoHR Real-Time Talking Head Lipsync Engine
cd /d "%~dp0"
echo ==========================================================
echo   Khoi chay InfoHR Real-Time Talking Head Lipsync Engine  
echo   Port: 8010 ^| GPU: NVIDIA RTX 4070 Ti
echo ==========================================================
python -m uvicorn server:app --host 0.0.0.0 --port 8010 --reload
pause
