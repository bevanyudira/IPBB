from functools import partial
import logging
import re
from typing import Annotated, Literal, Optional, List
from urllib.parse import urlencode
from fastapi import APIRouter, Depends, HTTPException, Header, Query, Request, status
from fastapi.responses import JSONResponse, RedirectResponse
from fastapi.security import (
    HTTPAuthorizationCredentials,
    HTTPBearer,
    OAuth2PasswordRequestForm,
)
from sqlmodel import and_, func, or_, select, update, case, literal
from sqlmodel.ext.asyncio.session import AsyncSession
from pydantic import BaseModel

from app.auth import service
from app.auth.service import retry_db_operation
from app.auth.oauth_google import get_google_oauth_url, handle_google_callback
from app.core import security
from app.auth.exceptions import credentials_exception
from app.core.config import settings
from app.core.deps import SessionDep, TokenDep, get_token
from app.models.base import APIMessage
from app.models.schemas import ErrorResponse
from app.models.spop import Spop
from app.models.sppt import Sppt
from app.models.pembayaran_sppt import PembayaranSppt
from app.models.dat_subjek_pajak import DatSubjekPajak
from app.models.user import User
from app.models.ref_kecamatan import RefKecamatan
from app.models.ref_kelurahan import RefKelurahan
from app.models.dat_op_bangunan import DatOpBangunan
from app.models.kelas_bumi import KelasBumi
from app.models.kelas_bangunan import KelasBangunan
from .schemas import (
    SpopPaginatedResponse,
    SpopResponse,
    VerifikasiRequest,
    SpptResponse,
    SpptYearResponse,
    SpptYearsResponse,
    SpptPaginatedResponse,
    SpptObjectPaginatedResponse,
    SpptPaymentResponse,
    ObjectInfoResponse,
)
from app.core.database import get_async_session
from sqlalchemy.dialects import mysql


# --- Request/Response Schemas for OpenAPI ---
class SpptCompositeKeyRequest(BaseModel):
    KD_PROPINSI: str
    KD_DATI2: str
    KD_KECAMATAN: str
    KD_KELURAHAN: str
    KD_BLOK: str
    NO_URUT: str
    KD_JNS_OP: str


class ExistsResponse(BaseModel):
    exists: bool


router = APIRouter(tags=["op"])


# {
#   "SUBJEK_PAJAK_ID": "1271025502730004",
#   "NM_WP": "NI WAYAN MURNIASIH",
#   "KD_PROPINSI": "51",
#   "KD_DATI2": "02",
#   "KD_KECAMATAN": "030",
#   "KD_KELURAHAN": "001",
#   "KD_BLOK": "024",
#   "NO_URUT": "0018",
#   "KD_JNS_OP": "0",
#   "TELP_WP": "123456789",
# }
@router.post("/verifikasi", response_model=ExistsResponse)
async def verifikasi(
    data: VerifikasiRequest,
    session: AsyncSession = Depends(get_async_session),
    # current_user: User = Depends(service.get_current_user_allow_inactive),  # Temp disabled for testing
):
    query = (
        select(Spop, DatSubjekPajak)
        .join(
            DatSubjekPajak,
            Spop.SUBJEK_PAJAK_ID == DatSubjekPajak.SUBJEK_PAJAK_ID,
        )
        .where(
            normalize_mysql5(DatSubjekPajak.NM_WP) == normalize(data.NM_WP),
            Spop.KD_PROPINSI == data.KD_PROPINSI,
            Spop.KD_DATI2 == data.KD_DATI2,
            Spop.KD_KECAMATAN == data.KD_KECAMATAN,
            Spop.KD_KELURAHAN == data.KD_KELURAHAN,
            Spop.KD_BLOK == data.KD_BLOK,
            Spop.NO_URUT == data.NO_URUT,
            Spop.KD_JNS_OP == data.KD_JNS_OP,
        )
        .limit(1)
    )
    print(
        query.compile(dialect=mysql.dialect(), compile_kwargs={"literal_binds": True})
    )

    result = await session.exec(query)
    spop_and_subjek = result.first()
    exists = spop_and_subjek is not None
    if exists:
        spop, subjek_pajak = spop_and_subjek
        # Update email_wp in dat_subjek_pajak table for the found SUBJEK_PAJAK_ID
        # await session.exec(
        #     select(User)
        #     .where(User.id == current_user.id)
        #     .execution_options(synchronize_session="fetch")
        # )
        await session.exec(
            update(DatSubjekPajak)
            .where(DatSubjekPajak.SUBJEK_PAJAK_ID == subjek_pajak.SUBJEK_PAJAK_ID)
            .values(
                {
                    "EMAIL_WP": "test@example.com",  # Test email for verification
                    "TELP_WP": data.TELP_WP,
                }
            )
        )
        # current_user.is_active = True
        await session.commit()

    return ExistsResponse(exists=exists)


