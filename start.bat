@echo off
echo Starting API Server...
start cmd /k "python -m uvicorn api.main:app"

echo Starting Next.js UI...
cd frontend
start cmd /k "npm run dev"

echo Voting Kiosk AI Verification System is starting...
echo UI will be available at http://localhost:3000
