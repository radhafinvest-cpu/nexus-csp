@echo off
setlocal
title Push to GitHub Wizard
echo ===================================================
echo      GITHUB REPO SETUP AND PUSH WIZARD
echo ===================================================
echo.

:: 1. Check/Install Git
where git >nul 2>&1
if %errorlevel% neq 0 goto InstallGit

:: 2. Check/Install GitHub CLI
where gh >nul 2>&1
if %errorlevel% neq 0 goto InstallGH

goto GitReady

:InstallGit
echo [!] Git is NOT installed. Installing via Winget...
winget install --id Git.Git -e --source winget
echo.
echo [!] Git installed. PLEASE RESTART this script (close and reopen).
pause
exit /b

:InstallGH
echo [!] GitHub CLI is NOT installed. Installing via Winget...
winget install --id GitHub.cli -e --source winget
echo.
echo [!] GitHub CLI installed. PLEASE RESTART this script (close and reopen).
pause
exit /b

:GitReady
echo [OK] Git and GitHub CLI are ready.
echo.

:: 3. Initialize Git
if exist ".git" goto Auth
echo Initializing Git repository...
git init
git branch -M main

:Auth
:: 4. Authenticate
echo.
echo ---------------------------------------------------
echo    AUTHENTICATION REQUIRED
echo    Follow the prompts to login to GitHub.
echo    Select 'GitHub.com' -> 'HTTPS' -> 'Login with browser'
echo ---------------------------------------------------
echo.
call gh auth login

:: 5. Commit Files
echo.
echo Committing files...
git add .
git commit -m "Initial commit of Banking Kiosk App"

:: 6. Create Repo and Push
echo.
echo Creating GitHub repository...
echo (You can press Enter to accept default name)
echo.
call gh repo create --source=. --public --push

echo.
echo ===================================================
echo    SUCCESS! Your code is now on GitHub.
echo ===================================================
pause
