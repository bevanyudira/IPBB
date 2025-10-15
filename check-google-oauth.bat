@echo off
echo ========================================
echo Google OAuth Configuration Checker
echo ========================================
echo.

echo Checking Backend Configuration...
echo ========================================
echo.

echo Backend .env file:
echo Client ID:
findstr "GOOGLE_CLIENT_ID" backend\.env
echo.
echo Client Secret (first 20 chars):
findstr "GOOGLE_CLIENT_SECRET" backend\.env
echo.

echo ========================================
echo Expected Configuration in Google Console:
echo ========================================
echo.
echo Authorized JavaScript origins:
echo   - http://localhost:3000
echo   - http://localhost:8000
echo.
echo Authorized redirect URIs (MUST HAVE BOTH):
echo   - http://localhost:8000/auth/oauth/google/callback
echo   - http://localhost:3000/auth/oauth/google/callback
echo.

echo ========================================
echo Testing Backend Status...
echo ========================================
curl -s http://localhost:8000/docs ^| findstr "html" >nul 2>&1
if %errorlevel% equ 0 (
    echo Backend: RUNNING
) else (
    echo Backend: NOT RUNNING
)
echo.

echo ========================================
echo Next Steps:
echo ========================================
echo 1. Open Google Console: https://console.cloud.google.com/apis/credentials
echo 2. Click your OAuth Client name
echo 3. Verify BOTH redirect URIs are there EXACTLY as shown above
echo 4. Click SAVE if you made changes
echo 5. Wait 2-3 minutes
echo 6. Try login again
echo.

pause
