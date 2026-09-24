@echo off
REM ============================================================
REM  Start the FreelanceHub Spring Boot backend on Java 25.
REM  Uses the bundled Maven and sets the MySQL password so the
REM  app connects to the local MySQL started by start-mysql.cmd.
REM  Backend listens on http://localhost:8080
REM ============================================================
setlocal

REM --- Adjust this if your JDK 25 is installed elsewhere ---
set "JAVA_HOME=C:\Program Files\Java\jdk-25.0.2"
set "PATH=%JAVA_HOME%\bin;%PATH%"

REM --- Datasource credentials (match application.yml / init.sql) ---
set "SPRING_DATASOURCE_PASSWORD=root"

REM --- PayPal sandbox credentials (get from https://developer.paypal.com) ---
REM Fill these in to enable live payments; leave blank to run without them
REM (create-order then returns HTTP 503). Never commit real values.
set "PAYPAL_CLIENT_ID="
set "PAYPAL_CLIENT_SECRET="

if not exist "%JAVA_HOME%\bin\java.exe" (
  echo [ERROR] JDK 25 not found at "%JAVA_HOME%".
  echo         Edit JAVA_HOME at the top of this script.
  pause
  exit /b 1
)

echo Using Java from: %JAVA_HOME%
"%~dp0apache-maven-3.9.9\bin\mvn.cmd" -f "%~dp0pom.xml" spring-boot:run

endlocal
