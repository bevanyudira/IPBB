# 🔍 SPOP Quick Reference

## NOP Structure (Nomor Objek Pajak)

```
┌─────────────────────────────────────────────────────────┐
│  NOP = 18 Digits Composite Primary Key                 │
└─────────────────────────────────────────────────────────┘

      51  .  02  .  001  .  001  .  000  .  0001  .  7
      ^^     ^^     ^^^     ^^^     ^^^     ^^^^     ^
      │      │      │       │       │       │        └─ KD_JNS_OP (1)
      │      │      │       │       │       └────────── NO_URUT (4)
      │      │      │       │       └────────────────── KD_BLOK (3)
      │      │      │       └────────────────────────── KD_KELURAHAN (3)
      │      │      └────────────────────────────────── KD_KECAMATAN (3)
      │      └───────────────────────────────────────── KD_DATI2 (2)
      └──────────────────────────────────────────────── KD_PROPINSI (2)

Total: 2 + 2 + 3 + 3 + 3 + 4 + 1 = 18 digits
```

## Data Categories

```
┌─────────────────────────────────────────────────────────┐
│                  SPOP TABLE (42 fields)                 │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  1️⃣  IDENTIFIKASI LOKASI (7 fields - PRIMARY KEY)      │
│     • KD_PROPINSI, KD_DATI2, KD_KECAMATAN,             │
│       KD_KELURAHAN, KD_BLOK, NO_URUT, KD_JNS_OP        │
│                                                         │
│  2️⃣  SUBJEK PAJAK (2 fields)                           │
│     • SUBJEK_PAJAK_ID (FK) ────┐                       │
│     • KD_STATUS_WP              │                       │
│                                 │                       │
│  3️⃣  DATA ADMINISTRATIF (3)     │                       │
│     • NO_FORMULIR_SPOP          │                       │
│     • JNS_TRANSAKSI_OP          │                       │
│     • NO_SPPT_LAMA              │                       │
│                                 │                       │
│  4️⃣  LOKASI FISIK (5)            │                       │
│     • JALAN_OP                  │                       │
│     • BLOK_KAV_NO_OP            │                       │
│     • KELURAHAN_OP              │                       │
│     • RW_OP, RT_OP              │                       │
│                                 │                       │
│  5️⃣  KARAKTERISTIK TANAH (5)    │                       │
│     • LUAS_BUMI ⭐              │                       │
│     • KD_ZNT                    │                       │
│     • JNS_BUMI                  │                       │
│     • NILAI_SISTEM_BUMI         │                       │
│     • NO_PERSIL                 │                       │
│                                 │                       │
│  6️⃣  OBJEK BERSAMA (7)          │                       │
│     • KD_*_BERSAMA fields       │                       │
│                                 │                       │
│  7️⃣  MUTASI/ASAL (7)            │                       │
│     • KD_*_ASAL fields          │                       │
│                                 │                       │
│  8️⃣  AUDIT TRAIL (6)            │                       │
│     • TGL_PENDATAAN_OP          │                       │
│     • NM_PENDATAAN_OP           │                       │
│     • NIP_PENDATA               │                       │
│     • TGL_PEMERIKSAAN_OP        │                       │
│     • NM_PEMERIKSAAN_OP         │                       │
│     • NIP_PEMERIKSA_OP          │                       │
│                                 │                       │
└─────────────────────────────────┘                       │
                                                          │
┌─────────────────────────────────────────────────────────┘
│
│  FK Relationship
│
▼
┌─────────────────────────────────────────────────────────┐
│              dat_subjek_pajak TABLE                     │
├─────────────────────────────────────────────────────────┤
│  • SUBJEK_PAJAK_ID (PK)                                │
│  • NM_WP (Nama Wajib Pajak)                            │
│  • JALAN_WP                                            │
│  • NPWP                                                │
│  • TELP_WP                                             │
└─────────────────────────────────────────────────────────┘
```

## SPOP Lifecycle

```
┌─────────────────┐
│  1. PENDAFTARAN │  JNS_TRANSAKSI_OP = 1
│    (Baru)       │  300,352 records (64%)
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  2. PEMUTAKHIRAN│  JNS_TRANSAKSI_OP = 2
│    (Update)     │  159,561 records (34%)
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  3. PENGHAPUSAN │  JNS_TRANSAKSI_OP = 3
│    (Mutasi)     │  9,660 records (2%)
└─────────────────┘
```

## SPOP → SPPT Relationship

