from sqlmodel import SQLModel, Field
from typing import Optional
from decimal import Decimal


class SpptReport(SQLModel, table=True):
    __tablename__ = "sppt_report"

    THN_PAJAK_SPPT: str = Field(primary_key=True, max_length=4)
    KD_PROPINSI: str = Field(primary_key=True, max_length=2)
    KD_DATI2: str = Field(primary_key=True, max_length=2)
    KD_KECAMATAN: str = Field(primary_key=True, max_length=3)
    KD_KELURAHAN: str = Field(primary_key=True, max_length=3)
    NM_KECAMATAN: Optional[str] = Field(default=None, max_length=30)
    NM_KELURAHAN: Optional[str] = Field(default=None, max_length=30)
    LEMBAR_PBB: int = Field(default=0)
    LEMBAR_REALISASI: Optional[Decimal] = None
    LEMBAR_TUNGGAKAN: Optional[Decimal] = None
    LUAS_BUMI_SPPT: Optional[Decimal] = None
    LUAS_BNG_SPPT: Optional[Decimal] = None
    NJOP_BUMI_SPPT: Optional[Decimal] = None
    NJOP_BNG_SPPT: Optional[Decimal] = None
    NJOP_SPPT: Optional[Decimal] = None
    PBB_TERHUTANG_SPPT: Optional[Decimal] = None
    FAKTOR_PENGURANG_SPPT: Optional[Decimal] = None
    PBB_YG_HARUS_DIBAYAR_SPPT: Optional[Decimal] = None
    REALISASI: Optional[Decimal] = None
    TUNGGAKAN: Optional[Decimal] = None