from sqlmodel import SQLModel, Field


class RefKecamatan(SQLModel, table=True):
    __tablename__ = "ref_kecamatan"
    
    KD_PROPINSI: str = Field(primary_key=True, max_length=2)
    KD_DATI2: str = Field(primary_key=True, max_length=2)
    KD_KECAMATAN: str = Field(primary_key=True, max_length=3)
    NM_KECAMATAN: str = Field(max_length=30)