@router.get("/spop", response_model=SpopPaginatedResponse)
async def get_all_spop(
    session: AsyncSession = Depends(get_async_session),
    current_user: User = Depends(service.get_current_user),
    search: Optional[str] = Query(None, description="Search by NM_WP"),
    page: int = Query(1, ge=1),
    per_page: int = Query(10, ge=1, le=100),
    sort_by: Optional[Literal["KD_PROPINSI", "JALAN_OP", "LUAS_BUMI"]] = Query(
        "KD_PROPINSI"
    ),
    sort_order: Optional[Literal["asc", "desc"]] = Query("asc"),
):
    """
    List all objects (SPOP) for the current user. Use this endpoint to select an object (NOP) before choosing a year.
    """
    # Base query
    query = (
        select(Spop, DatSubjekPajak)
        .join(
            DatSubjekPajak,
            Spop.SUBJEK_PAJAK_ID == DatSubjekPajak.SUBJEK_PAJAK_ID,
        )
        .where(
            DatSubjekPajak.EMAIL_WP == str(current_user.email)
        )  # Make sure this is str if it's UUID
    )

    # Apply search
    if search:
        normalized_search = f"%{normalize(search)}%"
        query = query.where(
            normalize_mysql5(DatSubjekPajak.NM_WP).ilike(normalized_search)
        )

    # Sorting
    sort_column = getattr(Spop, sort_by)
    query = query.order_by(
        sort_column.asc() if sort_order == "asc" else sort_column.desc()
    )

    # Total count (subquery required for accurate count with joins/filters)
    total_query = select(func.count()).select_from(query.subquery())
    total_result = await session.exec(total_query)
    total = total_result.one() or 0

    # Pagination
    result = await session.exec(query.offset((page - 1) * per_page).limit(per_page))
    items = result.all()

    # Combine Spop and DatSubjekPajak data
    combined_data = []
    for spop, dat_subjek_pajak in items:
        data = spop.model_dump()
        if dat_subjek_pajak:
            data.update(dat_subjek_pajak.model_dump(exclude_none=True))
        combined_data.append(data)

    return {
        "data": combined_data,
        "meta": {
            "page": page,
            "per_page": per_page,
            "total": total,
            "total_pages": (total + per_page - 1) // per_page,
        },
    }


@router.get("/", response_model=ErrorResponse)
async def get_sppt(
    session: AsyncSession = Depends(get_async_session),
    current_user: User = Depends(service.get_current_user),
):
    print(current_user.is_active)

    return True


def parse_nop(nop: str):
    # Remove non-digit chars, then parse
    digits = "".join(filter(str.isdigit, nop))
    if len(digits) != 18:
        raise HTTPException(status_code=400, detail="NOP must be exactly 18 digits")
    return {
        "KD_PROPINSI": digits[0:2],
        "KD_DATI2": digits[2:4],
        "KD_KECAMATAN": digits[4:7],
        "KD_KELURAHAN": digits[7:10],
        "KD_BLOK": digits[10:13],
        "NO_URUT": digits[13:17],
        "KD_JNS_OP": digits[17:18],
    }


class NopRequest(BaseModel):
    nop: str


@router.post("/sppt/years", response_model=SpptYearsResponse)
async def get_sppt_years(
    req: NopRequest,
    session: AsyncSession = Depends(get_async_session),
    current_user: User = Depends(service.get_current_user),
):
    """
    Get available SPPT years for a specific object (NOP). Pass the NOP as JSON body.
    """
    key = parse_nop(req.nop)
    query = (
        select(Sppt.THN_PAJAK_SPPT, func.count().label("count"))
        .join(
            Spop,
            and_(
                Sppt.KD_PROPINSI == Spop.KD_PROPINSI,
                Sppt.KD_DATI2 == Spop.KD_DATI2,
                Sppt.KD_KECAMATAN == Spop.KD_KECAMATAN,
                Sppt.KD_KELURAHAN == Spop.KD_KELURAHAN,
                Sppt.KD_BLOK == Spop.KD_BLOK,
                Sppt.NO_URUT == Spop.NO_URUT,
                Sppt.KD_JNS_OP == Spop.KD_JNS_OP,
            ),
        )
        .join(
            DatSubjekPajak,
            Spop.SUBJEK_PAJAK_ID == DatSubjekPajak.SUBJEK_PAJAK_ID,
        )
        .where(
            DatSubjekPajak.EMAIL_WP == str(current_user.email),
            Sppt.KD_PROPINSI == key["KD_PROPINSI"],
            Sppt.KD_DATI2 == key["KD_DATI2"],
            Sppt.KD_KECAMATAN == key["KD_KECAMATAN"],
            Sppt.KD_KELURAHAN == key["KD_KELURAHAN"],
            Sppt.KD_BLOK == key["KD_BLOK"],
            Sppt.NO_URUT == key["NO_URUT"],
            Sppt.KD_JNS_OP == key["KD_JNS_OP"],
        )
        .group_by(Sppt.THN_PAJAK_SPPT)
    )
    # Add retry logic for complex database queries
    async def execute_years_query():
        result = await session.exec(query)
        return result.all()

    rows = await retry_db_operation(execute_years_query)
    return {"available_years": [{"THN_PAJAK_SPPT": r[0], "count": r[1]} for r in rows]}


