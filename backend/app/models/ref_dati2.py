from sqlmodel import SQLModel, Field


class RefDati2(SQLModel, table=True):
    __tablename__ = "ref_dati2"
    
    KD_PROPINSI: str = Field(primary_key=True, max_length=2)
    KD_DATI2: str = Field(primary_key=True, max_length=2)
    NM_DATI2: str = Field(max_length=30)