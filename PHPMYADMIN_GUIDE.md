# 🎉 phpMyAdmin Berhasil Ditambahkan!

## ✅ Akses phpMyAdmin

**URL**: http://localhost:8080

### 🔐 Login Credentials:

**Opsi 1 - Root User (Recommended):**
```
Server:   mysql
Username: root
Password: root_password
```

**Opsi 2 - Regular User:**
```
Server:   mysql
Username: ipbb_user
Password: ipbb_password
```

## 📊 Port Summary - Semua Service

| Service | URL | Port | Keterangan |
|---------|-----|------|------------|
| **Frontend** | http://localhost:3000 | 3000 | Next.js Web App |
| **Backend API** | http://localhost:8000 | 8000 | FastAPI Backend |
| **API Docs** | http://localhost:8000/docs | 8000 | Swagger UI |
| **phpMyAdmin** | http://localhost:8080 | 8080 | MySQL Web Manager ✨ NEW! |
| **MySQL** | localhost:3306 | 3306 | MySQL Database Server |

## 🎯 Cara Menggunakan phpMyAdmin

### 1. **Buka Browser**
```
http://localhost:8080
```

### 2. **Login**
- **Server**: `mysql` (sudah terisi otomatis)
- **Username**: `root`
- **Password**: `root_password`
- Klik **Go** atau **Login**

### 3. **Kelola Database**
- Pilih database **ipbb** di sidebar kiri
- Lihat semua tabel
- Browse data
- Edit data
- Export/Import
- Jalankan SQL queries

## 🔧 Fitur phpMyAdmin

✅ **Browse Data**: Lihat data di semua tabel
✅ **Search**: Cari data di database
✅ **Insert/Edit/Delete**: Kelola data lewat UI
✅ **SQL Query**: Jalankan custom SQL
✅ **Export**: Export database ke SQL, CSV, Excel, dll
✅ **Import**: Import file SQL
✅ **Structure**: Lihat dan edit struktur tabel
✅ **Users**: Kelola user MySQL
✅ **Privileges**: Atur permission

## 📋 Contoh Penggunaan

### Lihat Data SPPT
1. Login ke phpMyAdmin
2. Klik database **ipbb** di sidebar kiri
3. Klik tabel **sppt**
4. Lihat data di tab "Browse"

### Jalankan Custom Query
1. Klik tab **SQL** di atas
2. Ketik query, contoh:
```sql
SELECT * FROM sppt WHERE nop LIKE '64%' LIMIT 10;
```
3. Klik **Go**

### Export Database
1. Klik database **ipbb**
2. Klik tab **Export**
3. Pilih format (SQL, CSV, Excel, dll)
4. Klik **Go**
5. File akan didownload

## 🚀 Menjalankan Ulang

Jika restart Docker:
```powershell
# Start semua service termasuk phpMyAdmin
docker-compose up -d

# Atau jalankan script helper
.\start-docker.bat
```

## 🛑 Stop phpMyAdmin

Jika ingin stop phpMyAdmin saja:
```powershell
docker-compose stop phpmyadmin
```

Jika ingin hapus permanent:
```powershell
docker-compose rm phpmyadmin
```

## 📊 Status Container

Cek semua container yang berjalan:
```powershell
docker-compose ps
```

Expected output:
```
NAME              STATUS          PORTS
ipbb-mysql        Up (healthy)    0.0.0.0:3306->3306/tcp
ipbb-backend      Up              0.0.0.0:8000->8000/tcp
ipbb-frontend     Up              0.0.0.0:3000->3000/tcp
ipbb-phpmyadmin   Up              0.0.0.0:8080->80/tcp
```

## 🎨 Tips

1. **Bookmark**: Save http://localhost:8080 di browser
2. **Stay Logged In**: Check "Remember username" saat login
3. **Dark Mode**: Lihat di Settings → Themes
4. **Multiple Tabs**: Buka beberapa database/tabel sekaligus

## 🔒 Security Note

⚠️ **Untuk Development Only!**
- phpMyAdmin dengan root password di port 8080 adalah untuk development local
- **JANGAN deploy ke production** tanpa proper security!
- Untuk production, gunakan firewall dan authentication yang lebih kuat

## 🎉 Selesai!

phpMyAdmin sekarang bisa diakses di:
**http://localhost:8080**

Selamat mengelola database! 🚀