@router.get("/sppt/{year}/{nop}/payment", response_model=SpptPaymentResponse)
async def get_sppt_payment_detail_v2(
    year: str,
    nop: str,
    session: AsyncSession = Depends(get_async_session),
    current_user: User = Depends(service.get_current_user),
):
    """
    Get payment information for a specific SPPT. Returns grouped payment data with totals.
    """
    key = parse_nop(nop)

    # Query to get payment data grouped by NOP and year with access control
    # Only sum denda when STATUS_PEMBAYARAN_SPPT = 1 (paid status)
    query = (
        select(
            PembayaranSppt.KD_PROPINSI,
            PembayaranSppt.KD_DATI2,
            PembayaranSppt.KD_KECAMATAN,
            PembayaranSppt.KD_KELURAHAN,
            PembayaranSppt.KD_BLOK,
            PembayaranSppt.NO_URUT,
            PembayaranSppt.KD_JNS_OP,
            PembayaranSppt.THN_PAJAK_SPPT,
            func.sum(
                case(
                    (Sppt.STATUS_PEMBAYARAN_SPPT == 1, PembayaranSppt.DENDA_SPPT),
                    else_=0
                )
            ).label("total_denda"),
            func.sum(PembayaranSppt.JML_SPPT_YG_DIBAYAR).label("total_dibayar"),
            func.group_concat(PembayaranSppt.TGL_PEMBAYARAN_SPPT.distinct()).label("tanggal_pembayaran")
        )
        .join(
            Spop,
            and_(
                PembayaranSppt.KD_PROPINSI == Spop.KD_PROPINSI,
                PembayaranSppt.KD_DATI2 == Spop.KD_DATI2,
                PembayaranSppt.KD_KECAMATAN == Spop.KD_KECAMATAN,
                PembayaranSppt.KD_KELURAHAN == Spop.KD_KELURAHAN,
                PembayaranSppt.KD_BLOK == Spop.KD_BLOK,
                PembayaranSppt.NO_URUT == Spop.NO_URUT,
                PembayaranSppt.KD_JNS_OP == Spop.KD_JNS_OP,
            ),
        )
        .join(
            Sppt,
            and_(
                PembayaranSppt.KD_PROPINSI == Sppt.KD_PROPINSI,
                PembayaranSppt.KD_DATI2 == Sppt.KD_DATI2,
                PembayaranSppt.KD_KECAMATAN == Sppt.KD_KECAMATAN,
                PembayaranSppt.KD_KELURAHAN == Sppt.KD_KELURAHAN,
                PembayaranSppt.KD_BLOK == Sppt.KD_BLOK,
                PembayaranSppt.NO_URUT == Sppt.NO_URUT,
                PembayaranSppt.KD_JNS_OP == Sppt.KD_JNS_OP,
                PembayaranSppt.THN_PAJAK_SPPT == Sppt.THN_PAJAK_SPPT,
            ),
        )
        .join(
            DatSubjekPajak,
            Spop.SUBJEK_PAJAK_ID == DatSubjekPajak.SUBJEK_PAJAK_ID,
        )
        .where(
            DatSubjekPajak.EMAIL_WP == str(current_user.email),
            PembayaranSppt.THN_PAJAK_SPPT == year,
            PembayaranSppt.KD_PROPINSI == key["KD_PROPINSI"],
            PembayaranSppt.KD_DATI2 == key["KD_DATI2"],
            PembayaranSppt.KD_KECAMATAN == key["KD_KECAMATAN"],
            PembayaranSppt.KD_KELURAHAN == key["KD_KELURAHAN"],
            PembayaranSppt.KD_BLOK == key["KD_BLOK"],
            PembayaranSppt.NO_URUT == key["NO_URUT"],
            PembayaranSppt.KD_JNS_OP == key["KD_JNS_OP"],
        )
        .group_by(
            PembayaranSppt.KD_PROPINSI,
            PembayaranSppt.KD_DATI2,
            PembayaranSppt.KD_KECAMATAN,
            PembayaranSppt.KD_KELURAHAN,
            PembayaranSppt.KD_BLOK,
            PembayaranSppt.NO_URUT,
            PembayaranSppt.KD_JNS_OP,
            PembayaranSppt.THN_PAJAK_SPPT,
        )
    )

    # Add retry logic for complex database queries
    async def execute_payment_query():
        result = await session.exec(query)
        return result.first()

    payment_data = await retry_db_operation(execute_payment_query)

    if not payment_data:
        # Return empty payment data if no payments found
        return SpptPaymentResponse(
            KD_PROPINSI=key["KD_PROPINSI"],
            KD_DATI2=key["KD_DATI2"],
            KD_KECAMATAN=key["KD_KECAMATAN"],
            KD_KELURAHAN=key["KD_KELURAHAN"],
            KD_BLOK=key["KD_BLOK"],
            NO_URUT=key["NO_URUT"],
            KD_JNS_OP=key["KD_JNS_OP"],
            THN_PAJAK_SPPT=year,
            total_denda=0,
            total_dibayar=0,
            tanggal_pembayaran=None
        )

    return SpptPaymentResponse(
        KD_PROPINSI=payment_data[0],
        KD_DATI2=payment_data[1],
        KD_KECAMATAN=payment_data[2],
        KD_KELURAHAN=payment_data[3],
        KD_BLOK=payment_data[4],
        NO_URUT=payment_data[5],
        KD_JNS_OP=payment_data[6],
        THN_PAJAK_SPPT=payment_data[7],
        total_denda=payment_data[8] or 0,
        total_dibayar=payment_data[9] or 0,
        tanggal_pembayaran=payment_data[10]
    )


