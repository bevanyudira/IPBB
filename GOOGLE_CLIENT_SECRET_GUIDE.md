# Cara Mendapatkan Google Client Secret yang Lengkap

## 🔐 Client Secret Tersembunyi?

Jika Anda melihat Client Secret seperti `****GYYV`, itu artinya Google menyembunyikan karakternya untuk keamanan.

## ✅ Cara Mendapatkan Client Secret Lengkap:

### Method 1: Download JSON File (Recommended)

1. **Buka Google Cloud Console**
   - https://console.cloud.google.com/

2. **Navigate ke Credentials**
   - Menu: **APIs & Services** → **Credentials**

3. **Download JSON**
   - Cari OAuth 2.0 Client ID Anda di daftar
   - Klik **icon download** (⬇️) di sebelah kanan nama client
   - File JSON akan terdownload

4. **Buka File JSON**
   - File bernama seperti: `client_secret_123456789.json`
   - Isinya:
   ```json
   {
     "web": {
       "client_id": "123456789-abc123.apps.googleusercontent.com",
       "client_secret": "GOCSPX-AbCdEfGhIjKlMnOpQrStUvWxYz",
       "redirect_uris": [...]
     }
   }
   ```

5. **Copy Client Secret**
   - Copy value dari `client_secret` (biasanya dimulai dengan `GOCSPX-`)

### Method 2: Reset Client Secret (Jika Lupa)

1. **Buka Google Cloud Console**
   - https://console.cloud.google.com/

2. **Navigate ke Credentials**
   - Menu: **APIs & Services** → **Credentials**

3. **Edit OAuth Client**
   - Klik **nama** OAuth client Anda (bukan icon download)
   - Akan masuk ke halaman edit

4. **Reset Secret**
   - Scroll ke bagian **Client secret**
   - Klik tombol **RESET SECRET** atau **ADD SECRET**
   - Akan muncul popup dengan **Client Secret baru yang lengkap**
   - **⚠️ IMPORTANT**: Copy dan simpan sekarang! Tidak akan ditampilkan lagi!

5. **Save**
   - Klik **SAVE** di bagian bawah

### Method 3: Buat Client ID Baru

Jika kedua method di atas tidak berhasil:

1. **Hapus OAuth Client yang Lama** (opsional)
2. **Buat OAuth Client ID Baru**:
   - **+ CREATE CREDENTIALS** → **OAuth client ID**
   - Application type: **Web application**
   - Name: `IPBB Local Dev v2`
   - Authorized redirect URIs:
     ```
     http://localhost:8000/auth/oauth/google/callback
     http://localhost:3000/auth/oauth/google/callback
     ```
   - Klik **CREATE**

3. **Copy Credentials dari Popup**
   - Popup akan muncul dengan **Client ID** dan **Client Secret** lengkap
   - **Copy dan simpan** kedua value!

## 📋 Format yang Benar:

### Client ID (biasanya):
```
[12-digit-number]-[random-string].apps.googleusercontent.com
```
Contoh: `123456789012-xxxxxxxxxxxxxxxxxxxxx.apps.googleusercontent.com`

### Client Secret (biasanya):
```
GOCSPX-[random-string]
```
Contoh: `GOCSPX-xxxxxxxxxxxxxxxxxxxxxxxx`

**Catatan**: Client Secret Google biasanya:
- Dimulai dengan `GOCSPX-`
- Panjang sekitar 24-35 karakter
- Kombinasi huruf, angka, dash, underscore

## 🔧 Update Backend Environment

Setelah mendapatkan credentials lengkap:

1. **Edit file `backend/.env`**:
   ```bash
   # GOOGLE OAuth - Real credentials
   GOOGLE_CLIENT_ID="paste-full-client-id-here.apps.googleusercontent.com"
   GOOGLE_CLIENT_SECRET="GOCSPX-paste-full-secret-here"
   ```

2. **Restart Backend**:
   ```powershell
   docker-compose restart backend
   ```

3. **Test Login**:
   - http://localhost:3000/login
   - Klik "Login with Google"

## ⚠️ Security Tips:

1. **Jangan Share** Client Secret ke public
2. **Jangan Commit** `.env` ke Git (sudah ada di `.gitignore`)
3. **Save ke Password Manager** untuk backup
4. **Rotate Secrets** secara berkala untuk production

## 🎯 Quick Checklist:

- [ ] Download JSON file dari Google Console
- [ ] Extract `client_id` dari JSON
- [ ] Extract `client_secret` dari JSON (harus lengkap, bukan `****`)
- [ ] Paste ke `backend/.env`
- [ ] Restart backend: `docker-compose restart backend`
- [ ] Test login with Google

## 📞 Troubleshooting:

**Q: Saya sudah paste tapi masih error 400?**
A: Pastikan:
- Client Secret lengkap (bukan `****GYYV`)
- Tidak ada spasi sebelum/sesudah value
- Tidak ada quote ganda
- Format: `GOOGLE_CLIENT_SECRET="GOCSPX-xxxxx"`

**Q: Dimana saya bisa download JSON?**
A: Google Console → Credentials → Cari OAuth client → Icon download (⬇️) di kanan

**Q: Tombol download tidak ada?**
A: Klik nama OAuth client → Edit → Reset secret → Copy yang muncul

Happy coding! 🚀
