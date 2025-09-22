from sqlmodel import SQLModel, Field
from typing import Optional


class RefKelurahan(SQLModel, table=True):
    __tablename__ = "ref_kelurahan"
    
    KD_PROPINSI: str = Field(primary_key=True, max_length=2)
    KD_DATI2: str = Field(primary_key=True, max_length=2)
    KD_KECAMATAN: str = Field(primary_key=True, max_length=3)
    KD_KELURAHAN: str = Field(primary_key=True, max_length=3)
    KD_SEKTOR: str = Field(max_length=2)
    NM_KELURAHAN: str = Field(max_length=30)
    NO_KELURAHAN: Optional[int] = None
    KD_POS_KELURAHAN: Optional[str] = Field(default=None, max_length=5)