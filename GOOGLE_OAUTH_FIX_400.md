# ⚠️ Google OAuth Error 400 - Solusi PASTI

## 🔴 Error yang Muncul:
```
400. That's an error.
The server cannot process the request because it is malformed.
```

## ✅ Penyebab UTAMA:
**Redirect URI di Google Console tidak match 100% dengan yang digunakan aplikasi.**

---

## 📝 CHECKLIST - Ikuti PERSIS Langkah Ini:

### ✅ STEP 1: Buka Google Cloud Console

1. Buka browser dan kunjungi:
   ```
   https://console.cloud.google.com/apis/credentials
   ```

2. Login dengan akun Google yang buat OAuth Client

3. Pilih project yang benar

---

### ✅ STEP 2: Edit OAuth Client

1. Di halaman **Credentials**, lihat bagian **"OAuth 2.0 Client IDs"**

2. Cari OAuth Client dengan Client ID:
   ```
   1044383497236-ulgga3bcascgadd08fvdv0mvl0c8phpq
   ```

3. **KLIK NAMA CLIENT** (bukan icon download)
   - Akan masuk ke halaman edit

---

### ✅ STEP 3: Set Authorized JavaScript Origins

Scroll ke bagian **"Authorized JavaScript origins"**

**HARUS ADA 2 URI INI:**
```
http://localhost:3000
http://localhost:8000
```

**Cara tambah:**
- Jika belum ada, klik **"+ ADD URI"**
- Paste: `http://localhost:3000`
- Klik **"+ ADD URI"** lagi
- Paste: `http://localhost:8000`

**⚠️ PENTING:**
- Tidak ada trailing slash `/`
- HARUS `http` bukan `https`
- HARUS huruf kecil semua

---

### ✅ STEP 4: Set Authorized Redirect URIs (PALING PENTING!)

Scroll ke bagian **"Authorized redirect URIs"**

**HARUS ADA 2 URI INI - PERSIS 100%:**
```
http://localhost:8000/auth/oauth/google/callback
http://localhost:3000/auth/oauth/google/callback
```

**Cara tambah:**
- Klik **"+ ADD URI"**
- **COPY-PASTE** dari sini (jangan ketik manual): 
  ```
  http://localhost:8000/auth/oauth/google/callback
  ```
- Klik **"+ ADD URI"** lagi
- **COPY-PASTE**: 
  ```
  http://localhost:3000/auth/oauth/google/callback
  ```

**⚠️ CRITICAL - Pastikan:**
- ✅ Tidak ada spasi di depan atau belakang
- ✅ Tidak ada trailing slash `/` di akhir
- ✅ `callback` huruf kecil semua (bukan `Callback` atau `CALLBACK`)
- ✅ HARUS `http` bukan `https`
- ✅ HARUS `localhost` bukan `127.0.0.1`
- ✅ Path: `/auth/oauth/google/callback` (3 slash `/`)

---

### ✅ STEP 5: SAVE!

1. Scroll ke paling bawah

2. Klik tombol biru **"SAVE"**

3. **TUNGGU** sampai muncul notifikasi "Saved successfully" atau sejenisnya

---

### ✅ STEP 6: Verifikasi Test Users

1. Di sidebar kiri, klik **"OAuth consent screen"**

2. Scroll ke bagian **"Test users"**

3. Pastikan email yang akan Anda gunakan untuk login **SUDAH ADA** di list

4. Jika belum ada:
   - Klik **"+ ADD USERS"**
   - Masukkan email Anda
   - Klik **"SAVE"**

---

### ✅ STEP 7: Tunggu & Clear Cache

1. **Tunggu 2-3 menit** untuk Google propagate perubahan

2. **Clear browser cache** atau buka **Incognito/Private window**
   - Chrome: `Ctrl + Shift + N`
   - Firefox: `Ctrl + Shift + P`
   - Edge: `Ctrl + Shift + N`

---

### ✅ STEP 8: Test Lagi

1. Buka **Incognito window**

2. Navigate ke:
   ```
   http://localhost:3000/login
   ```

3. Klik **"Login with Google"**

4. Seharusnya TIDAK lagi error 400, tapi redirect ke halaman login Google

---

## 🔍 Verifikasi Final - Screenshot Google Console

Setelah semua step, halaman OAuth client Anda seharusnya terlihat seperti ini:

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
OAuth client created

Web application
Name: IPBB Local Dev (atau nama lain)

Client ID
1044383497236-ulgga3bcascgadd08fvdv0mvl0c8phpq.apps.googleusercontent.com

Client secret
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

Creation date
...

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Authorized JavaScript origins
URIs                                    ┃ Actions
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
1  http://localhost:3000                ┃ 🗑️
2  http://localhost:8000                ┃ 🗑️
                                        ┃
   + ADD URI
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Authorized redirect URIs
URIs                                                      ┃ Actions
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
1  http://localhost:8000/auth/oauth/google/callback      ┃ 🗑️
2  http://localhost:3000/auth/oauth/google/callback      ┃ 🗑️
                                                          ┃
   + ADD URI
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

                                  [DELETE]  [CANCEL]  [SAVE]
```

---

## 🎯 Troubleshooting Tambahan

### Jika MASIH Error 400 Setelah Semua Langkah:

**Kemungkinan 1: Google Cache**
- Tunggu hingga 10 menit
- Coba dari browser/device lain
- Gunakan incognito window

**Kemungkinan 2: Project Salah**
- Pastikan Anda edit OAuth client di project yang benar
- Cek Client ID di Google Console match dengan di `.env`

**Kemungkinan 3: Typo di Redirect URI**
- Export/download JSON credentials dari Google
- Bandingkan dengan apa yang ada di console

**Kemungkinan 4: Backend Tidak Load .env Baru**
```powershell
# Restart backend
docker-compose restart backend

# Tunggu 15 detik
Start-Sleep -Seconds 15

# Test backend
curl http://localhost:8000/docs
```

---

## 📸 Video Tutorial (Jika Ada)

Jika masih bingung, cari di YouTube:
```
"Google OAuth setup localhost redirect uri"
```

---

## 💡 Alternative: Gunakan Login Biasa (Tanpa Google)

Jika Google OAuth terlalu ribet untuk development:

1. **Disable Google login button** di frontend (sementara)

2. **Register user biasa** via:
   - API: http://localhost:8000/docs
   - Endpoint: `/auth/register`

3. **Login dengan email/password**

---

## ✅ Summary Checklist:

Centang semua ini sudah dilakukan:

- [ ] Google Console dibuka di browser
- [ ] OAuth Client yang BENAR dipilih (client ID match)
- [ ] Authorized JavaScript origins: 2 URI ditambahkan
- [ ] Authorized redirect URIs: 2 URI ditambahkan (PERSIS)
- [ ] SAVE diklik dan berhasil
- [ ] Test user email sudah didaftarkan
- [ ] Tunggu 2-3 menit
- [ ] Browser cache di-clear atau pakai incognito
- [ ] Test login lagi

---

Jika SEMUA sudah dicentang tapi masih error, beri tahu saya dan kita coba approach lain! 🚀
