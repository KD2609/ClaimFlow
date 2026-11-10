@echo off
title Insurance Claim Automation - SimPy Simulation Engine (Port 8000)
echo ================================================================================
echo   STARTING OPERATIONS RESEARCH SIMULATION SERVICE (FASTAPI & SIMPY)
echo   Listening on http://localhost:8000
echo ================================================================================
cd /d "%~dp0simulation-engine"

REM Activate Python virtual environment if present
if exist "venv\Scripts\activate.bat" (
    echo Activating local Python virtual environment (venv)...
    call venv\Scripts\activate.bat
)

echo Starting Uvicorn FastAPI Server on port 8000...
python -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload
if %ERRORLEVEL% neq 0 (
    echo.
    echo [ERROR] Simulation server stopped or failed to launch.
    echo If missing dependencies, run: pip install -r requirements.txt
    pause
)
