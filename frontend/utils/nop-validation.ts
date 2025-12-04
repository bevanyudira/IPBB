// utils/nop-validation.ts
export const validateNOP = (nop: string): {
  isValid: boolean
  error?: string
  components?: {
    kdPropinsi: string
    kdDati2: string
    kdKecamatan: string
    kdKelurahan: string
    kdBlok: string
    noUrut: string
    kdJnsOp: string
  }
} => {
  // Validasi length dan numeric
  if (!nop || nop.length !== 18) {
    return { isValid: false, error: "NOP harus 18 digit" }
  }
  
  if (!/^\d{18}$/.test(nop)) {
    return { isValid: false, error: "NOP harus berupa angka" }
  }

  // Validasi komponen
  const kdPropinsi = nop.substring(0, 2)
  const kdDati2 = nop.substring(2, 4)
  const kdKecamatan = nop.substring(4, 7)
  const kdKelurahan = nop.substring(7, 10)
  const kdBlok = nop.substring(10, 13)
  const noUrut = nop.substring(13, 17)
  const kdJnsOp = nop.substring(17, 18)

  // Validasi range (contoh: kode propinsi 11-19 untuk Jawa)
  const propinsiNum = parseInt(kdPropinsi)
  if (propinsiNum < 11 || propinsiNum > 94) {
    return { isValid: false, error: "Kode propinsi tidak valid" }
  }

  return {
    isValid: true,
    components: {
      kdPropinsi,
      kdDati2,
      kdKecamatan,
      kdKelurahan,
      kdBlok,
      noUrut,
      kdJnsOp
    }
  }
}