@router.get("/sppt/{nop}/info")
async def get_object_info(
    nop: str,
    session: AsyncSession = Depends(get_async_session),
    current_user: User = Depends(service.get_current_user),
):
    """
    Get comprehensive object information including taxpayer details, location, and property values.
    """
    print(f"[ALWAYS PRINT] Object info endpoint reached for NOP: {nop}")
    logger = logging.getLogger(__name__)
    print(f"[DEBUG] Getting object info for NOP: {nop}")
    logger.info(f"Getting object info for NOP: {nop}")

    try:
        key = parse_nop(nop)
        print(f"[DEBUG] Parsed NOP key: {key}")
        logger.info(f"Parsed NOP key: {key}")
    except Exception as e:
        print(f"[DEBUG] Error parsing NOP {nop}: {e}")
        logger.error(f"Error parsing NOP {nop}: {e}")
        raise HTTPException(status_code=400, detail=f"Invalid NOP format: {str(e)}")

    # Complex query joining multiple tables
    query = (
        select(
            # Basic info
            Spop.KD_PROPINSI,
            Spop.KD_DATI2,
            Spop.KD_KECAMATAN,
            Spop.KD_KELURAHAN,
            Spop.KD_BLOK,
            Spop.NO_URUT,
            Spop.KD_JNS_OP,

            # Taxpayer info from dat_subjek_pajak
            DatSubjekPajak.NM_WP,
            DatSubjekPajak.TELP_WP,
            DatSubjekPajak.JALAN_WP,

            # Object location from spop
            Spop.JALAN_OP,
            Spop.LUAS_BUMI,
            Spop.NILAI_SISTEM_BUMI,

            # Reference data
            RefKecamatan.NM_KECAMATAN,
            RefKelurahan.NM_KELURAHAN,

            # NJOP Bumi from latest SPPT (most recent year)
            func.max(Sppt.NJOP_BUMI_SPPT).label("njop_bumi_total"),

            # Building info calculated separately to avoid JOIN multiplication
            (
                select(func.sum(DatOpBangunan.LUAS_BNG))
                .where(
                    DatOpBangunan.KD_PROPINSI == key["KD_PROPINSI"],
                    DatOpBangunan.KD_DATI2 == key["KD_DATI2"],
                    DatOpBangunan.KD_KECAMATAN == key["KD_KECAMATAN"],
                    DatOpBangunan.KD_KELURAHAN == key["KD_KELURAHAN"],
                    DatOpBangunan.KD_BLOK == key["KD_BLOK"],
                    DatOpBangunan.NO_URUT == key["NO_URUT"],
                    DatOpBangunan.KD_JNS_OP == key["KD_JNS_OP"],
                )
                .scalar_subquery()
            ).label("total_luas_bangunan"),
            (
                select(func.sum(
                    func.coalesce(
                        func.nullif(DatOpBangunan.NILAI_INDIVIDU, 0),
                        DatOpBangunan.NILAI_SISTEM_BNG
                    )
                ))
                .where(
                    DatOpBangunan.KD_PROPINSI == key["KD_PROPINSI"],
                    DatOpBangunan.KD_DATI2 == key["KD_DATI2"],
                    DatOpBangunan.KD_KECAMATAN == key["KD_KECAMATAN"],
                    DatOpBangunan.KD_KELURAHAN == key["KD_KELURAHAN"],
                    DatOpBangunan.KD_BLOK == key["KD_BLOK"],
                    DatOpBangunan.NO_URUT == key["NO_URUT"],
                    DatOpBangunan.KD_JNS_OP == key["KD_JNS_OP"],
                )
                .scalar_subquery()
            ).label("total_nilai_bangunan")
        )
        .join(
            DatSubjekPajak,
            Spop.SUBJEK_PAJAK_ID == DatSubjekPajak.SUBJEK_PAJAK_ID,
        )
        .join(
            RefKecamatan,
            and_(
                Spop.KD_PROPINSI == RefKecamatan.KD_PROPINSI,
                Spop.KD_DATI2 == RefKecamatan.KD_DATI2,
                Spop.KD_KECAMATAN == RefKecamatan.KD_KECAMATAN,
            ),
        )
        .join(
            RefKelurahan,
            and_(
                Spop.KD_PROPINSI == RefKelurahan.KD_PROPINSI,
                Spop.KD_DATI2 == RefKelurahan.KD_DATI2,
                Spop.KD_KECAMATAN == RefKelurahan.KD_KECAMATAN,
                Spop.KD_KELURAHAN == RefKelurahan.KD_KELURAHAN,
            ),
        )
        .join(
            Sppt,
            and_(
                Spop.KD_PROPINSI == Sppt.KD_PROPINSI,
                Spop.KD_DATI2 == Sppt.KD_DATI2,
                Spop.KD_KECAMATAN == Sppt.KD_KECAMATAN,
                Spop.KD_KELURAHAN == Sppt.KD_KELURAHAN,
                Spop.KD_BLOK == Sppt.KD_BLOK,
                Spop.NO_URUT == Sppt.NO_URUT,
                Spop.KD_JNS_OP == Sppt.KD_JNS_OP,
            ),
        )
        .where(
            DatSubjekPajak.EMAIL_WP == str(current_user.email),
            Spop.KD_PROPINSI == key["KD_PROPINSI"],
            Spop.KD_DATI2 == key["KD_DATI2"],
            Spop.KD_KECAMATAN == key["KD_KECAMATAN"],
            Spop.KD_KELURAHAN == key["KD_KELURAHAN"],
            Spop.KD_BLOK == key["KD_BLOK"],
            Spop.NO_URUT == key["NO_URUT"],
            Spop.KD_JNS_OP == key["KD_JNS_OP"],
        )
        .group_by(
            Spop.KD_PROPINSI,
            Spop.KD_DATI2,
            Spop.KD_KECAMATAN,
            Spop.KD_KELURAHAN,
            Spop.KD_BLOK,
            Spop.NO_URUT,
            Spop.KD_JNS_OP,
            DatSubjekPajak.NM_WP,
            DatSubjekPajak.TELP_WP,
            DatSubjekPajak.JALAN_WP,
            Spop.JALAN_OP,
            Spop.LUAS_BUMI,
            Spop.NILAI_SISTEM_BUMI,
            RefKecamatan.NM_KECAMATAN,
            RefKelurahan.NM_KELURAHAN,
        )
    )
    # Force reload

    # Add retry logic for complex database queries
    async def execute_object_info_query():
        result = await session.exec(query)
        return result.first()

    try:
        print(f"[DEBUG] Executing query for NOP: {nop} for user: {current_user.email}")
        object_data = await retry_db_operation(execute_object_info_query)
        print(f"[DEBUG] Object data query completed, result: {object_data is not None}")
        logger.info(f"Object data query completed, result: {object_data is not None}")
    except Exception as e:
        print(f"[DEBUG] Error executing object info query: {e}")
        logger.error(f"Error executing object info query: {e}")
        raise HTTPException(status_code=500, detail=f"Database query failed: {str(e)}")

    if not object_data:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Object not found",
        )

    # Calculate NJOP values
    # For land: Convert total NJOP back to per-square-meter value
    njop_bumi = None
    if hasattr(object_data, 'njop_bumi_total') and object_data.njop_bumi_total and object_data.LUAS_BUMI:
        njop_bumi = int(object_data.njop_bumi_total / object_data.LUAS_BUMI)

    # For building: Calculate directly from database to avoid JOIN multiplication issues
    # Query building data separately, divide by 1000, then reference to KelasBangunan
    print(f"[DEBUG] Starting direct building calculation for NOP: {nop}")
    njop_bangunan = None
    try:
        building_query = select(
            func.sum(
                func.coalesce(
                    func.nullif(DatOpBangunan.NILAI_INDIVIDU, 0),
                    DatOpBangunan.NILAI_SISTEM_BNG
                )
            )
        ).where(
            DatOpBangunan.KD_PROPINSI == key["KD_PROPINSI"],
            DatOpBangunan.KD_DATI2 == key["KD_DATI2"],
            DatOpBangunan.KD_KECAMATAN == key["KD_KECAMATAN"],
            DatOpBangunan.KD_KELURAHAN == key["KD_KELURAHAN"],
            DatOpBangunan.KD_BLOK == key["KD_BLOK"],
            DatOpBangunan.NO_URUT == key["NO_URUT"],
            DatOpBangunan.KD_JNS_OP == key["KD_JNS_OP"]
        )
        print(f"[DEBUG] Executing direct building query for keys: {key}")
        building_result = await session.exec(building_query)
        building_total = building_result.first()
        print(f"[DEBUG] Raw building query result: {building_total}")

        if building_total:
            # Divide by 1000 first as specified by user
            building_value_per_1000 = int(building_total / 1000)
            print(f"[DEBUG] Building value divided by 1000: {building_value_per_1000}")

            # Now lookup in KelasBangunan table to get the NJOP_BANGUNAN reference value
            kelas_query = select(KelasBangunan).where(
                KelasBangunan.NILAI_MINIMUM <= building_value_per_1000,
                KelasBangunan.NILAI_MAKSIMUM >= building_value_per_1000
            )
            kelas_result = await session.exec(kelas_query)
            kelas_bangunan = kelas_result.first()

            if kelas_bangunan:
                # Final NJOP Bangunan = NJOP_BANGUNAN from kelas table * 1000
                njop_bangunan = int(kelas_bangunan.NJOP_BANGUNAN * 1000)
                print(f"[DEBUG] Found KelasBangunan: {kelas_bangunan.KELAS_BANGUNAN}, NJOP_BANGUNAN: {kelas_bangunan.NJOP_BANGUNAN}")
                print(f"[DEBUG] Final NJOP Bangunan: {kelas_bangunan.NJOP_BANGUNAN} * 1000 = {njop_bangunan}")
            else:
                print(f"[ERROR] No KelasBangunan found for value: {building_value_per_1000}")
                njop_bangunan = 0
        else:
            print(f"[DEBUG] No building data found for NOP: {nop}")
            njop_bangunan = 0
    except Exception as e:
        print(f"[ERROR] Failed to calculate building NJOP: {e}")
        import traceback
        traceback.print_exc()
        njop_bangunan = 0

    print(f"[DEBUG] NOP {nop}: total_nilai_bangunan={getattr(object_data, 'total_nilai_bangunan', 'NOT_FOUND')}")
    print(f"[DEBUG] NOP {nop}: total_luas_bangunan={getattr(object_data, 'total_luas_bangunan', 'NOT_FOUND')}")
    print(f"[DEBUG] NOP {nop}: calculated njop_bangunan={njop_bangunan}")
    print(f"[NJOP_FINAL] NOP {nop}: Final returned njop_bangunan={njop_bangunan}")

    # Debug: Print actual object data fields
    print(f"[DEBUG] Object data fields: NM_WP={getattr(object_data, 'NM_WP', 'NOT_FOUND')}")
    print(f"[DEBUG] Object data fields: TELP_WP={getattr(object_data, 'TELP_WP', 'NOT_FOUND')}")
    print(f"[DEBUG] Object data fields: JALAN_WP={getattr(object_data, 'JALAN_WP', 'NOT_FOUND')}")
    print(f"[DEBUG] Object data fields: JALAN_OP={getattr(object_data, 'JALAN_OP', 'NOT_FOUND')}")
    print(f"[DEBUG] Object data fields: NM_KECAMATAN={getattr(object_data, 'NM_KECAMATAN', 'NOT_FOUND')}")
    print(f"[DEBUG] Object data fields: NM_KELURAHAN={getattr(object_data, 'NM_KELURAHAN', 'NOT_FOUND')}")
    print(f"[DEBUG] Object data fields: LUAS_BUMI={getattr(object_data, 'LUAS_BUMI', 'NOT_FOUND')}")
    print(f"[DEBUG] Object data fields: NILAI_SISTEM_BUMI={getattr(object_data, 'NILAI_SISTEM_BUMI', 'NOT_FOUND')}")
    print(f"[DEBUG] Object data fields: njop_bumi_total={getattr(object_data, 'njop_bumi_total', 'NOT_FOUND')}")
    print(f"[DEBUG] Object data available attributes: {dir(object_data)}")

    # Return actual object information
    return {
        "nomor_objek_pajak": nop,
        "nama_wajib_pajak": getattr(object_data, 'NM_WP', None),
        "telpon_wajib_pajak": getattr(object_data, 'TELP_WP', None),
        "alamat_wajib_pajak": getattr(object_data, 'JALAN_WP', None),
        "alamat_objek_pajak": getattr(object_data, 'JALAN_OP', None),
        "kecamatan_objek_pajak": getattr(object_data, 'NM_KECAMATAN', None),
        "kelurahan_objek_pajak": getattr(object_data, 'NM_KELURAHAN', None),
        "luas_bumi": getattr(object_data, 'LUAS_BUMI', None),
        "njop_bumi": njop_bumi,
        "luas_bangunan": getattr(object_data, 'total_luas_bangunan', None),
        "njop_bangunan": njop_bangunan,
    }


