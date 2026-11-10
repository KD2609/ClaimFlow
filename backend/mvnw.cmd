@echo off
setlocal
if "%JAVA_HOME%"=="" (
    set "JAVA_HOME=C:\Program Files\Java\jdk-21"
    set "PATH=%JAVA_HOME%\bin;%PATH%"
)
set MVN_BIN=C:\Users\Victus\.m2\wrapper\dists\apache-maven-3.9.16-bin\5grr65jo27hi51sujmtcldfovl\apache-maven-3.9.16\bin\mvn.cmd
if exist "%MVN_BIN%" (
    call "%MVN_BIN%" %*
) else (
    call mvn %*
)
exit /b %ERRORLEVEL%
