@echo off
echo ========================================
echo Testing Google OAuth Flow
echo ========================================
echo.

echo Step 1: Get OAuth URL from backend
echo ========================================
curl -s http://localhost:8000/auth/oauth/google/redirect -w "%%{redirect_url}" -o nul
echo.
echo.

echo Step 2: Manual Test
echo ========================================
echo 1. Copy URL di atas
echo 2. Paste di browser (Incognito)
echo 3. Login dengan Google
echo 4. Lihat hasilnya
echo.

echo Step 3: Check logs
echo ========================================
echo Buka terminal lain dan jalankan:
echo docker logs ipbb-backend -f
echo.

pause
