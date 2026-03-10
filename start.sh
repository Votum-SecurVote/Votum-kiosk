#!/bin/bash

# Start FastAPI server in the background
echo "Starting FastAPI Server..."
python -m uvicorn api.main:app &
API_PID=$!

# Start Next.js frontend
echo "Starting Next.js UI..."
cd frontend
npm run dev &
FRONTEND_PID=$!

echo "Voting Kiosk AI Verification System is running."
echo "UI: http://localhost:3000"
echo "API: http://localhost:8000"

# Trap CTRL+C to kill both services
trap "echo 'Shutting down...'; kill $API_PID $FRONTEND_PID" SIGINT

wait
