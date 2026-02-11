@echo off
title Banking App Deployer
echo ===================================================
echo      BANKING KIOSK APP - DEPLOYMENT WIZARD
echo ===================================================
echo.
echo 1. Syncing latest files to deployment folder...
if not exist "www" mkdir "www"
xcopy /y "index.html" "www\" >nul
xcopy /y "app.js" "www\" >nul
xcopy /y "style.css" "www\" >nul
xcopy /y "manifest.json" "www\" >nul
xcopy /y "sw.js" "www\" >nul
xcopy /y "CNAME" "www\" >nul
if exist "icons" xcopy /s /y "icons" "www\icons\" >nul
echo    [OK] Files synced.
echo.
echo 2. Installing deployment tool (if needed)...
call npx --version >nul 2>&1
if %errorlevel% neq 0 (
    echo Error: Node.js/npx is not installed. Please install Node.js.
    pause
    exit /b
)
echo.
echo 3. Starting deployment to Surge.sh...
echo    ---------------------------------------------------
echo    NOTE: If this is your first time, you will be asked
echo          to enter an EMAIL and creates a PASSWORD.
echo          This is for your FREE account.
echo    ---------------------------------------------------
echo.
echo    Please follow the instructions below:
echo.
call npx surge ./www
echo.
echo ===================================================
echo    DEPLOYMENT FINISHED!
echo    (If successful, your link is shown above)
echo ===================================================
pause
