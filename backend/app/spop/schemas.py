from pydantic import BaseModel, Field, field_validator
from typing import Optional
from datetime import date


class SpopBase(BaseModel):
    """Base schema untuk SPOP"""
    # Primary Keys
    KD_PROPINSI: str = Field(..., max_length=6, description="Kode Provinsi")
    KD_DATI2: str = Field(..., max_length=6, description="Kode Kabupaten/Kota")
    KD_KECAMATAN: str = Field(..., max_length=9, description="Kode Kecamatan")
    KD_KELURAHAN: str = Field(..., max_length=9, description="Kode Kelurahan")
    KD_BLOK: str = Field(..., max_length=9, description="Kode Blok")
    NO_URUT: str = Field(..., max_length=12, description="Nomor Urut")
    KD_JNS_OP: str = Field(..., max_length=3, description="Kode Jenis Objek Pajak")
    
    # Subjek Pajak
    SUBJEK_PAJAK_ID: str = Field(..., max_length=90, description="ID Subjek Pajak")
    
    # Informasi Formulir
    NO_FORMULIR_SPOP: Optional[str] = Field(None, max_length=33, description="Nomor Formulir SPOP")
    JNS_TRANSAKSI_OP: str = Field(..., max_length=3, description="Jenis Transaksi OP")
    
    # Kode Bersama (untuk tanah bersama)
    KD_PROPINSI_BERSAMA: Optional[str] = Field(None, max_length=6)
    KD_DATI2_BERSAMA: Optional[str] = Field(None, max_length=6)
    KD_KECAMATAN_BERSAMA: Optional[str] = Field(None, max_length=9)
    KD_KELURAHAN_BERSAMA: Optional[str] = Field(None, max_length=9)
    KD_BLOK_BERSAMA: Optional[str] = Field(None, max_length=9)
    NO_URUT_BERSAMA: Optional[str] = Field(None, max_length=12)
    KD_JNS_OP_BERSAMA: Optional[str] = Field(None, max_length=3)
    
    # Kode Asal (untuk mutasi)
    KD_PROPINSI_ASAL: Optional[str] = Field(None, max_length=6)
    KD_DATI2_ASAL: Optional[str] = Field(None, max_length=6)
    KD_KECAMATAN_ASAL: Optional[str] = Field(None, max_length=9)
    KD_KELURAHAN_ASAL: Optional[str] = Field(None, max_length=9)
    KD_BLOK_ASAL: Optional[str] = Field(None, max_length=9)
    NO_URUT_ASAL: Optional[str] = Field(None, max_length=12)
    KD_JNS_OP_ASAL: Optional[str] = Field(None, max_length=3)
    NO_SPPT_LAMA: Optional[str] = Field(None, max_length=54, description="Nomor SPPT Lama")
    
    # Alamat Objek Pajak
    JALAN_OP: str = Field(..., max_length=90, description="Jalan/Alamat Objek Pajak")
    BLOK_KAV_NO_OP: Optional[str] = Field(None, max_length=45, description="Blok/Kavling/Nomor")
    KELURAHAN_OP: Optional[str] = Field(None, max_length=90, description="Nama Kelurahan OP")
    RW_OP: Optional[str] = Field(None, max_length=6, description="RW")
    RT_OP: Optional[str] = Field(None, max_length=9, description="RT")
    
    # Status dan Informasi Tanah
    KD_STATUS_WP: str = Field(..., max_length=3, description="Kode Status Wajib Pajak")
    LUAS_BUMI: int = Field(..., ge=0, description="Luas Tanah (m²)")
    KD_ZNT: Optional[str] = Field(None, max_length=2, description="Kode Zona Nilai Tanah")
    JNS_BUMI: str = Field(..., max_length=3, description="Jenis Tanah")
    NILAI_SISTEM_BUMI: int = Field(default=0, ge=0, description="Nilai Sistem Tanah")
    
    # Informasi Pendataan
    TGL_PENDATAAN_OP: date = Field(..., description="Tanggal Pendataan")
    NM_PENDATAAN_OP: Optional[str] = Field(None, max_length=90, description="Nama Petugas Pendataan")
    NIP_PENDATA: Optional[str] = Field(None, max_length=60, description="NIP Petugas Pendataan")
    
    # Informasi Pemeriksaan
    TGL_PEMERIKSAAN_OP: date = Field(..., description="Tanggal Pemeriksaan")
    NM_PEMERIKSAAN_OP: Optional[str] = Field(None, max_length=90, description="Nama Pemeriksa")
    NIP_PEMERIKSA_OP: Optional[str] = Field(None, max_length=60, description="NIP Pemeriksa")
    
    # Nomor Persil
    NO_PERSIL: Optional[str] = Field(None, max_length=15, description="Nomor Persil")


