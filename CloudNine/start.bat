@echo off
title CloudNine Launcher
color 0A
echo =======================================================================
echo          AIRX - CLOUDNINE AIRFARE PLATFORM LAUNCHER
echo =======================================================================
echo.
echo Starting Backend API (FastAPI) on http://localhost:8000 ...
echo Starting Frontend Web Dashboard (React) on http://localhost:3000 ...
echo.

:: Launch Backend Server in a new window
start "CloudNine Backend API" cmd /k "cd /d %~dp0App\backend && python server.py"

:: Launch Frontend Web App in a new window
start "CloudNine Frontend Web App" cmd /k "cd /d %~dp0App\frontend && npm start"

echo =======================================================================
echo Both servers are launching in separate console windows!
echo Backend:  http://localhost:8000
echo Frontend: http://localhost:3000
echo =======================================================================
