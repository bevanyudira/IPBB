/* eslint-disable @typescript-eslint/no-explicit-any */
import { z } from "zod";
import { SpopFormData } from "@/types/spop-types";

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
  LUAS_BUMI: z.coerce.number().min(0.01, "Luas bumi harus lebih dari 0"),
  KD_ZNT: z.string().min(1, "Kode ZNT wajib diisi"),
  JNS_BUMI: z.string().min(1, "Jenis Bumi wajib dipilih"),
  NILAI_SISTEM_BUMI: z.coerce.number().min(0, "Nilai sistem harus ≥ 0"),
  NO_PERSIL: z.string().nullable().optional(),

  // === IDENTITAS PENDATA (REQUIRED) ===
  NM_PENDATAAN_OP: z.string().min(1, "Nama Pendata wajib diisi"),
  NIP_PENDATA: z.string().min(1, "NIP Pendata wajib diisi"),
  TGL_PENDATAAN_OP: z.string().min(1, "Tanggal Pendataan wajib diisi"),

  // === IDENTITAS PEMERIKSA (OPTIONAL) ===
  NM_PEMERIKSAAN_OP: z.string().optional(),
  NIP_PEMERIKSA_OP: z.string().optional(),
  TGL_PEMERIKSAAN_OP: z.string().optional(),

  // === DATA TRANSAKSI BERSAMA (OPTIONAL) ===
  KD_PROPINSI_BERSAMA: z.string().nullable().optional(),
  KD_DATI2_BERSAMA: z.string().nullable().optional(),
  KD_KECAMATAN_BERSAMA: z.string().nullable().optional(),
  KD_KELURAHAN_BERSAMA: z.string().nullable().optional(),
  KD_BLOK_BERSAMA: z.string().nullable().optional(),
  NO_URUT_BERSAMA: z.string().nullable().optional(),
  KD_JNS_OP_BERSAMA: z.string().nullable().optional(),

  // === DATA TRANSAKSI ASAL (OPTIONAL) ===
  KD_PROPINSI_ASAL: z.string().nullable().optional(),
  KD_DATI2_ASAL: z.string().nullable().optional(),
  KD_KECAMATAN_ASAL: z.string().nullable().optional(),
  KD_KELURAHAN_ASAL: z.string().nullable().optional(),
  KD_BLOK_ASAL: z.string().nullable().optional(),
  NO_URUT_ASAL: z.string().nullable().optional(),
  KD_JNS_OP_ASAL: z.string().nullable().optional(),

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

export const defaultFormValues: SpopFormData = {
  // Field NOP utama
  NOP_ASAL: "",
  NO_FORMULIR_SPOP: "",
  NO_SPPT_LAMA: "",
  NOP_BERSAMA: "",

  // Field-field KD (akan diisi otomatis dari NOP_ASAL)
  KD_PROPINSI: "",
  KD_DATI2: "",
  KD_KECAMATAN: "",
  KD_KELURAHAN: "",
  KD_BLOK: "",
  NO_URUT: "",
  KD_JNS_OP: "",

  // SUBJEK_PAJAK_ID (18 digit) sama dengan NOP_ASAL
  SUBJEK_PAJAK_ID: "",

  // Field lainnya
  JNS_TRANSAKSI_OP: "1",
  JALAN_OP: "",
  BLOK_KAV_NO_OP: "",
  KELURAHAN_OP: "",
  RW_OP: "",
  RT_OP: "",
  KD_STATUS_WP: "",
  LUAS_BUMI: 0,
  KD_ZNT: "",
  JNS_BUMI: "",
  NILAI_SISTEM_BUMI: 0,
  TGL_PENDATAAN_OP: "",
  NM_PENDATAAN_OP: "",
  NIP_PENDATA: "",
  TGL_PEMERIKSAAN_OP: "",
  NM_PEMERIKSAAN_OP: "",
  NIP_PEMERIKSA_OP: "",
  NO_PERSIL: "",
  // DATA WAJIB PAJAK TAMBAHAN
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
  // DATA TRANSAKSI BERSAMA
  KD_PROPINSI_BERSAMA: "",
  KD_DATI2_BERSAMA: "",
  KD_KECAMATAN_BERSAMA: "",
  KD_KELURAHAN_BERSAMA: "",
  KD_BLOK_BERSAMA: "",
  NO_URUT_BERSAMA: "",
  KD_JNS_OP_BERSAMA: "",
  // DATA TRANSAKSI ASAL
  KD_PROPINSI_ASAL: "",
  KD_DATI2_ASAL: "",
  KD_KECAMATAN_ASAL: "",
  KD_KELURAHAN_ASAL: "",
  KD_BLOK_ASAL: "",
  NO_URUT_ASAL: "",
  KD_JNS_OP_ASAL: "",
};