class SpopCreate(SpopBase):
    """Schema untuk membuat SPOP baru"""
    
    @field_validator('KD_PROPINSI', 'KD_DATI2', 'KD_KECAMATAN', 'KD_KELURAHAN', 'KD_BLOK', 'NO_URUT', 'KD_JNS_OP')
    @classmethod
    def validate_not_empty(cls, v: str) -> str:
        if not v or not v.strip():
            raise ValueError('Field tidak boleh kosong')
        return v.strip()


class SpopUpdate(BaseModel):
    """Schema untuk update SPOP (semua field optional kecuali primary key)"""
    # Primary Keys - tidak bisa diubah, hanya untuk identifikasi
    KD_PROPINSI: str
    KD_DATI2: str
    KD_KECAMATAN: str
    KD_KELURAHAN: str
    KD_BLOK: str
    NO_URUT: str
    KD_JNS_OP: str
    
    # Field yang bisa diupdate
    SUBJEK_PAJAK_ID: Optional[str] = None
    NO_FORMULIR_SPOP: Optional[str] = None
    JNS_TRANSAKSI_OP: Optional[str] = None
    
    KD_PROPINSI_BERSAMA: Optional[str] = None
    KD_DATI2_BERSAMA: Optional[str] = None
    KD_KECAMATAN_BERSAMA: Optional[str] = None
    KD_KELURAHAN_BERSAMA: Optional[str] = None
    KD_BLOK_BERSAMA: Optional[str] = None
    NO_URUT_BERSAMA: Optional[str] = None
    KD_JNS_OP_BERSAMA: Optional[str] = None
    
    KD_PROPINSI_ASAL: Optional[str] = None
    KD_DATI2_ASAL: Optional[str] = None
    KD_KECAMATAN_ASAL: Optional[str] = None
    KD_KELURAHAN_ASAL: Optional[str] = None
    KD_BLOK_ASAL: Optional[str] = None
    NO_URUT_ASAL: Optional[str] = None
    KD_JNS_OP_ASAL: Optional[str] = None
    NO_SPPT_LAMA: Optional[str] = None
    
    JALAN_OP: Optional[str] = None
    BLOK_KAV_NO_OP: Optional[str] = None
    KELURAHAN_OP: Optional[str] = None
    RW_OP: Optional[str] = None
    RT_OP: Optional[str] = None
    
    KD_STATUS_WP: Optional[str] = None
    LUAS_BUMI: Optional[int] = None
    KD_ZNT: Optional[str] = None
    JNS_BUMI: Optional[str] = None
    NILAI_SISTEM_BUMI: Optional[int] = None
    
    TGL_PENDATAAN_OP: Optional[date] = None
    NM_PENDATAAN_OP: Optional[str] = None
    NIP_PENDATA: Optional[str] = None
    
    TGL_PEMERIKSAAN_OP: Optional[date] = None
    NM_PEMERIKSAAN_OP: Optional[str] = None
    NIP_PEMERIKSA_OP: Optional[str] = None
    
    NO_PERSIL: Optional[str] = None


class SpopRead(SpopBase):
    """Schema untuk membaca SPOP"""
    # Tambahan field untuk relasi (jika ada)
    NM_PROPINSI: Optional[str] = None
    NM_DATI2: Optional[str] = None
    NM_KECAMATAN: Optional[str] = None
    NM_KELURAHAN: Optional[str] = None
    
    class Config:
        from_attributes = True


class SpopListResponse(BaseModel):
    """Response untuk list SPOP dengan pagination"""
    data: list[SpopRead]
    total: int
    page: int
    page_size: int
    total_pages: int


# Schemas untuk dropdown/reference data
class RefPropinsi(BaseModel):
    KD_PROPINSI: str
    NM_PROPINSI: str
    
    class Config:
        from_attributes = True


class RefDati2(BaseModel):
    KD_PROPINSI: str
    KD_DATI2: str
    NM_DATI2: str
    
    class Config:
        from_attributes = True


class RefKecamatan(BaseModel):
    KD_PROPINSI: str
    KD_DATI2: str
    KD_KECAMATAN: str
    NM_KECAMATAN: str
    
    class Config:
        from_attributes = True


class RefKelurahan(BaseModel):
    KD_PROPINSI: str
    KD_DATI2: str
    KD_KECAMATAN: str
    KD_KELURAHAN: str
    KD_SEKTOR: str
    NM_KELURAHAN: str
    NO_KELURAHAN: Optional[int] = None
    KD_POS_KELURAHAN: Optional[str] = None
    
    class Config:
        from_attributes = True