```
┌──────────────────────────────────────────────────┐
│              SPOP (Master Data)                  │
│  • One-time registration                        │
│  • Permanent characteristics                    │
│  • 469,573 records                              │
└───────────────┬──────────────────────────────────┘
                │
                │ Generates annually
                │
                ▼
┌──────────────────────────────────────────────────┐
│              SPPT (Annual Tax Bill)              │
│  • Generated every year                         │
│  • SPOP + THN_PAJAK_SPPT                        │
│  • Includes NJOP calculation                    │
│  • Payment status                               │
└──────────────────────────────────────────────────┘

Example:
SPOP: NOP 51.02.001.001.000.0001.7 (LUAS_BUMI: 2300 m²)
  ├─► SPPT 2019: NJOP 500M, PBB 5M, LUNAS
  ├─► SPPT 2020: NJOP 550M, PBB 5.5M, LUNAS
  ├─► SPPT 2021: NJOP 600M, PBB 6M, BELUM
  └─► SPPT 2022: NJOP 650M, PBB 6.5M, BELUM
```

## Statistics at a Glance

```
╔═══════════════════════════════════════════════════╗
║           SPOP DATABASE STATISTICS                ║
╠═══════════════════════════════════════════════════╣
║  Total Records:          469,573 objek pajak     ║
║  Total Land Area:        1,383 km²               ║
║  Average Land Size:      2,945 m² (~0.3 ha)      ║
║  Largest Parcel:         279.5 km² 🏞️            ║
║  Smallest Parcel:        0 m² ⚠️                  ║
╠═══════════════════════════════════════════════════╣
║  Jenis Transaksi:                                 ║
║    • Pendaftaran Baru:   300,352 (64%) 📝        ║
║    • Pemutakhiran:       159,561 (34%) 🔄        ║
║    • Penghapusan:          9,660 (2%)  ❌        ║
╠═══════════════════════════════════════════════════╣
║  Jenis Objek:                                     ║
║    • Tanah+Bangunan (0): 271,898 (58%) 🏠        ║
║    • Tanah+Bangunan (7): 197,666 (42%) 🏡        ║
║    • Lainnya:                   9 (0%)           ║
╚═══════════════════════════════════════════════════╝
```

## Common Queries

### 1. Get Object by NOP
```sql
SELECT * FROM spop 
WHERE KD_PROPINSI='51' AND KD_DATI2='02' 
  AND KD_KECAMATAN='001' AND KD_KELURAHAN='001'
  AND KD_BLOK='000' AND NO_URUT='0001' 
  AND KD_JNS_OP='7';
```

### 2. Count Objects per WP
```sql
SELECT SUBJEK_PAJAK_ID, COUNT(*) as total
FROM spop
GROUP BY SUBJEK_PAJAK_ID
HAVING total > 1
ORDER BY total DESC;
```

### 3. Total Land Area per Kelurahan
```sql
SELECT 
    CONCAT(KD_PROPINSI, KD_DATI2, KD_KECAMATAN, KD_KELURAHAN) as Kel,
    COUNT(*) as objects,
    SUM(LUAS_BUMI) as total_m2,
    AVG(LUAS_BUMI) as avg_m2
FROM spop
GROUP BY KD_PROPINSI, KD_DATI2, KD_KECAMATAN, KD_KELURAHAN;
```

## Field Priority for Use

```
HIGH PRIORITY (Always use):
  ✅ All NOP fields (Primary Key)
  ✅ SUBJEK_PAJAK_ID (Owner)
  ✅ LUAS_BUMI (Land area)
  ✅ NILAI_SISTEM_BUMI (System value)

MEDIUM PRIORITY (Use when needed):
  ⭐ JNS_TRANSAKSI_OP (Transaction type)
  ⭐ KD_ZNT (Zone code)
  ⭐ JNS_BUMI (Land usage)
  ⭐ TGL_PENDATAAN_OP (Survey date)

LOW PRIORITY (Often empty/generic):
  ⚠️ JALAN_OP (Mostly "JLN.")
  ⚠️ BLOK_KAV_NO_OP (90% NULL)
  ⚠️ KELURAHAN_OP (95% NULL)
  ⚠️ NM_PENDATAAN_OP (Mostly NULL)
  ⚠️ NM_PEMERIKSAAN_OP (Mostly NULL)
```

---

## Need More Details?

📖 **Full Documentation:** `SPOP_TABLE_ANALYSIS.md`