export function mapApiToFormValues(apiData: any): SpopFormData {
  // Helper function untuk convert empty string ke null
  const toNullIfEmpty = (value: any) => (value === "" ? null : value);
  const toNullIfEmptyDate = (value: any) => (value === "" ? null : value);

  // Jika ada field KD, buat NOP_ASAL dari mereka
  let NOP_ASAL = "";
  if (
    apiData.KD_PROPINSI &&
    apiData.KD_DATI2 &&
    apiData.KD_KECAMATAN &&
    apiData.KD_KELURAHAN &&
    apiData.KD_BLOK &&
    apiData.NO_URUT &&
    apiData.KD_JNS_OP
  ) {
    const pad = (v: any, len: number) => String(v ?? "").padStart(len, "0");
    NOP_ASAL = `${pad(apiData.KD_PROPINSI, 2)}${pad(apiData.KD_DATI2, 2)}${pad(
      apiData.KD_KECAMATAN,
      3
    )}${pad(apiData.KD_KELURAHAN, 3)}${pad(apiData.KD_BLOK, 3)}${pad(
      apiData.NO_URUT,
      4
    )}${pad(apiData.KD_JNS_OP, 1)}`;
  }

  return {
    // Field NOP utama
    NOP_ASAL: NOP_ASAL || apiData.NOP_ASAL || "",
    NO_FORMULIR_SPOP: apiData.NO_FORMULIR_SPOP || "",
    NO_SPPT_LAMA: toNullIfEmpty(apiData.NO_SPPT_LAMA),
    NOP_BERSAMA: toNullIfEmpty(apiData.NOP_BERSAMA),

    // Field-field KD
    KD_PROPINSI: apiData.KD_PROPINSI || "",
    KD_DATI2: apiData.KD_DATI2 || "",
    KD_KECAMATAN: apiData.KD_KECAMATAN || "",
    KD_KELURAHAN: apiData.KD_KELURAHAN || "",
    KD_BLOK: apiData.KD_BLOK || "",
    NO_URUT: apiData.NO_URUT || "",
    KD_JNS_OP: apiData.KD_JNS_OP || "",

    // SUBJEK_PAJAK_ID sama dengan NOP_ASAL (18 digit)
    SUBJEK_PAJAK_ID: apiData.SUBJEK_PAJAK_ID || NOP_ASAL || "",

    // Field lainnya dengan default values
    JNS_TRANSAKSI_OP: apiData.JNS_TRANSAKSI_OP || "1",
    JALAN_OP: apiData.JALAN_OP || "",
    BLOK_KAV_NO_OP: toNullIfEmpty(apiData.BLOK_KAV_NO_OP),
    KELURAHAN_OP: toNullIfEmpty(apiData.KELURAHAN_OP),
    RW_OP: toNullIfEmpty(apiData.RW_OP),
    RT_OP: toNullIfEmpty(apiData.RT_OP),
    KD_STATUS_WP: apiData.KD_STATUS_WP || "",
    LUAS_BUMI: apiData.LUAS_BUMI || 0,
    KD_ZNT: apiData.KD_ZNT || "",
    JNS_BUMI: apiData.JNS_BUMI || "",
    NILAI_SISTEM_BUMI: apiData.NILAI_SISTEM_BUMI || 0,
    TGL_PENDATAAN_OP: apiData.TGL_PENDATAAN_OP || "",
    NM_PENDATAAN_OP: apiData.NM_PENDATAAN_OP || "",
    NIP_PENDATA: apiData.NIP_PENDATA || "",
    // Field tanggal untuk pemeriksa: kirim null jika kosong
    TGL_PEMERIKSAAN_OP: toNullIfEmptyDate(apiData.TGL_PEMERIKSAAN_OP),
    NM_PEMERIKSAAN_OP: toNullIfEmpty(apiData.NM_PEMERIKSAAN_OP),
    NIP_PEMERIKSA_OP: toNullIfEmpty(apiData.NIP_PEMERIKSA_OP),
    NO_PERSIL: toNullIfEmpty(apiData.NO_PERSIL),
    // DATA WAJIB PAJAK TAMBAHAN
    NO_KTP: toNullIfEmpty(apiData.NO_KTP),
    NAMA_WP: toNullIfEmpty(apiData.NAMA_WP),
    JALAN_WP: toNullIfEmpty(apiData.JALAN_WP),
    TELP_WP: toNullIfEmpty(apiData.TELP_WP),
    KOTA_WP: toNullIfEmpty(apiData.KOTA_WP),
    STATUS_PEKERJAAN_WP: toNullIfEmpty(apiData.STATUS_PEKERJAAN_WP),
    RT_WP: toNullIfEmpty(apiData.RT_WP),
    RW_WP: toNullIfEmpty(apiData.RW_WP),
    BLOK_KAV_NO_WP: toNullIfEmpty(apiData.BLOK_KAV_NO_WP),
    KD_POS_WP: toNullIfEmpty(apiData.KD_POS_WP),
    NPWP: toNullIfEmpty(apiData.NPWP),
    KELURAHAN_WP: toNullIfEmpty(apiData.KELURAHAN_WP),
    KELAS_BUMI: toNullIfEmpty(apiData.KELAS_BUMI),
    NILAI_INDIVIDUAL_TOTAL: apiData.NILAI_INDIVIDUAL_TOTAL || 0,
    // DATA TRANSAKSI BERSAMA
    KD_PROPINSI_BERSAMA: toNullIfEmpty(apiData.KD_PROPINSI_BERSAMA),
    KD_DATI2_BERSAMA: toNullIfEmpty(apiData.KD_DATI2_BERSAMA),
    KD_KECAMATAN_BERSAMA: toNullIfEmpty(apiData.KD_KECAMATAN_BERSAMA),
    KD_KELURAHAN_BERSAMA: toNullIfEmpty(apiData.KD_KELURAHAN_BERSAMA),
    KD_BLOK_BERSAMA: toNullIfEmpty(apiData.KD_BLOK_BERSAMA),
    NO_URUT_BERSAMA: toNullIfEmpty(apiData.NO_URUT_BERSAMA),
    KD_JNS_OP_BERSAMA: toNullIfEmpty(apiData.KD_JNS_OP_BERSAMA),
    // DATA TRANSAKSI ASAL
    KD_PROPINSI_ASAL: toNullIfEmpty(apiData.KD_PROPINSI_ASAL),
    KD_DATI2_ASAL: toNullIfEmpty(apiData.KD_DATI2_ASAL),
    KD_KECAMATAN_ASAL: toNullIfEmpty(apiData.KD_KECAMATAN_ASAL),
    KD_KELURAHAN_ASAL: toNullIfEmpty(apiData.KD_KELURAHAN_ASAL),
    KD_BLOK_ASAL: toNullIfEmpty(apiData.KD_BLOK_ASAL),
    NO_URUT_ASAL: toNullIfEmpty(apiData.NO_URUT_ASAL),
    KD_JNS_OP_ASAL: toNullIfEmpty(apiData.KD_JNS_OP_ASAL),
  };
}

