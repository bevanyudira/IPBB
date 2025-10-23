from sqlmodel import SQLModel, inspect
from pydantic import BaseModel
from typing import Optional, List
from datetime import date, datetime


class VerifikasiRequest(SQLModel):
    NOP: str
    NM_WP: str
    KD_PROPINSI: str
    KD_DATI2: str
    KD_KECAMATAN: str
    KD_KELURAHAN: str
    KD_BLOK: str
    NO_URUT: str
    KD_JNS_OP: str
    TELP_WP: str


class SpopResponse(SQLModel):
    NM_WP: Optional[str] = None
    JNS_TRANSAKSI_OP: str
    KD_PROPINSI_ASAL: Optional[str] = None
    JALAN_OP: Optional[str] = None
    JNS_BUMI: Optional[str] = None
    NIP_PEMERIKSA_OP: Optional[str] = None
    KD_PROPINSI_BERSAMA: Optional[str] = None
    KD_DATI2_ASAL: Optional[str] = None
    BLOK_KAV_NO_OP: Optional[str] = None
    NILAI_SISTEM_BUMI: int
    NO_PERSIL: Optional[str]
    KD_BLOK: str
    KD_DATI2_BERSAMA: Optional[str] = None
    KD_KECAMATAN_ASAL: Optional[str] = None
    KELURAHAN_OP: Optional[str] = None
    TGL_PENDATAAN_OP: date
    KD_DATI2: str
    KD_KECAMATAN_BERSAMA: Optional[str] = None
    KD_KELURAHAN_ASAL: Optional[str] = None
    RW_OP: Optional[str] = None
    NM_PENDATAAN_OP: Optional[str] = None
    NO_URUT: str
    KD_KELURAHAN_BERSAMA: Optional[str] = None
    KD_BLOK_ASAL: Optional[str] = None
    RT_OP: Optional[str] = None
    KD_KELURAHAN: str
    KD_JNS_OP: str
    KD_BLOK_BERSAMA: Optional[str] = None
    NO_URUT_ASAL: Optional[str] = None
    KD_STATUS_WP: Optional[str] = None
    NIP_PENDATA: Optional[str] = None
    KD_PROPINSI: str
    KD_KECAMATAN: str
    SUBJEK_PAJAK_ID: str
    NO_URUT_BERSAMA: Optional[str] = None
    KD_JNS_OP_ASAL: Optional[str] = None
    LUAS_BUMI: int
    TGL_PEMERIKSAAN_OP: date
    NO_FORMULIR_SPOP: Optional[str] = None
    KD_JNS_OP_BERSAMA: Optional[str] = None
    NO_SPPT_LAMA: Optional[str] = None
    KD_ZNT: Optional[str] = None
    NM_PEMERIKSAAN_OP: Optional[str] = None


class PaginationMeta(SQLModel):
    page: int
    per_page: int
    total: int
    total_pages: int


class SpopPaginatedResponse(SQLModel):
    data: List[SpopResponse]
    meta: PaginationMeta


class SpptResponse(SQLModel):
    KD_PROPINSI: str
    KD_DATI2: str
    KD_KECAMATAN: str
    KD_KELURAHAN: str
    KD_BLOK: str
    NO_URUT: str
    KD_JNS_OP: str
    THN_PAJAK_SPPT: str
    NM_WP_SPPT: Optional[str] = None
    JLN_WP_SPPT: Optional[str] = None
    BLOK_KAV_NO_WP_SPPT: Optional[str] = None
    RW_WP_SPPT: Optional[str] = None
    RT_WP_SPPT: Optional[str] = None
    KELURAHAN_WP_SPPT: Optional[str] = None
    KOTA_WP_SPPT: Optional[str] = None
    KD_POS_WP_SPPT: Optional[str] = None
    NPWP_SPPT: Optional[str] = None
    TGL_JATUH_TEMPO_SPPT: Optional[date] = None
    LUAS_BUMI_SPPT: Optional[int] = None
    LUAS_BNG_SPPT: Optional[int] = None
    NJOP_BUMI_SPPT: Optional[int] = None
    NJOP_BNG_SPPT: Optional[int] = None
    NJOP_SPPT: Optional[int] = None
    NJOPTKP_SPPT: Optional[int] = None
    NJKP_SPPT: Optional[int] = None
    PBB_TERHUTANG_SPPT: Optional[int] = None
    PBB_YG_HARUS_DIBAYAR_SPPT: Optional[int] = None
    STATUS_PEMBAYARAN_SPPT: Optional[bool] = None
    STATUS_TAGIHAN_SPPT: Optional[bool] = None
    TGL_TERBIT_SPPT: Optional[datetime] = None


