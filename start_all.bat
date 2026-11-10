@echo off
title Insurance Claim Automation - System Launcher
echo ================================================================================
echo   INSURANCE CLAIM PROCESSING AUTOMATION (RPA & OPERATIONS RESEARCH)
echo   Launching All Three System Microservices on Windows 11...
echo ================================================================================

REM 1. Start Python Simulation Microservice (Port 8000)
echo [1/3] Launching Python SimPy Discrete-Event Simulation Service (Port 8000)...
start "ClaimFlow - Simulation Engine (8000)" cmd /k "%~dp0start_simulation.bat"

REM 2. Start Spring Boot Backend (Port 8080)
echo [2/3] Launching Spring Boot REST API & Security Engine (Port 8080)...
start "ClaimFlow - Backend API (8080)" cmd /k "%~dp0start_backend.bat"

REM 3. Start Frontend Dashboard (Port 5173)
echo [3/3] Launching React Vite Web Application (Port 5173)...
start "ClaimFlow - React Frontend (5173)" cmd /k "%~dp0start_frontend.bat"

echo ================================================================================
echo   All services launched!
echo   Frontend Dashboard: http://localhost:5173
echo   Spring Boot API:    http://localhost:8080/api/dashboard/stats
echo   Python SimPy API:   http://localhost:8000/docs
echo.
echo   Login: Use the admin or processor password configured for this environment.
echo ================================================================================
timeout /t 5 >nul
start http://localhost:5173

