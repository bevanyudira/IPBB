/* eslint-disable @typescript-eslint/no-explicit-any */
import { z } from "zod";
import { SpopFormData, initialFormData } from "@/types/spop-types";

// Buat Zod schema berdasarkan SpopFormData
export const spopFormSchema = z.object({
  // === PRIMARY KEYS & IDENTIFIKASI (REQUIRED) ===
  KD_PROPINSI: z.string().min(2, "Kode Propinsi wajib 2 digit").max(2),
  KD_DATI2: z.string().min(2, "Kode Dati II wajib 2 digit").max(2),
  KD_KECAMATAN: z.string().min(3, "Kode Kecamatan wajib 3 digit").max(3),
  KD_KELURAHAN: z.string().min(3, "Kode Kelurahan wajib 3 digit").max(3),
  KD_BLOK: z.string().min(3, "Kode Blok wajib 3 digit").max(3),
  NO_URUT: z.string().min(4, "No Urut wajib 4 digit").max(4),
  KD_JNS_OP: z.string().length(1, "Kode Jenis OP wajib 1 digit"),
  
  // === DATA WAJIB OBJEK PAJAK (REQUIRED) ===
  SUBJEK_PAJAK_ID: z.string().min(1, "Subjek Pajak ID wajib diisi"),
  JNS_TRANSAKSI_OP: z.string().min(1, "Jenis Transaksi wajib dipilih"),
  NO_FORMULIR_SPOP: z.string().min(1, "No Formulir SPOP wajib diisi"),
  
  // === DATA LETAK OBJEK PAJAK ===
  JALAN_OP: z.string().min(1, "JALAN wajib diisi"),
  BLOK_KAV_NO_OP: z.string().optional(),
  KELURAHAN_OP: z.string().optional(),
  RW_OP: z.string().max(2, "RW maksimal 2 karakter").optional(),
  RT_OP: z.string().max(3, "RT maksimal 3 karakter").optional(),
  
  // === DATA SUBJEK PAJAK (REQUIRED) ===
  KD_STATUS_WP: z.string().min(1, "Status WP wajib dipilih"),
  
  // === DATA TANAH (REQUIRED) ===
  LUAS_BUMI: z.coerce
  .number()
  .min(0.01, "Luas bumi harus lebih dari 0"),
  KD_ZNT: z.string().min(1, "Kode ZNT wajib diisi"),
  JNS_BUMI: z.string().min(1, "Jenis Bumi wajib dipilih"),
  NILAI_SISTEM_BUMI: z.coerce
  .number()
  .min(0, "Nilai sistem harus ≥ 0"),
  NO_PERSIL: z.string().optional(),
  
  // === IDENTITAS PENDATA (REQUIRED) ===
  NM_PENDATAAN_OP: z.string().min(1, "Nama Pendata wajib diisi"),
  NIP_PENDATA: z.string().min(1, "NIP Pendata wajib diisi"),
  TGL_PENDATAAN_OP: z.string().min(1, "Tanggal Pendataan wajib diisi"),
  
  // === IDENTITAS PEMERIKSA (OPTIONAL) ===
  NM_PEMERIKSAAN_OP: z.string().optional(),
  NIP_PEMERIKSA_OP: z.string().optional(),
  TGL_PEMERIKSAAN_OP: z.string().optional(),
  
  // === DATA TRANSAKSI BERSAMA (OPTIONAL) ===
  KD_PROPINSI_BERSAMA: z.string().optional(),
  KD_DATI2_BERSAMA: z.string().optional(),
  KD_KECAMATAN_BERSAMA: z.string().optional(),
  KD_KELURAHAN_BERSAMA: z.string().optional(),
  KD_BLOK_BERSAMA: z.string().optional(),
  NO_URUT_BERSAMA: z.string().optional(),
  KD_JNS_OP_BERSAMA: z.string().optional(),
  
  // === DATA TRANSAKSI ASAL (OPTIONAL) ===
  KD_PROPINSI_ASAL: z.string().optional(),
  KD_DATI2_ASAL: z.string().optional(),
  KD_KECAMATAN_ASAL: z.string().optional(),
  KD_KELURAHAN_ASAL: z.string().optional(),
  KD_BLOK_ASAL: z.string().optional(),
  NO_URUT_ASAL: z.string().optional(),
  KD_JNS_OP_ASAL: z.string().optional(),
  
  // === DATA TAMBAHAN (OPTIONAL) ===
  NO_SPPT_LAMA: z.string().optional(),
  NOP_ASAL: z.string().optional(),
  NOP_BERSAMA: z.string().optional(),
  
  // === DATA WAJIB PAJAK TAMBAHAN (OPTIONAL) ===
  NO_KTP: z.string().optional(),
  NAMA_WP: z.string().optional(),
  JALAN_WP: z.string().optional(),
  TELP_WP: z.string().optional(),
  KOTA_WP: z.string().optional(),
  STATUS_PEKERJAAN_WP: z.string().optional(),
  RT_WP: z.string().optional(),
  RW_WP: z.string().optional(),
  BLOK_KAV_NO_WP: z.string().optional(),
  KD_POS_WP: z.string().optional(),
  NPWP: z.string().optional(),
  KELURAHAN_WP: z.string().optional(),
  KELAS_BUMI: z.string().optional(),
  NILAI_INDIVIDUAL_TOTAL: z.coerce
  .number()
  .min(0, "Nilai harus ≥ 0")
  .optional(),
}) satisfies z.ZodType<SpopFormData>;

// Gunakan SpopFormData langsung (tidak buat tipe baru)
export const defaultFormValues: SpopFormData = initialFormData;

// Helper function untuk konversi dari API ke form values
export const mapApiToFormValues = (apiData: any): SpopFormData => {
  return {
    ...defaultFormValues,
    ...apiData,
    // Pastikan tipe data sesuai
    LUAS_BUMI: apiData.LUAS_BUMI ? parseFloat(apiData.LUAS_BUMI) : 0,
    NILAI_SISTEM_BUMI: apiData.NILAI_SISTEM_BUMI ? parseFloat(apiData.NILAI_SISTEM_BUMI) : 0,
  };
};