class SpptYearResponse(SQLModel, table=False):  # not a table
    THN_PAJAK_SPPT: str
    count: int


class SpptYearsResponse(SQLModel):
    available_years: List[SpptYearResponse]


class SpptPaginatedResponse(SQLModel):
    data: List[SpptResponse]
    meta: PaginationMeta


# Add new response models for object listing
class SpptObjectResponse(SQLModel):
    KD_PROPINSI: str
    KD_DATI2: str
    KD_KECAMATAN: str
    KD_KELURAHAN: str
    KD_BLOK: str
    NO_URUT: str
    KD_JNS_OP: str
    NM_WP_SPPT: Optional[str] = None
    KELURAHAN_WP_SPPT: Optional[str] = None


class SpptObjectPaginatedResponse(SQLModel):
    data: List[SpptObjectResponse]
    meta: PaginationMeta


class SpptPaymentResponse(SQLModel):
    KD_PROPINSI: str
    KD_DATI2: str
    KD_KECAMATAN: str
    KD_KELURAHAN: str
    KD_BLOK: str
    NO_URUT: str
    KD_JNS_OP: str
    THN_PAJAK_SPPT: str
    total_denda: Optional[int] = None
    total_dibayar: Optional[int] = None
    tanggal_pembayaran: Optional[str] = None  # GROUP_CONCAT result as string


class ObjectInfoResponse(SQLModel):
    # Basic object identification
    nomor_objek_pajak: str
    KD_PROPINSI: Optional[str] = None
    KD_DATI2: Optional[str] = None

    # Taxpayer information
    nama_wajib_pajak: Optional[str] = None
    telpon_wajib_pajak: Optional[str] = None
    alamat_wajib_pajak: Optional[str] = None

    # Object location
    alamat_objek_pajak: Optional[str] = None
    kecamatan_objek_pajak: Optional[str] = None
    kelurahan_objek_pajak: Optional[str] = None

    # Land information
    luas_bumi: Optional[int] = None
    njop_bumi: Optional[int] = None

    # Building information
    luas_bangunan: Optional[int] = None
    njop_bangunan: Optional[int] = None


# ============================================
# SPOP Schemas untuk Admin
# ============================================

class SpopListResponse(SQLModel):
    """Response untuk list SPOP (tampilan card di admin)"""
    # NOP (Nomor Objek Pajak) - 18 digit
    NOP: str
    
    # Data dari composite key SPOP
    KD_PROPINSI: str
    KD_DATI2: str
    KD_KECAMATAN: str
    KD_KELURAHAN: str
    KD_BLOK: str
    NO_URUT: str
    KD_JNS_OP: str
    
    # Nama Wajib Pajak (dari dat_subjek_pajak)
    NM_WP: Optional[str] = None
    
    # Status Pembayaran (dari sppt tahun terbaru)
    STATUS_PEMBAYARAN_SPPT: Optional[bool] = None
    THN_PAJAK_SPPT: Optional[str] = None
    
    # Info tambahan untuk display
    JALAN_OP: Optional[str] = None
    KELURAHAN_OP: Optional[str] = None
    LUAS_BUMI: Optional[int] = None


class SpopListPaginatedResponse(SQLModel):
    """Response pagination untuk list SPOP"""
    data: List[SpopListResponse]
    meta: PaginationMeta


