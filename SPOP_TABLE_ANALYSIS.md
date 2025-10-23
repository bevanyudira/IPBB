# 📊 TABEL SPOP - Analisis Mendalam

## 📖 Table of Contents
- [Definisi](#definisi)
- [Struktur Tabel](#struktur-tabel)
- [Primary Key](#primary-key)
- [Kategori Data](#kategori-data)
- [Relasi dengan Tabel Lain](#relasi-dengan-tabel-lain)
- [Statistik Data](#statistik-data)
- [Use Cases](#use-cases)
- [Query Examples](#query-examples)

---

## Definisi

### Apa itu SPOP?

**SPOP = Surat Pemberitahuan Objek Pajak**

SPOP adalah formulir yang digunakan oleh Wajib Pajak untuk melaporkan data objek pajak (tanah dan/atau bangunan) yang dimiliki, dikuasai, dan/atau dimanfaatkan untuk kepentingan Pajak Bumi dan Bangunan (PBB).

### Fungsi Tabel SPOP

Tabel `spop` menyimpan **master data objek pajak** yang mencakup:
- Identifikasi lokasi objek pajak (NOP)
- Data subjek pajak (pemilik)
- Karakteristik fisik tanah (luas, jenis)
- Riwayat pendataan dan pemeriksaan
- Tracking perubahan objek pajak

### Hubungan dengan Sistem PBB

```
SPOP (Master Objek Pajak)
    ↓
    ├── Digunakan untuk generate SPPT (Surat Pemberitahuan Pajak Terutang)
    ├── Linked ke Subjek Pajak (Wajib Pajak/Pemilik)
    └── Basis perhitungan NJOP dan PBB
```

---

## Struktur Tabel

### Metadata
- **Nama Tabel:** `spop`
- **Total Records:** 469,573 objek pajak
- **Storage Engine:** InnoDB
- **Character Set:** UTF-8
- **Total Kolom:** 42 fields

### Schema Overview

```sql
CREATE TABLE spop (
    -- PRIMARY KEY (Identifikasi Objek Pajak - NOP)
    KD_PROPINSI varchar(6) NOT NULL,
    KD_DATI2 varchar(6) NOT NULL,
    KD_KECAMATAN varchar(9) NOT NULL,
    KD_KELURAHAN varchar(9) NOT NULL,
    KD_BLOK varchar(9) NOT NULL,
    NO_URUT varchar(12) NOT NULL,
    KD_JNS_OP varchar(1) NOT NULL,
    
    -- Foreign Key to dat_subjek_pajak
    SUBJEK_PAJAK_ID varchar(30) NOT NULL,
    
    -- Administrative Data
    NO_FORMULIR_SPOP varchar(11),
    JNS_TRANSAKSI_OP varchar(1) NOT NULL,
    
    -- ... (42 fields total)
    
    PRIMARY KEY (KD_PROPINSI, KD_DATI2, KD_KECAMATAN, KD_KELURAHAN, KD_BLOK, NO_URUT, KD_JNS_OP),
    KEY idx_subjek (SUBJEK_PAJAK_ID)
);
```

---

## Primary Key

### Composite Primary Key (7 Fields)

Tabel SPOP menggunakan **composite primary key** yang membentuk **NOP (Nomor Objek Pajak)**:

| Field | Length | Purpose | Example | Notes |
|-------|--------|---------|---------|-------|
| `KD_PROPINSI` | 2 digits | Kode Provinsi | `51` | Bali |
| `KD_DATI2` | 2 digits | Kode Kabupaten/Kota | `02` | Badung |
| `KD_KECAMATAN` | 3 digits | Kode Kecamatan | `001` | Kuta Selatan |
| `KD_KELURAHAN` | 3 digits | Kode Kelurahan/Desa | `001` | Jimbaran |
| `KD_BLOK` | 3 digits | Kode Blok Tanah | `000` | Blok kavling |
| `NO_URUT` | 4 digits | Nomor Urut | `0001` | Urutan dalam blok |
| `KD_JNS_OP` | 1 digit | Jenis Objek Pajak | `7` | Tanah + Bangunan |

### NOP Format

**NOP = Nomor Objek Pajak (18 digit)**

```
Contoh NOP: 51.02.001.001.000.0001.7
            ^^-^^-^^^-^^^-^^^-^^^^-^
            │  │  │   │   │   │    └─ Jenis OP
            │  │  │   │   │   └────── Nomor Urut
            │  │  │   │   └────────── Blok
            │  │  │   └────────────── Kelurahan
            │  │  └────────────────── Kecamatan
            │  └───────────────────── Kabupaten/Kota
            └──────────────────────── Provinsi
```

**Breakdown:**
- `51` = Bali (Provinsi)
- `02` = Badung (Kabupaten)
- `001` = Kuta Selatan (Kecamatan)
- `001` = Jimbaran (Kelurahan)
- `000` = Blok 000
- `0001` = Nomor urut pertama
- `7` = Tanah dan Bangunan

---

## Kategori Data

### 1. **Identifikasi Lokasi** (Primary Key)

| Field | Type | Null | Description |
|-------|------|------|-------------|
| `KD_PROPINSI` | varchar(6) | NO | Kode provinsi (2 digit) |
| `KD_DATI2` | varchar(6) | NO | Kode kabupaten/kota (2 digit) |
| `KD_KECAMATAN` | varchar(9) | NO | Kode kecamatan (3 digit) |
| `KD_KELURAHAN` | varchar(9) | NO | Kode kelurahan/desa (3 digit) |
| `KD_BLOK` | varchar(9) | NO | Kode blok kavling (3 digit) |
| `NO_URUT` | varchar(12) | NO | Nomor urut dalam blok (4 digit) |
| `KD_JNS_OP` | varchar(1) | NO | Kode jenis objek pajak |

**Kode Jenis Objek Pajak (`KD_JNS_OP`):**
- `0` = Tanah + Bangunan (271,898 records - 58%)
- `7` = Tanah + Bangunan variant (197,666 records - 42%)
- `2` = Khusus (2 records)
- `9` = Lainnya (5 records)
- `+` = Special code (1 record)
- ` ` = Empty/Unknown (1 record)

---

### 2. **Subjek Pajak (Wajib Pajak)**

| Field | Type | Null | Description |
|-------|------|------|-------------|
| `SUBJEK_PAJAK_ID` | varchar(30) | NO | ID Wajib Pajak (FK to dat_subjek_pajak) |
| `KD_STATUS_WP` | varchar(1) | NO | Status kepemilikan WP |

**Relasi:**
```sql
SUBJEK_PAJAK_ID → dat_subjek_pajak.SUBJEK_PAJAK_ID
```

---

### 3. **Data Administratif SPOP**

| Field | Type | Null | Description |
|-------|------|------|-------------|
| `NO_FORMULIR_SPOP` | varchar(11) | YES | Nomor formulir SPOP |
| `JNS_TRANSAKSI_OP` | varchar(1) | NO | Jenis transaksi objek pajak |
| `NO_SPPT_LAMA` | varchar(18) | YES | NOP lama (jika ada perubahan) |

**Jenis Transaksi (`JNS_TRANSAKSI_OP`):**
- `1` = Pendaftaran Baru (300,352 records - 64%)
- `2` = Pemutakhiran/Update (159,561 records - 34%)
- `3` = Penghapusan/Mutasi (9,660 records - 2%)

---

### 4. **Data Lokasi Fisik**

| Field | Type | Null | Description |
|-------|------|------|-------------|
| `JALAN_OP` | varchar(30) | NO | Nama jalan objek pajak |
| `BLOK_KAV_NO_OP` | varchar(15) | YES | Blok/Kavling/Nomor rumah |
| `KELURAHAN_OP` | varchar(30) | YES | Nama kelurahan (text) |
| `RW_OP` | varchar(2) | YES | Rukun Warga |
| `RT_OP` | varchar(3) | YES | Rukun Tetangga |

**Data Quality:**
- `JALAN_OP`: 100% filled (but mostly "JLN." - generic)
- `BLOK_KAV_NO_OP`: ~10% filled
- `KELURAHAN_OP`: ~5% filled
- `RW_OP`, `RT_OP`: 100% filled (mostly "00" and "000")

---

### 5. **Karakteristik Tanah**

| Field | Type | Null | Description |
|-------|------|------|-------------|
| `LUAS_BUMI` | bigint | NO | Luas tanah dalam m² |
| `KD_ZNT` | varchar(2) | YES | Kode Zona Nilai Tanah |
| `JNS_BUMI` | varchar(1) | NO | Jenis penggunaan tanah |
| `NILAI_SISTEM_BUMI` | bigint | NO | Nilai sistem tanah (untuk perhitungan) |
| `NO_PERSIL` | varchar(5) | YES | Nomor persil/kavling |

**Statistik Luas Tanah:**
- **Minimum:** 0 m²
- **Maximum:** 279,500,000 m² (279.5 km²!)
- **Average:** 2,945 m²
- **Total:** 1,383,052,261 m² (1,383 km²)

**Analisis:**
- Ada anomali: tanah 0 m² (data entry error?)
- Ada tanah sangat besar: 279.5 km² (kemungkinan lahan perkebunan/kehutanan)
- Rata-rata ~3000 m² = ~0.3 hektar (masuk akal untuk properti residensial)

---

### 6. **Tracking Objek Bersama/Pecahan**

Digunakan untuk tracking objek pajak yang dipecah atau digabung:

| Field | Type | Description |
|-------|------|-------------|
| `KD_PROPINSI_BERSAMA` | varchar(2) | NOP objek bersama/induk |
| `KD_DATI2_BERSAMA` | varchar(2) | ... |
| `KD_KECAMATAN_BERSAMA` | varchar(3) | ... |
| `KD_KELURAHAN_BERSAMA` | varchar(3) | ... |
| `KD_BLOK_BERSAMA` | varchar(3) | ... |
| `NO_URUT_BERSAMA` | varchar(4) | ... |
| `KD_JNS_OP_BERSAMA` | varchar(1) | ... |

**Use Case:**
```
Original: NOP 51.02.001.001.000.0100.7 (1000 m²)
   ↓ Split into:
Child 1:  NOP 51.02.001.001.000.0101.7 (400 m²) → KD_*_BERSAMA = 0100
Child 2:  NOP 51.02.001.001.000.0102.7 (600 m²) → KD_*_BERSAMA = 0100
```

---

### 7. **Tracking Mutasi/Perubahan**

| Field | Type | Description |
|-------|------|-------------|
| `KD_PROPINSI_ASAL` | varchar(2) | NOP asal (sebelum mutasi) |
| `KD_DATI2_ASAL` | varchar(2) | ... |
| `KD_KECAMATAN_ASAL` | varchar(3) | ... |
| `KD_KELURAHAN_ASAL` | varchar(3) | ... |
| `KD_BLOK_ASAL` | varchar(3) | ... |
| `NO_URUT_ASAL` | varchar(4) | ... |
| `KD_JNS_OP_ASAL` | varchar(1) | ... |

**Use Case:**
Objek pajak pindah wilayah administrasi (misalnya pemekaran kelurahan).

---

### 8. **Audit Trail Pendataan**

| Field | Type | Null | Description |
|-------|------|------|-------------|
| `TGL_PENDATAAN_OP` | date | NO | Tanggal pendataan objek |
| `NM_PENDATAAN_OP` | varchar(30) | YES | Nama petugas pendata |
| `NIP_PENDATA` | varchar(20) | YES | NIP petugas pendata |
| `TGL_PEMERIKSAAN_OP` | date | NO | Tanggal pemeriksaan |
| `NM_PEMERIKSAAN_OP` | varchar(30) | YES | Nama pemeriksa |
| `NIP_PEMERIKSA_OP` | varchar(20) | YES | NIP pemeriksa |

**Sample Data:**
```
TGL_PENDATAAN_OP: 2000-12-07
NIP_PENDATA: 060000000
TGL_PEMERIKSAAN_OP: 2000-12-07
NIP_PEMERIKSA_OP: 060000000
```

**Observasi:**
- Banyak data pendataan dari tahun 2000
- NIP generic (060000000) menunjukkan data legacy/import massal
- Nama petugas mostly NULL

---

## Relasi dengan Tabel Lain

### Entity Relationship Diagram

```
┌─────────────────────┐
│  dat_subjek_pajak   │
│  (Wajib Pajak)      │
│                     │
│  SUBJEK_PAJAK_ID ◄──┼──┐
│  NM_WP              │  │
│  ALAMAT_WP          │  │
│  NPWP               │  │
└─────────────────────┘  │
                         │
                         │ FK
                         │
┌────────────────────────┴───┐
│         SPOP               │
│    (Master Objek Pajak)    │
│                            │
│  PK: NOP (7 fields) ◄──────┼──┐
│  SUBJEK_PAJAK_ID           │  │
│  LUAS_BUMI                 │  │
│  NILAI_SISTEM_BUMI         │  │
└────────────────────────────┘  │
                                │
                                │ Generates
                                │
┌───────────────────────────────┴┐
│           SPPT                 │
│   (Surat Pemberitahuan Pajak)  │
│                                │
│  PK: NOP + THN_PAJAK_SPPT      │
│  NJOP_BUMI_SPPT                │
│  PBB_YG_HARUS_DIBAYAR_SPPT     │
│  STATUS_PEMBAYARAN_SPPT        │
└────────────────────────────────┘
```

### Key Relationships

1. **SPOP → dat_subjek_pajak** (Many-to-One)
   ```sql
   spop.SUBJEK_PAJAK_ID = dat_subjek_pajak.SUBJEK_PAJAK_ID
   ```
   - Satu WP bisa punya banyak objek pajak
   - Satu objek pajak hanya punya satu WP

2. **SPOP → SPPT** (One-to-Many)
   ```sql
   spop.(NOP fields) = sppt.(NOP fields)
   ```
   - Satu objek pajak generate SPPT setiap tahun
   - SPPT = SPOP + tahun pajak + perhitungan NJOP

3. **SPOP → ref_kelurahan** (Many-to-One)
   ```sql
   spop.(KD_PROPINSI, KD_DATI2, KD_KECAMATAN, KD_KELURAHAN) 
   = ref_kelurahan.(KD_PROPINSI, KD_DATI2, KD_KECAMATAN, KD_KELURAHAN)
   ```

---

## Statistik Data

### Data Distribution

| Metric | Value | Notes |
|--------|-------|-------|
| **Total Records** | 469,573 | Total objek pajak |
| **Unique SUBJEK_PAJAK_ID** | ~350,000 (est.) | Satu WP bisa punya >1 objek |
| **Unique Kelurahan** | ~50-100 (est.) | Berdasarkan struktur NOP |

### Jenis Transaksi Distribution

| Jenis | Code | Count | Percentage |
|-------|------|-------|------------|
| Pendaftaran Baru | 1 | 300,352 | 64% |
| Pemutakhiran | 2 | 159,561 | 34% |
| Penghapusan | 3 | 9,660 | 2% |

### Jenis Objek Pajak Distribution

| Jenis | Code | Count | Percentage |
|-------|------|-------|------------|
| Tanah + Bangunan | 0 | 271,898 | 58% |
| Tanah + Bangunan | 7 | 197,666 | 42% |
| Lainnya | 2,9,+,` ` | 9 | 0.002% |

**Note:** Code `0` dan `7` kemungkinan sama (variant kode lama vs baru).

---

## Use Cases

### 1. Pencarian Objek Pajak by NOP

```python
# backend/app/sppt/service.py
async def get_spop_by_nop(session: AsyncSession, nop: str) -> Spop | None:
    """Get SPOP data by NOP (18 digits)"""
    # Parse NOP: 51.02.001.001.000.0001.7
    key = parse_nop(nop)
    
    stmt = select(Spop).where(
        Spop.KD_PROPINSI == key.kd_propinsi,
        Spop.KD_DATI2 == key.kd_dati2,
        Spop.KD_KECAMATAN == key.kd_kecamatan,
        Spop.KD_KELURAHAN == key.kd_kelurahan,
        Spop.KD_BLOK == key.kd_blok,
        Spop.NO_URUT == key.no_urut,
        Spop.KD_JNS_OP == key.kd_jns_op
    )
    
    result = await session.exec(stmt)
    return result.first()
```

### 2. List Objek Pajak by Wajib Pajak

```python
async def get_spop_by_wp(session: AsyncSession, subjek_pajak_id: str) -> list[Spop]:
    """Get all objects owned by a taxpayer"""
    stmt = select(Spop).where(Spop.SUBJEK_PAJAK_ID == subjek_pajak_id)
    result = await session.exec(stmt)
    return result.all()
```

### 3. Statistik per Kelurahan

```python
async def get_kelurahan_stats(session: AsyncSession, kd_kelurahan: str):
    """Get statistics for a kelurahan"""
    stmt = (
        select(
            func.count(Spop.NO_URUT).label("total_objek"),
            func.sum(Spop.LUAS_BUMI).label("total_luas"),
            func.avg(Spop.LUAS_BUMI).label("avg_luas"),
            func.count(distinct(Spop.SUBJEK_PAJAK_ID)).label("total_wp")
        )
        .where(
            Spop.KD_PROPINSI == kd_propinsi,
            Spop.KD_DATI2 == kd_dati2,
            Spop.KD_KECAMATAN == kd_kecamatan,
            Spop.KD_KELURAHAN == kd_kelurahan
        )
    )
    
    result = await session.exec(stmt)
    return result.first()
```

### 4. Tracking Perubahan Objek

```python
async def get_mutasi_history(session: AsyncSession, nop: str):
    """Get mutation history of an object"""
    # Check if this NOP is result of split
    stmt = select(Spop).where(
        Spop.KD_PROPINSI_BERSAMA == key.kd_propinsi,
        Spop.KD_DATI2_BERSAMA == key.kd_dati2,
        # ... other BERSAMA fields
    )
    
    children = await session.exec(stmt).all()
    
    # Check if moved from another location
    stmt2 = select(Spop).where(
        Spop.KD_PROPINSI_ASAL == key.kd_propinsi,
        # ... other ASAL fields
    )
    
    original = await session.exec(stmt2).first()
    
    return {
        "children": children,
        "original_location": original
    }
```

---

## Query Examples

### Simple Queries

```sql
-- 1. Get all objects in a kelurahan
SELECT * FROM spop
WHERE KD_PROPINSI = '51'
  AND KD_DATI2 = '02'
  AND KD_KECAMATAN = '001'
  AND KD_KELURAHAN = '001'
LIMIT 10;

-- 2. Count objects by jenis transaksi
SELECT 
    JNS_TRANSAKSI_OP,
    COUNT(*) as total
FROM spop
GROUP BY JNS_TRANSAKSI_OP;

-- 3. Find large land parcels (> 10,000 m²)
SELECT 
    CONCAT(KD_PROPINSI, KD_DATI2, KD_KECAMATAN, KD_KELURAHAN, 
           KD_BLOK, NO_URUT, KD_JNS_OP) as NOP,
    LUAS_BUMI,
    JALAN_OP
FROM spop
WHERE LUAS_BUMI > 10000
ORDER BY LUAS_BUMI DESC
LIMIT 10;
```

### Complex Queries

```sql
-- 4. Join with subjek pajak to get owner details
SELECT 
    CONCAT(s.KD_PROPINSI, s.KD_DATI2, s.KD_KECAMATAN, s.KD_KELURAHAN, 
           s.KD_BLOK, s.NO_URUT, s.KD_JNS_OP) as NOP,
    sp.NM_WP as Pemilik,
    s.LUAS_BUMI,
    s.JALAN_OP
FROM spop s
JOIN dat_subjek_pajak sp ON s.SUBJEK_PAJAK_ID = sp.SUBJEK_PAJAK_ID
WHERE s.KD_KELURAHAN = '001'
LIMIT 10;

-- 5. Count objects per WP (multi-property owners)
SELECT 
    sp.NM_WP,
    COUNT(*) as jumlah_objek,
    SUM(s.LUAS_BUMI) as total_luas
FROM spop s
JOIN dat_subjek_pajak sp ON s.SUBJEK_PAJAK_ID = sp.SUBJEK_PAJAK_ID
GROUP BY s.SUBJEK_PAJAK_ID
HAVING jumlah_objek > 1
ORDER BY jumlah_objek DESC
LIMIT 10;

-- 6. Find split objects (pecahan)
SELECT 
    CONCAT(KD_PROPINSI_BERSAMA, KD_DATI2_BERSAMA, 
           KD_KECAMATAN_BERSAMA, KD_KELURAHAN_BERSAMA,
           KD_BLOK_BERSAMA, NO_URUT_BERSAMA, KD_JNS_OP_BERSAMA) as NOP_Induk,
    CONCAT(KD_PROPINSI, KD_DATI2, KD_KECAMATAN, KD_KELURAHAN,
           KD_BLOK, NO_URUT, KD_JNS_OP) as NOP_Anak,
    LUAS_BUMI
FROM spop
WHERE KD_PROPINSI_BERSAMA IS NOT NULL
LIMIT 10;
```

---

## Data Quality Issues

### Issues Found

1. **Alamat Tidak Lengkap**
   - `JALAN_OP` mostly "JLN." (generic)
   - `BLOK_KAV_NO_OP` 90% NULL
   - `KELURAHAN_OP` 95% NULL

2. **Luas Tanah Anomali**
   - Ada luas 0 m² (invalid)
   - Ada luas 279,500,000 m² = 279.5 km² (perlu verifikasi)

3. **Audit Trail Incomplete**
   - `NM_PENDATAAN_OP` dan `NM_PEMERIKSAAN_OP` mostly NULL
   - NIP generic (060000000) menunjukkan data legacy

### Recommendations

1. **Data Cleansing:**
   ```sql
   -- Fix zero land area
   UPDATE spop SET LUAS_BUMI = NULL WHERE LUAS_BUMI = 0;
   
   -- Verify extremely large parcels
   SELECT * FROM spop WHERE LUAS_BUMI > 1000000; -- > 100 ha
   ```

2. **Address Improvement:**
   - Implement geocoding to get proper addresses
   - Add validation for address fields

3. **Audit Trail:**
   - Make NM_PENDATAAN_OP and NIP_PENDATA required for new data
   - Add trigger to auto-fill on insert/update

---

## Backend Model

**File:** `backend/app/models/spop.py`

```python
from sqlmodel import SQLModel, Field
from typing import Optional
from datetime import date

class Spop(SQLModel, table=True):
    __tablename__ = "spop"
    
    # Primary Key (NOP)
    KD_PROPINSI: str = Field(primary_key=True, max_length=6)
    KD_DATI2: str = Field(primary_key=True, max_length=6)
    KD_KECAMATAN: str = Field(primary_key=True, max_length=9)
    KD_KELURAHAN: str = Field(primary_key=True, max_length=9)
    KD_BLOK: str = Field(primary_key=True, max_length=9)
    NO_URUT: str = Field(primary_key=True, max_length=12)
    KD_JNS_OP: str = Field(primary_key=True, max_length=3)
    
    # Foreign Key
    SUBJEK_PAJAK_ID: Optional[str] = Field(default=None, max_length=90)
    
    # Characteristics
    LUAS_BUMI: Optional[int] = None
    NILAI_SISTEM_BUMI: Optional[int] = None
    
    # ... (other fields)
```

---

## Summary

### Key Points

1. **SPOP = Master Objek Pajak**
   - Satu record = Satu objek pajak (tanah/bangunan)
   - Identified by NOP (18 digits, 7-part composite key)

2. **Total:** 469,573 objek pajak

3. **Main Purpose:**
   - Master data untuk objek pajak
   - Basis perhitungan NJOP dan PBB
   - Tracking perubahan objek (split, merge, mutasi)

4. **Related to:**
   - `dat_subjek_pajak` (pemilik)
   - `sppt` (tagihan PBB tahunan)
   - `ref_kelurahan` (wilayah administratif)

5. **Data Quality:**
   - ✅ Good: NOP structure, luas tanah
   - ⚠️ Fair: Audit trail
   - ❌ Poor: Address data, petugas names

---

**Analisis Lengkap oleh:** GitHub Copilot  
**Tanggal:** October 18, 2025  
**Database:** ipbb (MySQL 8.0)
