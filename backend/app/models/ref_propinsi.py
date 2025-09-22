from sqlmodel import SQLModel, Field


class RefPropinsi(SQLModel, table=True):
    __tablename__ = "ref_propinsi"
    
    KD_PROPINSI: str = Field(primary_key=True, max_length=2)
    NM_PROPINSI: str = Field(max_length=30)