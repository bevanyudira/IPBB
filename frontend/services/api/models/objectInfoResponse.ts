/**
 * Generated type for ObjectInfoResponse
 * Based on backend schema: app/sppt/schemas.py
 */
export interface ObjectInfoResponse {
  // Basic object identification
  nomor_objek_pajak: string
  KD_PROPINSI?: string | null
  KD_DATI2?: string | null

  // Taxpayer information
  nama_wajib_pajak?: string | null
  telpon_wajib_pajak?: string | null
  alamat_wajib_pajak?: string | null

  // Object location
  alamat_objek_pajak?: string | null
  kecamatan_objek_pajak?: string | null
  kelurahan_objek_pajak?: string | null

  // Land information
  luas_bumi?: number | null
  njop_bumi?: number | null

  // Building information
  luas_bangunan?: number | null
  njop_bangunan?: number | null
}