class SpopCreateRequest(SQLModel):
    """Request untuk create/update SPOP (form lengkap)"""
    
    # === Informasi Utama (NOP) ===
    KD_PROPINSI: str
    KD_DATI2: str
    KD_KECAMATAN: str
    KD_KELURAHAN: str
    KD_BLOK: str
    NO_URUT: str
    KD_JNS_OP: str
    
    # Jenis Transaksi (1=Pendaftaran Baru, 2=Pemutakhiran, 3=Pembatalan)
    JNS_TRANSAKSI_OP: Optional[str] = None
    
    # No Formulir SPOP
    NO_FORMULIR_SPOP: Optional[str] = None
    
    # NOP Bersama (untuk tanah bersama)
    KD_PROPINSI_BERSAMA: Optional[str] = None
    KD_DATI2_BERSAMA: Optional[str] = None
    KD_KECAMATAN_BERSAMA: Optional[str] = None
    KD_KELURAHAN_BERSAMA: Optional[str] = None
    KD_BLOK_BERSAMA: Optional[str] = None
    NO_URUT_BERSAMA: Optional[str] = None
    KD_JNS_OP_BERSAMA: Optional[str] = None
    
    # === Data Letak Objek Pajak ===
    JALAN_OP: Optional[str] = None
    RW_OP: Optional[str] = None
    RT_OP: Optional[str] = None
    BLOK_KAV_NO_OP: Optional[str] = None
    KELURAHAN_OP: Optional[str] = None
    
    # === Data Subjek Pajak ===
    SUBJEK_PAJAK_ID: Optional[str] = None  # No KTP
    KD_STATUS_WP: Optional[str] = None  # Status (1=Pemilik, 2=Penyewa, dst)
    
    # === Identitas Pendata/Pejabat ===
    TGL_PENDATAAN_OP: Optional[date] = None
    NM_PENDATAAN_OP: Optional[str] = None
    NIP_PENDATA: Optional[str] = None
    
    TGL_PEMERIKSAAN_OP: Optional[date] = None
    NM_PEMERIKSAAN_OP: Optional[str] = None
    NIP_PEMERIKSA_OP: Optional[str] = None
    
    # === Data Tanah ===
    LUAS_BUMI: Optional[int] = None
    KD_ZNT: Optional[str] = None  # Kode Zona Nilai Tanah
    JNS_BUMI: Optional[str] = None  # Jenis Bumi
    NILAI_SISTEM_BUMI: Optional[int] = None  # Nilai Individu/Total
    
    # No Persil
    NO_PERSIL: Optional[str] = None
    
    # NOP Asal (untuk perubahan/pemecahan)
    KD_PROPINSI_ASAL: Optional[str] = None
    KD_DATI2_ASAL: Optional[str] = None
    KD_KECAMATAN_ASAL: Optional[str] = None
    KD_KELURAHAN_ASAL: Optional[str] = None
    KD_BLOK_ASAL: Optional[str] = None
    NO_URUT_ASAL: Optional[str] = None
    KD_JNS_OP_ASAL: Optional[str] = None
    
    # No SPPT Lama
    NO_SPPT_LAMA: Optional[str] = None


