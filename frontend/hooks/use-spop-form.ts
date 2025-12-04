// hooks/use-spop-form.ts
import { useState, useEffect } from "react";
import { SpopFormData, initialFormData } from "@/types/spop-types";

// Interface untuk data dari API
interface SpopApiData {
  NO_FORMULIR_SPOP?: string;
  NO_SPPT_LAMA?: string;
  JALAN_OP?: string;
  BLOK_KAV_NO_OP?: string;
  KELURAHAN_OP?: string;
  RW_OP?: string;
  RT_OP?: string;
  KD_STATUS_WP?: string;
  LUAS_BUMI?: number;
  KD_ZNT?: string;
  JNS_BUMI?: string;
  NILAI_SISTEM_BUMI?: number;
  TGL_PENDATAAN_OP?: string;
  NM_PENDATAAN_OP?: string;
  NIP_PENDATA?: string;
  TGL_PEMERIKSAAN_OP?: string;
  NM_PEMERIKSAAN_OP?: string;
  NIP_PEMERIKSA_OP?: string;
  NOP_ASAL?: string;
  NOP_BERSAMA?: string;
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

export function useSpopForm(nop: string | null, spopData: SpopApiData | null) {
  const [formData, setFormData] = useState<SpopFormData>(initialFormData);

  // Reset form ketika nop berubah (edit mode vs create mode)
  useEffect(() => {
    if (nop && spopData) {
      // Jika ada data dari API, isi form dengan data tersebut
      setFormData({
        ...initialFormData,
        ...spopData,
        // Pastikan field-field yang required tidak undefined
        NO_FORMULIR_SPOP: spopData.NO_FORMULIR_SPOP || '',
        NO_SPPT_LAMA: spopData.NO_SPPT_LAMA || '',
        JALAN_OP: spopData.JALAN_OP || '',
        BLOK_KAV_NO_OP: spopData.BLOK_KAV_NO_OP || '',
        KELURAHAN_OP: spopData.KELURAHAN_OP || '',
        RW_OP: spopData.RW_OP || '',
        RT_OP: spopData.RT_OP || '',
        KD_STATUS_WP: spopData.KD_STATUS_WP || '',
        LUAS_BUMI: spopData.LUAS_BUMI || 0,
        KD_ZNT: spopData.KD_ZNT || '',
        JNS_BUMI: spopData.JNS_BUMI || '',
        NILAI_SISTEM_BUMI: spopData.NILAI_SISTEM_BUMI || 0,
        TGL_PENDATAAN_OP: spopData.TGL_PENDATAAN_OP || '',
        NM_PENDATAAN_OP: spopData.NM_PENDATAAN_OP || '',
        NIP_PENDATA: spopData.NIP_PENDATA || '',
        TGL_PEMERIKSAAN_OP: spopData.TGL_PEMERIKSAAN_OP || '',
        NM_PEMERIKSAAN_OP: spopData.NM_PEMERIKSAAN_OP || '',
        NIP_PEMERIKSA_OP: spopData.NIP_PEMERIKSA_OP || '',
        // Field lainnya
        NOP_ASAL: spopData.NOP_ASAL || '',
        NOP_BERSAMA: spopData.NOP_BERSAMA || '',
        NO_KTP: spopData.NO_KTP || '',
        NAMA_WP: spopData.NAMA_WP || '',
        JALAN_WP: spopData.JALAN_WP || '',
        TELP_WP: spopData.TELP_WP || '',
        KOTA_WP: spopData.KOTA_WP || '',
        STATUS_PEKERJAAN_WP: spopData.STATUS_PEKERJAAN_WP || '',
        RT_WP: spopData.RT_WP || '',
        RW_WP: spopData.RW_WP || '',
        BLOK_KAV_NO_WP: spopData.BLOK_KAV_NO_WP || '',
        KD_POS_WP: spopData.KD_POS_WP || '',
        NPWP: spopData.NPWP || '',
        KELURAHAN_WP: spopData.KELURAHAN_WP || '',
        KELAS_BUMI: spopData.KELAS_BUMI || '',
        NILAI_INDIVIDUAL_TOTAL: spopData.NILAI_INDIVIDUAL_TOTAL || 0
      });
    } else {
      // Reset ke initial state untuk create mode
      setFormData(initialFormData);
    }
  }, [nop, spopData]);

  // Handler untuk update form data
  const updateFormData = (newData: SpopFormData) => {
    setFormData(newData);
  };

  // Handler untuk update field tertentu
  const updateField = (field: keyof SpopFormData, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Reset form
  const resetForm = () => {
    setFormData(initialFormData);
  };

  return {
    formData,
    setFormData: updateFormData,
    updateField,
    resetForm
  };
}