@router.get(
    "/sppt/{year}/{nop}",
    response_model=SpptResponse,
)
async def get_sppt_detail(
    year: str,
    nop: str,
    session: AsyncSession = Depends(get_async_session),
    current_user: User = Depends(service.get_current_user),
):
    """
    Get detailed SPPT data for a specific property (object) and year. Use after selecting object and year. NOP is a single string.
    """
    key = parse_nop(nop)

    # First try the full query with joins for access control
    query = (
        select(Sppt)
        .join(
            Spop,
            and_(
                Sppt.KD_PROPINSI == Spop.KD_PROPINSI,
                Sppt.KD_DATI2 == Spop.KD_DATI2,
                Sppt.KD_KECAMATAN == Spop.KD_KECAMATAN,
                Sppt.KD_KELURAHAN == Spop.KD_KELURAHAN,
                Sppt.KD_BLOK == Spop.KD_BLOK,
                Sppt.NO_URUT == Spop.NO_URUT,
                Sppt.KD_JNS_OP == Spop.KD_JNS_OP,
            ),
        )
        .join(
            DatSubjekPajak,
            Spop.SUBJEK_PAJAK_ID == DatSubjekPajak.SUBJEK_PAJAK_ID,
        )
        .where(
            DatSubjekPajak.EMAIL_WP == str(current_user.email),
            Sppt.THN_PAJAK_SPPT == year,
            Sppt.KD_PROPINSI == key["KD_PROPINSI"],
            Sppt.KD_DATI2 == key["KD_DATI2"],
            Sppt.KD_KECAMATAN == key["KD_KECAMATAN"],
            Sppt.KD_KELURAHAN == key["KD_KELURAHAN"],
            Sppt.KD_BLOK == key["KD_BLOK"],
            Sppt.NO_URUT == key["NO_URUT"],
            Sppt.KD_JNS_OP == key["KD_JNS_OP"],
        )
    )
    # Add retry logic for complex database queries
    async def execute_sppt_query():
        result = await session.exec(query)
        return result.first()

    sppt = await retry_db_operation(execute_sppt_query)

    # If not found with joins, try direct SPPT query for older years
    # This is for backward compatibility with older data that might not have proper links
    if not sppt:
        direct_query = (
            select(Sppt)
            .where(
                Sppt.THN_PAJAK_SPPT == year,
                Sppt.KD_PROPINSI == key["KD_PROPINSI"],
                Sppt.KD_DATI2 == key["KD_DATI2"],
                Sppt.KD_KECAMATAN == key["KD_KECAMATAN"],
                Sppt.KD_KELURAHAN == key["KD_KELURAHAN"],
                Sppt.KD_BLOK == key["KD_BLOK"],
                Sppt.NO_URUT == key["NO_URUT"],
                Sppt.KD_JNS_OP == key["KD_JNS_OP"],
            )
        )

        async def execute_direct_query():
            direct_result = await session.exec(direct_query)
            return direct_result.first()

        sppt = await retry_db_operation(execute_direct_query)

    if not sppt:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="SPPT not found",
        )
    return sppt


