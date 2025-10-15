# Panduan Setup dan Menjalankan Project IPBB

## ✅ Setup Berhasil Dilakukan

Project IPBB sudah berhasil dikonfigurasi dan berjalan dengan:
- ✅ Docker Compose dengan MySQL 8.0
- ✅ Backend FastAPI dengan Python 3.12
- ✅ Frontend Next.js 15
- ✅ Database ipbb_new.sql sudah diimport ke MySQL
- ✅ Semua service terhubung dan berjalan

## 🎯 Akses Aplikasi

Aplikasi dapat diakses di:

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **API Documentation**: http://localhost:8000/docs
- **Redoc Documentation**: http://localhost:8000/redoc
- **phpMyAdmin**: http://localhost:8080 (MySQL Web Manager) ✨

## 🗄️ Informasi Database MySQL

- **Host**: localhost
- **Port**: 3306
- **Database**: ipbb
- **Username**: ipbb_user
- **Password**: ipbb_password
- **Root Password**: root_password

### Cara Akses MySQL

**Opsi 1: phpMyAdmin (Paling Mudah) ✨**
- Buka browser: http://localhost:8080
- Login dengan:
  - **Username**: `root`
  - **Password**: `root_password`
- Pilih database **ipbb**

**Opsi 2: Command Line**
```powershell
# Akses MySQL menggunakan docker exec
docker exec -it ipbb-mysql mysql -uipbb_user -pipbb_password ipbb

# Atau menggunakan root
docker exec -it ipbb-mysql mysql -uroot -proot_password ipbb
```

**Opsi 3: MySQL Workbench/DBeaver**
- Host: `localhost` atau `127.0.0.1`
- Port: `3306`
- Database: `ipbb`
- Username: `ipbb_user`
- Password: `ipbb_password`

## 🚀 Cara Menjalankan Aplikasi

### Pertama Kali (Build dan Run)

```powershell
# Masuk ke direktori project
cd d:\Project\ipbb

# Build dan jalankan semua container
docker-compose up --build -d
```

### Selanjutnya (Tanpa Build Ulang)

```powershell
# Jalankan container yang sudah ada
docker-compose up -d
```

### Menggunakan Script Helper (Windows)

```powershell
# Jalankan script helper
.\start-docker.bat
```

## 🛠️ Perintah Docker Compose Berguna

### Melihat Status Container

```powershell
docker-compose ps
```

### Melihat Log

```powershell
# Semua service
docker-compose logs -f

# Backend saja
docker logs ipbb-backend -f

# Frontend saja
docker logs ipbb-frontend -f

# MySQL saja
docker logs ipbb-mysql -f
```

### Menghentikan Aplikasi

```powershell
# Hentikan container (data tetap tersimpan)
docker-compose down

# Hentikan dan hapus semua data (termasuk database)
docker-compose down -v
```

### Restart Container Tertentu

```powershell
# Restart backend
docker-compose restart backend

# Restart frontend
docker-compose restart frontend

# Restart MySQL
docker-compose restart mysql
```

### Rebuild Container

```powershell
# Rebuild semua
docker-compose up --build -d

# Rebuild backend saja
docker-compose up --build -d backend

# Rebuild frontend saja
docker-compose up --build -d frontend
```

## 🔧 Troubleshooting

### Backend tidak bisa connect ke MySQL

1. Cek apakah MySQL sudah ready:
```powershell
docker logs ipbb-mysql
```

2. Restart backend container:
```powershell
docker-compose restart backend
```

### Port sudah digunakan

Jika port 3000, 8000, atau 3306 sudah digunakan, edit file `docker-compose.yml` dan ubah port mapping:

```yaml
ports:
  - "3001:3000"  # Ubah 3000 ke 3001 untuk frontend
  - "8001:8000"  # Ubah 8000 ke 8001 untuk backend
  - "3307:3306"  # Ubah 3306 ke 3307 untuk MySQL
```

### Database tidak ada data

Jika database kosong, pastikan file `ipbb_new.sql` ada di root project. Kemudian:

```powershell
# Hapus volume dan rebuild
docker-compose down -v
docker-compose up --build -d
```

### Backend error saat startup

Cek log detail:
```powershell
docker logs ipbb-backend --tail 200
```

### Frontend tidak bisa connect ke backend

1. Pastikan backend berjalan:
```powershell
curl http://localhost:8000/docs
```

2. Cek environment variable frontend:
```powershell
docker exec ipbb-frontend env | findstr API
```

## 📝 File Konfigurasi Penting

### Backend (.env)
File: `backend/.env`
- Konfigurasi database
- Secret keys
- Email settings
- CORS settings

### Frontend (.env.local)
File: `frontend/.env.local`
- API base URL

### Docker Compose
File: `docker-compose.yml`
- Konfigurasi semua service
- Network settings
- Volume settings

## 🔄 Update Aplikasi

### Update Backend

```powershell
# Rebuild backend
docker-compose up --build -d backend
```

### Update Frontend

```powershell
# Rebuild frontend
docker-compose up --build -d frontend
```

### Update Database Schema (Migrasi)

```powershell
# Masuk ke backend container
docker exec -it ipbb-backend bash

# Jalankan migrasi
uv run alembic upgrade head

# Keluar
exit
```

## 📊 Monitoring

### Cek Resource Usage

```powershell
# Cek CPU dan Memory usage
docker stats
```

### Cek Disk Usage

```powershell
# Cek ukuran image dan volume
docker system df
```

## 🧹 Cleanup

### Hapus Container dan Volume

```powershell
# Hentikan dan hapus semua
docker-compose down -v

# Hapus image yang tidak terpakai
docker image prune -a
```

## 📞 Support

Jika mengalami masalah:
1. Cek log dengan `docker-compose logs -f`
2. Pastikan Docker Desktop berjalan
3. Pastikan port tidak konflik
4. Cek file .env sudah benar

## ⚡ Tips

1. **Development Mode**: Container menggunakan volume mount, jadi perubahan code langsung ter-reload
2. **Hot Reload**: 
   - Backend: FastAPI dev server otomatis reload
   - Frontend: Next.js turbopack otomatis reload
3. **Database Persistence**: Data MySQL tersimpan di volume `mysql_data`, tidak akan hilang saat container dihapus (kecuali dengan `docker-compose down -v`)
4. **View Logs in Real-time**: Gunakan `docker-compose logs -f` untuk melihat log semua service secara real-time

## 🎉 Selamat!

Aplikasi IPBB sudah berjalan dengan sukses di http://localhost:3000

Happy coding! 🚀
