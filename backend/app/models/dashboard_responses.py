from sqlmodel import SQLModel
from typing import List, Optional
from datetime import datetime
from decimal import Decimal


class PropinsiResponse(SQLModel):
    KD_PROPINSI: str
    NM_PROPINSI: str


class Dati2Response(SQLModel):
    KD_PROPINSI: str
    KD_DATI2: str
    NM_DATI2: str


class KecamatanResponse(SQLModel):
    KD_PROPINSI: str
    KD_DATI2: str
    KD_KECAMATAN: str
    NM_KECAMATAN: str


class KelurahanResponse(SQLModel):
    KD_PROPINSI: str
    KD_DATI2: str
    KD_KECAMATAN: str
    KD_KELURAHAN: str
    KD_SEKTOR: str
    NM_KELURAHAN: str
    NO_KELURAHAN: Optional[int] = None
    KD_POS_KELURAHAN: Optional[str] = None


class DashboardStatsResponse(SQLModel):
    # General stats
    total_sppt: int
    total_sppt_lunas: int
    total_sppt_belum_lunas: int
    total_pbb_terhutang: float
    
    # Building stats
    total_bangunan: int
    total_nilai_bangunan: float
    rata_rata_luas_bangunan: float
    
    # Area stats
    total_propinsi: int
    total_dati2: int
    total_kecamatan: int
    total_kelurahan: int
    
    # Filter information
    filtered_by: Optional[str] = None
    filter_value: Optional[str] = None
    year_filter: Optional[str] = None


class SpptReportResponse(SQLModel):
    THN_PAJAK_SPPT: str
    KD_PROPINSI: str
    KD_DATI2: str
    KD_KECAMATAN: str
    KD_KELURAHAN: str
    NM_KECAMATAN: Optional[str] = None
    NM_KELURAHAN: Optional[str] = None
    LEMBAR_PBB: int = 0
    LEMBAR_REALISASI: Optional[float] = None
    LEMBAR_TUNGGAKAN: Optional[float] = None
    LUAS_BUMI_SPPT: Optional[float] = None
    LUAS_BNG_SPPT: Optional[float] = None
    NJOP_BUMI_SPPT: Optional[float] = None
    NJOP_BNG_SPPT: Optional[float] = None
    NJOP_SPPT: Optional[float] = None
    PBB_TERHUTANG_SPPT: Optional[float] = None
    FAKTOR_PENGURANG_SPPT: Optional[float] = None
    PBB_YG_HARUS_DIBAYAR_SPPT: Optional[float] = None
    REALISASI: Optional[float] = None
    TUNGGAKAN: Optional[float] = None


class YearlyDataResponse(SQLModel):
    year: str
    pbb_harus_dibayar: float
    realisasi: float
    tunggakan: float


class SpptReportStatsResponse(SQLModel):
    # Aggregate numbers
    total_kecamatan: int
    total_kelurahan: int
    total_luas_bumi: float
    total_luas_bangunan: float
    total_njop: float
    total_pbb_terhutang: float
    total_pbb_harus_dibayar: float
    total_realisasi: float
    total_tunggakan: float

    # Lembar statistics
    total_lembar_ketetapan: int
    total_lembar_realisasi: float
    total_lembar_tunggakan: float

    # Percentages
    persentase_realisasi: float
    persentase_tunggakan: float

    # Yearly data for charts
    yearly_data: List[YearlyDataResponse]

    # Filter information
    filtered_by_year: Optional[str] = None
    filtered_by_kecamatan: Optional[str] = None


class SpptReportTableResponse(SQLModel):
    data: List[SpptReportResponse]
    total_count: int
    stats: SpptReportStatsResponse


class DashboardFiltersResponse(SQLModel):
    propinsi: List[PropinsiResponse]
    dati2: List[Dati2Response]
    kecamatan: List[KecamatanResponse]
    kelurahan: List[KelurahanResponse]
    available_years: List[str]


class SpptReportFiltersResponse(SQLModel):
    available_years: List[str]
    kecamatan_list: List[dict]  # {kd_kecamatan, nm_kecamatan}
    max_year: Optional[str] = None


class UserListResponse(SQLModel):
    id: str
    username: str
    email: Optional[str] = None
    full_name: Optional[str] = None
    is_admin: bool = False
    is_active: bool = True
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None


class PaginatedUserListResponse(SQLModel):
    data: List[UserListResponse]
    total_count: int
    page: int
    limit: int
    total_pages: int


class UserUpdateRequest(SQLModel):
    is_admin: Optional[bool] = None
    is_active: Optional[bool] = None


class UserCreateRequest(SQLModel):
    email: str
    full_name: Optional[str] = None
    password: str
    is_admin: bool = False
    is_active: bool = True