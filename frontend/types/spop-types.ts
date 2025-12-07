import { FieldValues } from "react-hook-form";

export interface SpopFormData extends FieldValues {
  // === PRIMARY KEYS & IDENTIFIKASI (REQUIRED) ===
  KD_PROPINSI: string;
  KD_DATI2: string;
  KD_KECAMATAN: string;
  KD_KELURAHAN: string;
  KD_BLOK: string;
  NO_URUT: string;
  KD_JNS_OP: string;

  // === DATA WAJIB OBJEK PAJAK (REQUIRED) ===
  SUBJEK_PAJAK_ID: string;
  JNS_TRANSAKSI_OP: string;
  NO_FORMULIR_SPOP: string;

  // === DATA LETAK OBJEK PAJAK ===
  JALAN_OP: string; // REQUIRED
  BLOK_KAV_NO_OP?: string; // OPTIONAL
  KELURAHAN_OP?: string; // OPTIONAL
  RW_OP?: string; // OPTIONAL
  RT_OP?: string; // OPTIONAL

  // === DATA SUBJEK PAJAK (REQUIRED) ===
  KD_STATUS_WP: string;

  // === DATA TANAH (REQUIRED) ===
  LUAS_BUMI: number;
  KD_ZNT: string;
  JNS_BUMI: string;
  NILAI_SISTEM_BUMI: number;
  NO_PERSIL?: string | null; // OPTIONAL

  // === IDENTITAS PENDATA (REQUIRED) ===
  NM_PENDATAAN_OP: string;
  NIP_PENDATA: string;
  TGL_PENDATAAN_OP: string;

  // === IDENTITAS PEMERIKSA (OPTIONAL) ===
  NM_PEMERIKSAAN_OP?: string;
  NIP_PEMERIKSA_OP?: string;
  TGL_PEMERIKSAAN_OP?: string;

  // === DATA TRANSAKSI BERSAMA (CONDITIONAL - Optional dulu) ===
  KD_PROPINSI_BERSAMA?: string | null;
  KD_DATI2_BERSAMA?: string | null;
  KD_KECAMATAN_BERSAMA?: string | null;
  KD_KELURAHAN_BERSAMA?: string | null;
  KD_BLOK_BERSAMA?: string | null;
  NO_URUT_BERSAMA?: string | null;
  KD_JNS_OP_BERSAMA?: string | null;

  // === DATA TRANSAKSI ASAL (CONDITIONAL - Optional dulu) ===
  KD_PROPINSI_ASAL?: string | null;
  KD_DATI2_ASAL?: string | null;
  KD_KECAMATAN_ASAL?: string | null;
  KD_KELURAHAN_ASAL?: string | null;
  KD_BLOK_ASAL?: string | null;
  NO_URUT_ASAL?: string | null;
  KD_JNS_OP_ASAL?: string | null;

  // === DATA TAMBAHAN (OPTIONAL) ===
  NO_SPPT_LAMA?: string; // OPTIONAL - hanya jika ada SPPT lama
  NOP_ASAL?: string; // OPTIONAL - hanya untuk mutasi
  NOP_BERSAMA?: string; // OPTIONAL - hanya untuk transaksi bersama

  // === DATA WAJIB PAJAK TAMBAHAN (OPTIONAL) ===
  NO_KTP?: string;
  NAMA_WP?: string;
  JALAN_WP?: string;
  TELP_WP?: string;
  KOTA_WP?: string;
  STATUS_PEKERJAAN_WP?: string;
  RT_WP?: string;
  RW_WP?: string;
  BLOK_KAV_NO_WP?: string;
  KD_POS_WP?: string;
  NPWP?: string;
  KELURAHAN_WP?: string;
  KELAS_BUMI?: string;
  NILAI_INDIVIDUAL_TOTAL?: number;
}

export const initialFormData: SpopFormData = {
  // Primary Keys (REQUIRED)
  KD_PROPINSI: "",
  KD_DATI2: "",
  KD_KECAMATAN: "",
  KD_KELURAHAN: "",
  KD_BLOK: "",
  NO_URUT: "",
  KD_JNS_OP: "",

  // Required fields
  SUBJEK_PAJAK_ID: "",
  JNS_TRANSAKSI_OP: "",
  NO_FORMULIR_SPOP: "",

  // Data Letak Objek Pajak
  JALAN_OP: "",
  BLOK_KAV_NO_OP: "",
  KELURAHAN_OP: "",
  RW_OP: "",
  RT_OP: "",

  // Data Subjek Pajak
  KD_STATUS_WP: "",

  // Data Tanah
  LUAS_BUMI: 0,
  KD_ZNT: "",
  JNS_BUMI: "",
  NILAI_SISTEM_BUMI: 0,
  NO_PERSIL: "",

  // Identitas Pendata
  NM_PENDATAAN_OP: "",
  NIP_PENDATA: "",
  TGL_PENDATAAN_OP: "",
  NM_PEMERIKSAAN_OP: "",
  NIP_PEMERIKSA_OP: "",
  TGL_PEMERIKSAAN_OP: "",

  // Data untuk transaksi "BERSAMA"
  KD_PROPINSI_BERSAMA: "",
  KD_DATI2_BERSAMA: "",
  KD_KECAMATAN_BERSAMA: "",
  KD_KELURAHAN_BERSAMA: "",
  KD_BLOK_BERSAMA: "",
  NO_URUT_BERSAMA: "",
  KD_JNS_OP_BERSAMA: "",

  // Data untuk transaksi "ASAL"
  KD_PROPINSI_ASAL: "",
  KD_DATI2_ASAL: "",
  KD_KECAMATAN_ASAL: "",
  KD_KELURAHAN_ASAL: "",
  KD_BLOK_ASAL: "",
  NO_URUT_ASAL: "",
  KD_JNS_OP_ASAL: "",

  // Data tambahan
  NO_SPPT_LAMA: "",
  NOP_ASAL: "",
  NOP_BERSAMA: "",

  // Data wajib pajak tambahan
  NO_KTP: "",
  NAMA_WP: "",
  JALAN_WP: "",
  TELP_WP: "",
  KOTA_WP: "",
  STATUS_PEKERJAAN_WP: "",
  RT_WP: "",
  RW_WP: "",
  BLOK_KAV_NO_WP: "",
  KD_POS_WP: "",
  NPWP: "",
  KELURAHAN_WP: "",
  KELAS_BUMI: "",
  NILAI_INDIVIDUAL_TOTAL: 0,
};
