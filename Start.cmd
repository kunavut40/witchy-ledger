@echo off
setlocal
cd /d "%~dp0"
set "LEDGER_NODE="
for /f "delims=" %%I in ('where node.exe 2^>nul') do if not defined LEDGER_NODE set "LEDGER_NODE=%%I"
if not defined LEDGER_NODE if exist "%~dp0runtime\node.exe" set "LEDGER_NODE=%~dp0runtime\node.exe"
if not defined LEDGER_NODE if exist "%ProgramFiles%\nodejs\node.exe" set "LEDGER_NODE=%ProgramFiles%\nodejs\node.exe"
if not defined LEDGER_NODE if exist "%LocalAppData%\Programs\nodejs\node.exe" set "LEDGER_NODE=%LocalAppData%\Programs\nodejs\node.exe"
if not defined LEDGER_NODE if exist "%USERPROFILE%\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe" set "LEDGER_NODE=%USERPROFILE%\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe"
if not defined LEDGER_NODE goto missing_node
if not exist "%~dp0dist\index.html" goto missing_app
echo Starting Witchy Ledger...
echo Node: "%LEDGER_NODE%"
"%LEDGER_NODE%" "%~dp0serve.mjs"
goto finished
:missing_node
echo Node.js was not found. This app needs Node.js 22 or newer.
echo Install Node.js, then reopen Start.cmd.
goto finished
:missing_app
echo App files are missing. Extract the entire ZIP before opening Start.cmd.
:finished
pause
endlocal
