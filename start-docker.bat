@echo off
echo ========================================
echo Starting IPBB Project with Docker
echo ========================================
echo.

echo Checking if Docker is running...
docker info >nul 2>&1
if errorlevel 1 (
    echo ERROR: Docker is not running. Please start Docker Desktop first.
    pause
    exit /b 1
)

echo Docker is running!
echo.

echo Building and starting containers...
docker-compose up --build -d

echo.
echo Waiting for services to be ready...
timeout /t 10 /nobreak >nul

echo.
echo ========================================
echo Services Status:
echo ========================================
docker-compose ps

echo.
echo ========================================
echo Access your application:
echo ========================================
echo Frontend: http://localhost:3000
echo Backend API: http://localhost:8000
echo API Docs: http://localhost:8000/docs
echo phpMyAdmin: http://localhost:8080 (root/root_password)
echo MySQL: localhost:3306
echo   Database: ipbb
echo   User: ipbb_user
echo   Password: ipbb_password
echo ========================================
echo.

echo To view logs: docker-compose logs -f
echo To stop: docker-compose down
echo.

pause