class SpopDetailResponse(SQLModel):
    """Response untuk detail SPOP (untuk edit form)"""
    
    # Composite Key (NOP)
    KD_PROPINSI: str
    KD_DATI2: str
    KD_KECAMATAN: str
    KD_KELURAHAN: str
    KD_BLOK: str
    NO_URUT: str
    KD_JNS_OP: str
    
    # Data lengkap SPOP
    SUBJEK_PAJAK_ID: Optional[str] = None
    NO_FORMULIR_SPOP: Optional[str] = None
    JNS_TRANSAKSI_OP: Optional[str] = None
    
    # NOP Bersama
    KD_PROPINSI_BERSAMA: Optional[str] = None
    KD_DATI2_BERSAMA: Optional[str] = None
    KD_KECAMATAN_BERSAMA: Optional[str] = None
    KD_KELURAHAN_BERSAMA: Optional[str] = None
    KD_BLOK_BERSAMA: Optional[str] = None
    NO_URUT_BERSAMA: Optional[str] = None
    KD_JNS_OP_BERSAMA: Optional[str] = None
    
    # NOP Asal
    KD_PROPINSI_ASAL: Optional[str] = None
    KD_DATI2_ASAL: Optional[str] = None
    KD_KECAMATAN_ASAL: Optional[str] = None
    KD_KELURAHAN_ASAL: Optional[str] = None
    KD_BLOK_ASAL: Optional[str] = None
    NO_URUT_ASAL: Optional[str] = None
    KD_JNS_OP_ASAL: Optional[str] = None
    NO_SPPT_LAMA: Optional[str] = None
    
    # Letak Objek Pajak
    JALAN_OP: Optional[str] = None
    BLOK_KAV_NO_OP: Optional[str] = None
    KELURAHAN_OP: Optional[str] = None
    RW_OP: Optional[str] = None
    RT_OP: Optional[str] = None
    
    # Status
    KD_STATUS_WP: Optional[str] = None
    
    # Data Tanah
    LUAS_BUMI: Optional[int] = None
    KD_ZNT: Optional[str] = None
    JNS_BUMI: Optional[str] = None
    NILAI_SISTEM_BUMI: Optional[int] = None
    
    # Identitas Pendata
    TGL_PENDATAAN_OP: Optional[date] = None
    NM_PENDATAAN_OP: Optional[str] = None
    NIP_PENDATA: Optional[str] = None
    
    # Identitas Pemeriksa
    TGL_PEMERIKSAAN_OP: Optional[date] = None
    NM_PEMERIKSAAN_OP: Optional[str] = None
    NIP_PEMERIKSA_OP: Optional[str] = None
    
    # No Persil
    NO_PERSIL: Optional[str] = None
    
    # Data Wajib Pajak (dari join dengan dat_subjek_pajak)
    NM_WP: Optional[str] = None
    JALAN_WP: Optional[str] = None
    BLOK_KAV_NO_WP: Optional[str] = None
    RW_WP: Optional[str] = None
    RT_WP: Optional[str] = None
    KELURAHAN_WP: Optional[str] = None
    KOTA_WP: Optional[str] = None
    KD_POS_WP: Optional[str] = None
    NPWP: Optional[str] = None


class SpopUpdateRequest(SQLModel):
    """Request untuk update SPOP (sama dengan create tapi semua optional kecuali yang diubah)"""
    
    # Jenis Transaksi
    JNS_TRANSAKSI_OP: Optional[str] = None
    NO_FORMULIR_SPOP: Optional[str] = None
    
    # NOP Bersama
    KD_PROPINSI_BERSAMA: Optional[str] = None
    KD_DATI2_BERSAMA: Optional[str] = None
    KD_KECAMATAN_BERSAMA: Optional[str] = None
    KD_KELURAHAN_BERSAMA: Optional[str] = None
    KD_BLOK_BERSAMA: Optional[str] = None
    NO_URUT_BERSAMA: Optional[str] = None
    KD_JNS_OP_BERSAMA: Optional[str] = None
    
    # Letak Objek Pajak
    JALAN_OP: Optional[str] = None
    RW_OP: Optional[str] = None
    RT_OP: Optional[str] = None
    BLOK_KAV_NO_OP: Optional[str] = None
    KELURAHAN_OP: Optional[str] = None
    
    # Subjek Pajak
    SUBJEK_PAJAK_ID: Optional[str] = None
    KD_STATUS_WP: Optional[str] = None
    
    # Identitas Pendata
    TGL_PENDATAAN_OP: Optional[date] = None
    NM_PENDATAAN_OP: Optional[str] = None
    NIP_PENDATA: Optional[str] = None
    
    TGL_PEMERIKSAAN_OP: Optional[date] = None
    NM_PEMERIKSAAN_OP: Optional[str] = None
    NIP_PEMERIKSA_OP: Optional[str] = None
    
    # Data Tanah
    LUAS_BUMI: Optional[int] = None
    KD_ZNT: Optional[str] = None
    JNS_BUMI: Optional[str] = None
    NILAI_SISTEM_BUMI: Optional[int] = None
    NO_PERSIL: Optional[str] = None
    
    # NOP Asal
    KD_PROPINSI_ASAL: Optional[str] = None
    KD_DATI2_ASAL: Optional[str] = None
    KD_KECAMATAN_ASAL: Optional[str] = None
    KD_KELURAHAN_ASAL: Optional[str] = None
    KD_BLOK_ASAL: Optional[str] = None
    NO_URUT_ASAL: Optional[str] = None
    KD_JNS_OP_ASAL: Optional[str] = None
    NO_SPPT_LAMA: Optional[str] = None
