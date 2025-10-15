@echo off
REM Script untuk akses MySQL Database IPBB

echo ========================================
echo MySQL Database Access - IPBB Project
echo ========================================
echo.

echo Pilihan:
echo 1. Akses sebagai ipbb_user
echo 2. Akses sebagai root
echo 3. Lihat semua tabel
echo 4. Lihat data ipbb_user
echo 5. Lihat data SPPT
echo 6. Export database
echo 7. Import SQL file
echo.

set /p choice="Pilih opsi (1-7): "

if "%choice%"=="1" (
    echo.
    echo Connecting sebagai ipbb_user...
    docker exec -it ipbb-mysql mysql -uipbb_user -pipbb_password ipbb
) else if "%choice%"=="2" (
    echo.
    echo Connecting sebagai root...
    docker exec -it ipbb-mysql mysql -uroot -proot_password ipbb
) else if "%choice%"=="3" (
    echo.
    echo Daftar semua tabel di database ipbb:
    echo ----------------------------------------
    docker exec ipbb-mysql mysql -uipbb_user -pipbb_password ipbb -e "SHOW TABLES;"
    echo.
    pause
) else if "%choice%"=="4" (
    echo.
    echo Data user (10 baris pertama):
    echo ----------------------------------------
    docker exec ipbb-mysql mysql -uipbb_user -pipbb_password ipbb -e "SELECT * FROM ipbb_user LIMIT 10;"
    echo.
    pause
) else if "%choice%"=="5" (
    echo.
    echo Data SPPT (10 baris pertama):
    echo ----------------------------------------
    docker exec ipbb-mysql mysql -uipbb_user -pipbb_password ipbb -e "SELECT * FROM sppt LIMIT 10;"
    echo.
    pause
) else if "%choice%"=="6" (
    echo.
    set /p filename="Nama file output (tanpa .sql): "
    echo Exporting database ke %filename%.sql...
    docker exec ipbb-mysql mysqldump -uroot -proot_password ipbb > %filename%.sql
    echo Export selesai!
    echo.
    pause
) else if "%choice%"=="7" (
    echo.
    set /p sqlfile="Nama file SQL yang akan diimport: "
    echo Importing %sqlfile% ke database...
    type %sqlfile% | docker exec -i ipbb-mysql mysql -uroot -proot_password ipbb
    echo Import selesai!
    echo.
    pause
) else (
    echo Pilihan tidak valid!
    pause
)
