# Panduan Setup Google OAuth untuk IPBB

## 🔴 Error 400 dari Google OAuth

Error ini terjadi karena:
1. Google Client ID/Secret belum dikonfigurasi dengan benar
2. Redirect URI belum didaftarkan di Google Cloud Console
3. Authorized domains belum diset

## ✅ Solusi Lengkap

### Step 1: Buat Google OAuth Credentials

1. **Buka Google Cloud Console**
   - Kunjungi: https://console.cloud.google.com/

2. **Buat Project Baru (jika belum ada)**
   - Klik **Select a project** di bagian atas
   - Klik **NEW PROJECT**
   - Nama project: `IPBB Local Dev`
   - Klik **CREATE**

3. **Enable Google+ API**
   - Menu: **APIs & Services** → **Library**
   - Cari: `Google+ API`
   - Klik dan **ENABLE**

4. **Buat OAuth Consent Screen**
   - Menu: **APIs & Services** → **OAuth consent screen**
   - User Type: Pilih **External**
   - Klik **CREATE**
   
   **App information:**
   - App name: `IPBB Local Dev`
   - User support email: (email Anda)
   - Developer contact: (email Anda)
   - Klik **SAVE AND CONTINUE**
   
   **Scopes:**
   - Klik **ADD OR REMOVE SCOPES**
   - Pilih: `email`, `profile`, `openid`
   - Klik **SAVE AND CONTINUE**
   
   **Test users (untuk External):**
   - Klik **ADD USERS**
   - Tambahkan email Anda untuk testing
   - Klik **SAVE AND CONTINUE**

5. **Buat OAuth 2.0 Client ID**
   - Menu: **APIs & Services** → **Credentials**
   - Klik **+ CREATE CREDENTIALS**
   - Pilih **OAuth client ID**
   
   **Configure:**
   - Application type: **Web application**
   - Name: `IPBB Local Dev Client`
   
   **Authorized JavaScript origins:**
   ```
   http://localhost:3000
   http://localhost:8000
   ```
   
   **Authorized redirect URIs:**
   ```
   http://localhost:8000/auth/oauth/google/callback
   http://localhost:3000/auth/oauth/google/callback
   ```
   
   - Klik **CREATE**

6. **Copy Credentials**
   - Akan muncul popup dengan **Client ID** dan **Client Secret**
   - **COPY dan SIMPAN** kedua value ini!

### Step 2: Update Environment Variables

Buka file `backend/.env` dan update:

```bash
# GOOGLE OAuth - Replace with your actual credentials
GOOGLE_CLIENT_ID="YOUR_CLIENT_ID_HERE.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="YOUR_CLIENT_SECRET_HERE"
```

**Contoh:**
```bash
GOOGLE_CLIENT_ID="123456789-abcdefghijklmnop.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="GOCSPX-AbCdEfGhIjKlMnOpQrStUvWxYz"
```

### Step 3: Restart Backend Container

```powershell
# Restart backend agar .env baru terload
docker-compose restart backend

# Tunggu beberapa detik
Start-Sleep -Seconds 5

# Cek log backend
docker logs ipbb-backend --tail 20
```

### Step 4: Test Google Login

1. Buka browser: http://localhost:3000/login
2. Klik tombol **Login with Google**
3. Akan redirect ke halaman Google login
4. Login dengan email yang sudah didaftarkan sebagai Test User
5. Akan redirect kembali ke aplikasi dengan status login

## 🔧 Troubleshooting

### Error: "redirect_uri_mismatch"

**Penyebab:** Redirect URI tidak match dengan yang didaftarkan

**Solusi:**
1. Cek redirect URI di Google Console harus **PERSIS** sama
2. Pastikan ada kedua URI:
   ```
   http://localhost:8000/auth/oauth/google/callback
   http://localhost:3000/auth/oauth/google/callback
   ```
3. **TIDAK** ada trailing slash `/`
4. **HARUS** `http` bukan `https` untuk local

### Error: "access_denied"

**Penyebab:** Email belum didaftarkan sebagai test user

**Solusi:**
1. Kembali ke Google Console
2. **OAuth consent screen** → **Test users**
3. Tambahkan email yang akan digunakan untuk login
4. **SAVE**

### Error: "invalid_client"

**Penyebab:** Client ID atau Secret salah

**Solusi:**
1. Double-check Client ID dan Secret di `.env`
2. Pastikan tidak ada spasi atau quote yang salah
3. Restart backend: `docker-compose restart backend`

### Error: 400 Bad Request dari Google

**Penyebab:** Multiple issues bisa terjadi

**Checklist:**
- ✅ Client ID format benar (ends with `.apps.googleusercontent.com`)
- ✅ Client Secret format benar (starts with `GOCSPX-`)
- ✅ Redirect URIs sudah didaftarkan
- ✅ Email sudah didaftarkan sebagai test user
- ✅ Backend sudah di-restart setelah update .env

## 🎯 Alternative: Disable Google OAuth (Development Only)

Jika tidak ingin setup Google OAuth untuk sementara:

### Option 1: Login dengan Email/Password Biasa

Aplikasi sudah support login regular tanpa OAuth:
1. Register user baru di halaman register
2. Login dengan email/password

### Option 2: Comment Out Google Login Button (Frontend)

Cari file yang berisi Google login button dan comment out tombolnya untuk sementara.

## 📋 Checklist Setup

Gunakan checklist ini untuk memastikan semua sudah benar:

- [ ] Google Cloud Project sudah dibuat
- [ ] Google+ API sudah di-enable
- [ ] OAuth Consent Screen sudah dikonfigurasi
- [ ] Test users sudah ditambahkan
- [ ] OAuth Client ID sudah dibuat
- [ ] Authorized JavaScript origins sudah diset
- [ ] Authorized redirect URIs sudah diset (2 URIs)
- [ ] Client ID sudah dicopy ke `backend/.env`
- [ ] Client Secret sudah dicopy ke `backend/.env`
- [ ] Backend container sudah di-restart
- [ ] Tidak ada error di backend logs

## 🎉 Setelah Setup Berhasil

Google OAuth akan berfungsi dengan flow:
1. User klik "Login with Google"
2. Redirect ke Google login page
3. User login dengan Google account
4. Google redirect kembali ke `/auth/oauth/google/callback`
5. Backend create/login user
6. User ter-autentikasi di aplikasi

## 📞 Need Help?

Jika masih error, cek:
1. Backend logs: `docker logs ipbb-backend --tail 50`
2. Browser console: F12 → Console tab
3. Network tab: F12 → Network tab untuk lihat request/response

## 🔐 Security Note

⚠️ **Development Setup:**
- Credentials di `.env` adalah untuk development
- **JANGAN commit** file `.env` ke Git
- File `.env` sudah ada di `.gitignore`

⚠️ **Production Setup:**
- Gunakan environment variables yang aman
- Set OAuth consent screen ke **Internal** jika domain organization
- Gunakan HTTPS redirect URIs
- Rotate secrets secara regular

Happy coding! 🚀