// Fungsi tambahan untuk membantu debugging
export const debugNOPBreakdown = (nop: string) => {
  if (!nop || nop.length !== 18) {
    console.error("NOP harus 18 digit");
    return null;
  }

  return {
    KD_PROPINSI: nop.substring(0, 2),
    KD_DATI2: nop.substring(2, 4),
    KD_KECAMATAN: nop.substring(4, 7),
    KD_KELURAHAN: nop.substring(7, 10),
    KD_BLOK: nop.substring(10, 13),
    NO_URUT: nop.substring(13, 17),
    KD_JNS_OP: nop.substring(17, 18),
  };
};

// Fungsi untuk membuat NOP dari komponen
export const buildNOPFromComponents = (
  kdPropinsi: string,
  kdDati2: string,
  kdKecamatan: string,
  kdKelurahan: string,
  kdBlok: string,
  noUrut: string,
  kdJnsOp: string
): string => {
  const pad = (v: any, len: number) => String(v ?? "").padStart(len, "0");
  return `${pad(kdPropinsi, 2)}${pad(kdDati2, 2)}${pad(kdKecamatan, 3)}${pad(
    kdKelurahan,
    3
  )}${pad(kdBlok, 3)}${pad(noUrut, 4)}${pad(kdJnsOp, 1)}`;
};
