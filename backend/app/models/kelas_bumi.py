from sqlmodel import SQLModel, Field
from decimal import Decimal
from typing import Optional


class KelasBumi(SQLModel, table=True):
    __tablename__ = "kelas_bumi"

    KELAS_BUMI: str = Field(primary_key=True, max_length=5)
    NILAI_MINIMUM: Optional[Decimal] = Field(default=None, max_digits=8, decimal_places=2)
    NILAI_MAKSIMUM: Optional[Decimal] = Field(default=None, max_digits=8, decimal_places=2)
    NJOP_BUMI: Optional[Decimal] = Field(default=None, max_digits=8, decimal_places=2)