from sqlmodel import SQLModel, Field
from typing import Optional
from datetime import date, datetime


class PembayaranSppt(SQLModel, table=True):
    __tablename__ = "pembayaran_sppt"

    KD_PROPINSI: str = Field(primary_key=True, max_length=2)
    KD_DATI2: str = Field(primary_key=True, max_length=2)
    KD_KECAMATAN: str = Field(primary_key=True, max_length=3)
    KD_KELURAHAN: str = Field(primary_key=True, max_length=3)
    KD_BLOK: str = Field(primary_key=True, max_length=3)
    NO_URUT: str = Field(primary_key=True, max_length=4)
    KD_JNS_OP: str = Field(primary_key=True, max_length=1)
    THN_PAJAK_SPPT: str = Field(primary_key=True, max_length=4)
    PEMBAYARAN_SPPT_KE: int = Field(primary_key=True)
    KD_KANWIL_BANK: str = Field(primary_key=True, max_length=2)
    KD_KPPBB_BANK: str = Field(primary_key=True, max_length=2)
    KD_BANK_TUNGGAL: str = Field(primary_key=True, max_length=2)
    KD_BANK_PERSEPSI: str = Field(primary_key=True, max_length=2)
    KD_TP: str = Field(primary_key=True, max_length=2)
    DENDA_SPPT: Optional[int] = None
    JML_SPPT_YG_DIBAYAR: int
    TGL_PEMBAYARAN_SPPT: Optional[date] = None
    TGL_REKAM_BYR_SPPT: datetime
    NIP_REKAM_BYR_SPPT: str = Field(max_length=9)
    NO_BUKTI: Optional[str] = Field(default=None, max_length=50)