@router.get("/sppt/batch/{nop}", response_model=List[SpptResponse])
async def get_sppt_batch_by_nop(
    nop: str,
    session: AsyncSession = Depends(get_async_session),
    current_user: User = Depends(service.get_current_user),
):
    """
    Get all SPPT data for all available years for a specific NOP in one request.
    Much faster than multiple individual requests.
    """
    key = parse_nop(nop)

    # Get all SPPT records for this NOP with joins for access control
    query = (
        select(Sppt)
        .join(
            Spop,
            and_(
                Sppt.KD_PROPINSI == Spop.KD_PROPINSI,
                Sppt.KD_DATI2 == Spop.KD_DATI2,
                Sppt.KD_KECAMATAN == Spop.KD_KECAMATAN,
                Sppt.KD_KELURAHAN == Spop.KD_KELURAHAN,
                Sppt.KD_BLOK == Spop.KD_BLOK,
                Sppt.NO_URUT == Spop.NO_URUT,
                Sppt.KD_JNS_OP == Spop.KD_JNS_OP,
            ),
        )
        .join(
            DatSubjekPajak,
            Spop.SUBJEK_PAJAK_ID == DatSubjekPajak.SUBJEK_PAJAK_ID,
        )
        .where(
            DatSubjekPajak.EMAIL_WP == str(current_user.email),
            Sppt.KD_PROPINSI == key["KD_PROPINSI"],
            Sppt.KD_DATI2 == key["KD_DATI2"],
            Sppt.KD_KECAMATAN == key["KD_KECAMATAN"],
            Sppt.KD_KELURAHAN == key["KD_KELURAHAN"],
            Sppt.KD_BLOK == key["KD_BLOK"],
            Sppt.NO_URUT == key["NO_URUT"],
            Sppt.KD_JNS_OP == key["KD_JNS_OP"],
        )
        .order_by(Sppt.THN_PAJAK_SPPT.desc())
    )

    # Add retry logic for complex batch queries
    async def execute_batch_query():
        result = await session.exec(query)
        return result.all()

    sppts = await retry_db_operation(execute_batch_query)

    if not sppts:
        # Try direct query for older years without joins
        direct_query = select(Sppt).where(
            Sppt.KD_PROPINSI == key["KD_PROPINSI"],
            Sppt.KD_DATI2 == key["KD_DATI2"],
            Sppt.KD_KECAMATAN == key["KD_KECAMATAN"],
            Sppt.KD_KELURAHAN == key["KD_KELURAHAN"],
            Sppt.KD_BLOK == key["KD_BLOK"],
            Sppt.NO_URUT == key["NO_URUT"],
            Sppt.KD_JNS_OP == key["KD_JNS_OP"],
        ).order_by(Sppt.THN_PAJAK_SPPT.desc())

        async def execute_direct_batch_query():
            result = await session.exec(direct_query)
            return result.all()

        sppts = await retry_db_operation(execute_direct_batch_query)

    return sppts


