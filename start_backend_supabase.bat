@echo off
title Insurance Claim Automation - Spring Boot Backend (Supabase PostgreSQL)
echo ================================================================================
echo   STARTING INSURANCE CLAIM AUTOMATION BACKEND (SUPABASE POSTGRESQL)
echo   Listening on http://localhost:8080
echo ================================================================================

REM Auto-detect Java 21 if JAVA_HOME is not explicitly set
if not defined JAVA_HOME (
    if exist "C:\Program Files\Java\jdk-21" (
        set "JAVA_HOME=C:\Program Files\Java\jdk-21"
    )
)
if defined JAVA_HOME (
    set "PATH=%JAVA_HOME%\bin;%PATH%"
)

cd /d "%~dp0backend"

REM Load .env from project root if it exists
if exist "..\.env" (
    echo Loading environment variables from .env...
    for /f "usebackq tokens=1,* delims==" %%A in ("..\.env") do (
        if not "%%A"=="" (
            set "%%A=%%B"
        )
    )
)

if not defined SPRING_DATASOURCE_PASSWORD (
    echo [ERROR] SPRING_DATASOURCE_PASSWORD is not set!
    echo Please create a .env file in the project root or set the environment variable.
    echo See .env.example for reference.
    pause
    exit /b 1
)

REM Check if target JAR exists; if not, compile
if not exist "target\insurance-claim-automation-1.0.0.jar" (
    echo Building backend JAR package...
    call mvnw.cmd clean package -DskipTests
)

echo Launching Spring Boot server with Postgres profile (Supabase PostgreSQL)...
java -Dspring.profiles.active=postgres -jar target\insurance-claim-automation-1.0.0.jar
pause

