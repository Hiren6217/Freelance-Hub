@echo off
REM ============================================================
REM  Start the local FreelanceHub MySQL 8.4 server (persistent).
REM  No Windows service / admin rights needed - runs mysqld
REM  directly against a project-local data directory.
REM  Leave this window open while developing. Ctrl+C to stop.
REM ============================================================
setlocal

REM --- Adjust this if your MySQL 8.4 is installed elsewhere ---
set "MYSQL_HOME=C:\Program Files\MySQL\MySQL Server 8.4"

set "DATADIR=%~dp0mysql-data"
set "INITSQL=%~dp0mysql\init.sql"

if not exist "%MYSQL_HOME%\bin\mysqld.exe" (
  echo [ERROR] mysqld.exe not found at "%MYSQL_HOME%".
  echo         Edit MYSQL_HOME at the top of this script.
  pause
  exit /b 1
)

if not exist "%DATADIR%\mysql\" (
  echo Initializing fresh MySQL data directory at "%DATADIR%" ...
  "%MYSQL_HOME%\bin\mysqld.exe" --initialize-insecure --datadir="%DATADIR%"
  if errorlevel 1 (
    echo [ERROR] MySQL initialization failed.
    pause
    exit /b 1
  )
)

echo Starting MySQL on port 3306 (data: %DATADIR%) ...
"%MYSQL_HOME%\bin\mysqld.exe" --datadir="%DATADIR%" --port=3306 --init-file="%INITSQL%" --console

endlocal