# @router.get("/sppt/objects", response_model=SpptObjectPaginatedResponse)
# async def get_sppt_objects(
#     session: AsyncSession = Depends(get_async_session),
#     current_user: User = Depends(service.get_current_user),
#     search: Optional[str] = Query(None, description="Search by NM_WP or Kelurahan"),
#     page: int = Query(1, ge=1),
#     per_page: int = Query(10, ge=1, le=100),
# ):
#     """
#     (Deprecated) List distinct objects (NOP) linked to user via SPOP. Use /spop instead.
#     """
#     # List distinct objects (NOP) linked to user via SPOP
#     query = (
#         select(
#             Sppt.KD_PROPINSI,
#             Sppt.KD_DATI2,
#             Sppt.KD_KECAMATAN,
#             Sppt.KD_KELURAHAN,
#             Sppt.KD_BLOK,
#             Sppt.NO_URUT,
#             Sppt.KD_JNS_OP,
#             Sppt.NM_WP_SPPT,
#             Sppt.KELURAHAN_WP_SPPT,
#         )
#         .join(
#             Spop,
#             and_(
#                 Sppt.KD_PROPINSI == Spop.KD_PROPINSI,
#                 Sppt.KD_DATI2 == Spop.KD_DATI2,
#                 Sppt.KD_KECAMATAN == Spop.KD_KECAMATAN,
#                 Sppt.KD_KELURAHAN == Spop.KD_KELURAHAN,
#                 Sppt.KD_BLOK == Spop.KD_BLOK,
#                 Sppt.NO_URUT == Spop.NO_URUT,
#                 Sppt.KD_JNS_OP == Spop.KD_JNS_OP,
#             ),
#         )
#         .join(
#             DatSubjekPajak,
#             Spop.SUBJEK_PAJAK_ID == DatSubjekPajak.SUBJEK_PAJAK_ID,
#         )
#         .where(DatSubjekPajak.EMAIL_WP == str(current_user.email))
#     )

#     if search:
#         normalized = f"%{normalize(search)}%"
#         query = query.where(
#             or_(
#                 normalize_mysql5(Sppt.NM_WP_SPPT).ilike(normalized),
#                 normalize_mysql5(Sppt.KELURAHAN_WP_SPPT).ilike(normalized),
#             )
#         )

#     total_query = select(func.count()).select_from(query.subquery())
#     total = (await session.exec(total_query)).one() or 0

#     result = await session.exec(query.offset((page - 1) * per_page).limit(per_page))
#     items = result.all()

#     return {
#         "data": [dict(zip(item._fields, item)) for item in items],
#         "meta": {
#             "page": page,
#             "per_page": per_page,
#             "total": total,
#             "total_pages": (total + per_page - 1) // per_page,
#         },
#     }


def normalize_mysql5(col):
    chars_to_strip = [" ", "/", "\\", "-", "_", ".", ","]
    for ch in chars_to_strip:
        col = func.replace(col, ch, "")
    return func.lower(col)


def normalize(val: str) -> str:
    return re.sub(r"[ \\/\-_,.]", "", val.lower())
