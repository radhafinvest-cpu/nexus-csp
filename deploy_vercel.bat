@echo off
title Banking App Deployer (Vercel)
echo ===================================================
echo      BANKING KIOSK APP - VERCEL DEPLOYMENT
echo ===================================================
echo.
echo 1. Syncing latest files to deployment folder...
if not exist "www" mkdir "www"
xcopy /y "index.html" "www\" >nul
xcopy /y "app.js" "www\" >nul
xcopy /y "style.css" "www\" >nul
xcopy /y "manifest.json" "www\" >nul
xcopy /y "sw.js" "www\" >nul
if exist "icons" xcopy /s /y "icons" "www\icons\" >nul
if exist "assets" xcopy /s /y "assets" "www\assets\" >nul
echo    [OK] Files synced.
echo.
echo 2. Checking for Vercel CLI...
call vercel --version >nul 2>&1
if %errorlevel% neq 0 (
    echo    Installing Vercel CLI...
    call npm install -g vercel
)
echo.
echo 3. Starting deployment to Vercel...
echo    ---------------------------------------------------
echo    INSTRUCTIONS:
echo    1. It will ask to "Log in to Vercel". Use Email or GitHub.
echo    2. "Set up and deploy?" -> Type 'Y' and Enter.
echo    3. "Which scope?" -> Press Enter (default).
echo    4. "Link to existing project?" -> Type 'N' and Enter.
echo    5. "Project name?" -> Press Enter (default).
echo    6. "In which directory?" -> Press Enter (default).
echo    7. "Want to modify settings?" -> Type 'N' and Enter.
echo    ---------------------------------------------------
echo.
call vercel ./www --prod
echo.
echo ===================================================
echo    DEPLOYMENT FINISHED!
echo    (Look for 'Production: https://...' above)
echo ===================================================
pause
