from sqlmodel import SQLModel, Field
from typing import Optional
from datetime import datetime, date


class DatOpBangunan(SQLModel, table=True):
    __tablename__ = "dat_op_bangunan"
    
    # Primary key fields
    KD_PROPINSI: str = Field(primary_key=True, max_length=2)
    KD_DATI2: str = Field(primary_key=True, max_length=2)
    KD_KECAMATAN: str = Field(primary_key=True, max_length=3)
    KD_KELURAHAN: str = Field(primary_key=True, max_length=3)
    KD_BLOK: str = Field(primary_key=True, max_length=3)
    NO_URUT: str = Field(primary_key=True, max_length=4)
    KD_JNS_OP: str = Field(primary_key=True, max_length=1)
    NO_BNG: int = Field(primary_key=True)
    
    # Building details
    KD_JPB: Optional[str] = Field(default=None, max_length=2)
    NO_FORMULIR_LSPOP: Optional[str] = Field(default=None, max_length=11)
    THN_DIBANGUN_BNG: str = Field(default="0", max_length=4)
    THN_RENOVASI_BNG: Optional[str] = Field(default=None, max_length=4)
    LUAS_BNG: int = Field(default=0)
    JML_LANTAI_BNG: int = Field(default=1)
    KONDISI_BNG: Optional[str] = Field(default=None, max_length=1)
    JNS_KONSTRUKSI_BNG: Optional[str] = Field(default=None, max_length=1)
    JNS_ATAP_BNG: Optional[str] = Field(default=None, max_length=1)
    KD_DINDING: Optional[str] = Field(default=None, max_length=1)
    KD_LANTAI: Optional[str] = Field(default=None, max_length=1)
    KD_LANGIT_LANGIT: Optional[str] = Field(default=None, max_length=1)
    NILAI_SISTEM_BNG: int = Field(default=0)
    JNS_TRANSAKSI_BNG: Optional[str] = Field(default=None, max_length=1)
    
    # Date fields
    TGL_PENDATAAN_BNG: Optional[datetime] = None
    TGL_PEMERIKSAAN_BNG: Optional[datetime] = None
    TGL_PEREKAMAN_BNG: Optional[datetime] = None
    TGL_KUNJUNGAN_KEMBALI: Optional[date] = None
    
    # Personnel fields
    NIP_PENDATA_BNG: Optional[str] = Field(default=None, max_length=30)
    NIP_PEMERIKSA_BNG: Optional[str] = Field(default=None, max_length=30)
    NIP_PEREKAM_BNG: Optional[str] = Field(default=None, max_length=30)
    
    # Other fields
    NILAI_INDIVIDU: int = Field(default=0)
    AKTIF: bool = Field(default=True)