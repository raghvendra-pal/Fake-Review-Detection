@echo off
echo Starting TrustLens Backend Server on http://127.0.0.1:8000 ...
.\backend\venv\Scripts\python.exe -m uvicorn backend.main:app --host 127.0.0.1 --port 8000 --reload
pause
