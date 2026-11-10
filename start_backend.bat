@echo off
title Insurance Claim Automation - Spring Boot Backend (Port 8080)
echo ================================================================================
echo   STARTING INSURANCE CLAIM AUTOMATION BACKEND (SPRING BOOT 3.3.4)
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

REM Check if target JAR exists; if not, compile
if not exist "target\insurance-claim-automation-1.0.0.jar" (
    echo Building backend JAR package...
    call mvnw.cmd clean package -DskipTests
)

echo Launching Spring Boot server with Dev profile (H2 PostgreSQL Compatibility Mode)...
set "SPRING_PROFILES_ACTIVE=dev"
java -Dspring.profiles.active=dev -jar target\insurance-claim-automation-1.0.0.jar
pause
