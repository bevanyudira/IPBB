from fastapi import APIRouter, Depends, HTTPException, Query
from sqlmodel import select, func, and_, or_
from typing import Optional, List
from app.core.deps import SessionDep
from app.auth.service import get_current_user
from app.models.sppt import Sppt
from app.models.user import User
from app.models.ref_propinsi import RefPropinsi
from app.models.ref_dati2 import RefDati2
from app.models.ref_kecamatan import RefKecamatan
from app.models.ref_kelurahan import RefKelurahan
from app.models.dat_op_bangunan import DatOpBangunan
from app.models.sppt_report import SpptReport
from app.models.dashboard_responses import (
    DashboardStatsResponse,
    DashboardFiltersResponse,
    PropinsiResponse,
    Dati2Response,
    KecamatanResponse,
    KelurahanResponse,
    SpptReportResponse,
    SpptReportStatsResponse,
    SpptReportTableResponse,
    SpptReportFiltersResponse,
    YearlyDataResponse,
)

router = APIRouter(prefix="/dashboard", tags=["dashboard"])


def require_admin(current_user: User):
    """Helper function to check admin privileges"""
    if not current_user.is_admin:
        raise HTTPException(
            status_code=403,
            detail={"code": "ADMIN_REQUIRED", "msg": "Admin access required"}
        )


@router.get("/stats", response_model=DashboardStatsResponse)
async def get_dashboard_stats(
    session: SessionDep,
    current_user: User = Depends(get_current_user),
    year: Optional[str] = Query(None, description="Filter by year (THN_PAJAK_SPPT)"),
    kd_propinsi: Optional[str] = Query(None, description="Filter by province code"),
    kd_dati2: Optional[str] = Query(None, description="Filter by dati2/kabupaten code"),
    kd_kecamatan: Optional[str] = Query(None, description="Filter by kecamatan code"),
    kd_kelurahan: Optional[str] = Query(None, description="Filter by kelurahan code"),
):
    """Get dashboard statistics with optional filtering"""
    require_admin(current_user)
    
    # Build base query conditions
    sppt_conditions = []
    bangunan_conditions = []
    
    # Add filters if provided
    if year:
        sppt_conditions.append(Sppt.THN_PAJAK_SPPT == year)
    
    if kd_propinsi:
        sppt_conditions.append(Sppt.KD_PROPINSI == kd_propinsi)
        bangunan_conditions.append(DatOpBangunan.KD_PROPINSI == kd_propinsi)
    
    if kd_dati2:
        sppt_conditions.append(Sppt.KD_DATI2 == kd_dati2)
        bangunan_conditions.append(DatOpBangunan.KD_DATI2 == kd_dati2)
    
    if kd_kecamatan:
        sppt_conditions.append(Sppt.KD_KECAMATAN == kd_kecamatan)
        bangunan_conditions.append(DatOpBangunan.KD_KECAMATAN == kd_kecamatan)
    
    if kd_kelurahan:
        sppt_conditions.append(Sppt.KD_KELURAHAN == kd_kelurahan)
        bangunan_conditions.append(DatOpBangunan.KD_KELURAHAN == kd_kelurahan)
    
    # Build queries
    sppt_query = select(func.count()).select_from(Sppt)
    if sppt_conditions:
        sppt_query = sppt_query.where(and_(*sppt_conditions))
    
    # SPPT Statistics
    total_sppt = await session.scalar(sppt_query)
    
    # Paid SPPT count
    paid_conditions = sppt_conditions + [Sppt.STATUS_PEMBAYARAN_SPPT == True]
    total_sppt_lunas = await session.scalar(
        select(func.count()).select_from(Sppt).where(and_(*paid_conditions))
    )
    
    # Unpaid SPPT count
    unpaid_conditions = sppt_conditions + [Sppt.STATUS_PEMBAYARAN_SPPT == False]
    total_sppt_belum_lunas = await session.scalar(
        select(func.count()).select_from(Sppt).where(and_(*unpaid_conditions))
    )
    
    # Total PBB amount
    pbb_query = select(func.sum(Sppt.PBB_TERHUTANG_SPPT)).select_from(Sppt)
    if sppt_conditions:
        pbb_query = pbb_query.where(and_(*sppt_conditions))
    total_pbb_terhutang = await session.scalar(pbb_query)
    
    # Building Statistics
    bangunan_query = select(func.count()).select_from(DatOpBangunan).where(DatOpBangunan.AKTIF == True)
    if bangunan_conditions:
        bangunan_query = bangunan_query.where(and_(*bangunan_conditions))
    total_bangunan = await session.scalar(bangunan_query)
    
    # Total building value
    nilai_query = select(func.sum(DatOpBangunan.NILAI_SISTEM_BNG)).select_from(DatOpBangunan).where(DatOpBangunan.AKTIF == True)
    if bangunan_conditions:
        nilai_query = nilai_query.where(and_(*bangunan_conditions))
    total_nilai_bangunan = await session.scalar(nilai_query)
    
    # Average building area
    luas_query = select(func.avg(DatOpBangunan.LUAS_BNG)).select_from(DatOpBangunan).where(
        and_(DatOpBangunan.AKTIF == True, DatOpBangunan.LUAS_BNG > 0)
    )
    if bangunan_conditions:
        luas_query = luas_query.where(and_(*bangunan_conditions))
    rata_rata_luas_bangunan = await session.scalar(luas_query)
    
    # Area Statistics (without filters to show total coverage)
    total_propinsi = await session.scalar(select(func.count()).select_from(RefPropinsi))
    total_dati2 = await session.scalar(select(func.count()).select_from(RefDati2))
    total_kecamatan = await session.scalar(select(func.count()).select_from(RefKecamatan))
    total_kelurahan = await session.scalar(select(func.count()).select_from(RefKelurahan))
    
    # Determine filter description
    filter_desc = None
    filter_val = None
    if kd_kelurahan:
        kelurahan = await session.get(RefKelurahan, (kd_propinsi, kd_dati2, kd_kecamatan, kd_kelurahan))
        filter_desc = "kelurahan"
        filter_val = kelurahan.NM_KELURAHAN if kelurahan else kd_kelurahan
    elif kd_kecamatan:
        kecamatan = await session.get(RefKecamatan, (kd_propinsi, kd_dati2, kd_kecamatan))
        filter_desc = "kecamatan"
        filter_val = kecamatan.NM_KECAMATAN if kecamatan else kd_kecamatan
    elif kd_dati2:
        dati2 = await session.get(RefDati2, (kd_propinsi, kd_dati2))
        filter_desc = "dati2"
        filter_val = dati2.NM_DATI2 if dati2 else kd_dati2
    elif kd_propinsi:
        propinsi = await session.get(RefPropinsi, kd_propinsi)
        filter_desc = "propinsi"
        filter_val = propinsi.NM_PROPINSI if propinsi else kd_propinsi
    
    return DashboardStatsResponse(
        total_sppt=total_sppt or 0,
        total_sppt_lunas=total_sppt_lunas or 0,
        total_sppt_belum_lunas=total_sppt_belum_lunas or 0,
        total_pbb_terhutang=float(total_pbb_terhutang or 0),
        total_bangunan=total_bangunan or 0,
        total_nilai_bangunan=float(total_nilai_bangunan or 0),
        rata_rata_luas_bangunan=float(rata_rata_luas_bangunan or 0),
        total_propinsi=total_propinsi or 0,
        total_dati2=total_dati2 or 0,
        total_kecamatan=total_kecamatan or 0,
        total_kelurahan=total_kelurahan or 0,
        filtered_by=filter_desc,
        filter_value=filter_val,
        year_filter=year,
    )


@router.get("/filters", response_model=DashboardFiltersResponse)
async def get_dashboard_filters(
    session: SessionDep,
    current_user: User = Depends(get_current_user),
    kd_propinsi: Optional[str] = Query(None, description="Filter by province code for hierarchical loading"),
    kd_dati2: Optional[str] = Query(None, description="Filter by dati2 code for hierarchical loading"),
    kd_kecamatan: Optional[str] = Query(None, description="Filter by kecamatan code for hierarchical loading"),
):
    """Get available filter options for dashboard"""
    require_admin(current_user)
    
    # Get all provinces
    propinsi_result = await session.execute(select(RefPropinsi).order_by(RefPropinsi.NM_PROPINSI))
    propinsi_list = [PropinsiResponse.model_validate(p) for p in propinsi_result.scalars().all()]
    
    # Get dati2 (optionally filtered by province)
    dati2_query = select(RefDati2).order_by(RefDati2.NM_DATI2)
    if kd_propinsi:
        dati2_query = dati2_query.where(RefDati2.KD_PROPINSI == kd_propinsi)
    dati2_result = await session.execute(dati2_query)
    dati2_list = [Dati2Response.model_validate(d) for d in dati2_result.scalars().all()]
    
    # Get kecamatan (optionally filtered by province and dati2)
    kecamatan_query = select(RefKecamatan).order_by(RefKecamatan.NM_KECAMATAN)
    if kd_propinsi:
        kecamatan_query = kecamatan_query.where(RefKecamatan.KD_PROPINSI == kd_propinsi)
    if kd_dati2:
        kecamatan_query = kecamatan_query.where(RefKecamatan.KD_DATI2 == kd_dati2)
    kecamatan_result = await session.execute(kecamatan_query)
    kecamatan_list = [KecamatanResponse.model_validate(k) for k in kecamatan_result.scalars().all()]
    
    # Get kelurahan (optionally filtered by province, dati2, and kecamatan)
    kelurahan_query = select(RefKelurahan).order_by(RefKelurahan.NM_KELURAHAN)
    if kd_propinsi:
        kelurahan_query = kelurahan_query.where(RefKelurahan.KD_PROPINSI == kd_propinsi)
    if kd_dati2:
        kelurahan_query = kelurahan_query.where(RefKelurahan.KD_DATI2 == kd_dati2)
    if kd_kecamatan:
        kelurahan_query = kelurahan_query.where(RefKelurahan.KD_KECAMATAN == kd_kecamatan)
    kelurahan_result = await session.execute(kelurahan_query)
    kelurahan_list = [KelurahanResponse.model_validate(k) for k in kelurahan_result.scalars().all()]
    
    # Get available years from SPPT
    years_result = await session.execute(
        select(Sppt.THN_PAJAK_SPPT).distinct().order_by(Sppt.THN_PAJAK_SPPT.desc())
    )
    available_years = [year for year in years_result.scalars().all() if year]
    
    return DashboardFiltersResponse(
        propinsi=propinsi_list,
        dati2=dati2_list,
        kecamatan=kecamatan_list,
        kelurahan=kelurahan_list,
        available_years=available_years,
    )


@router.get("/sppt-report/filters", response_model=SpptReportFiltersResponse)
async def get_sppt_report_filters(
    session: SessionDep,
    current_user: User = Depends(get_current_user),
):
    """Get available filter options for SPPT report"""
    require_admin(current_user)

    # Get available years from sppt_report (last 15 years only)
    years_result = await session.execute(
        select(SpptReport.THN_PAJAK_SPPT).distinct().order_by(SpptReport.THN_PAJAK_SPPT.desc()).limit(15)
    )
    available_years = [year for year in years_result.scalars().all() if year]

    # Get max year for default
    max_year = available_years[0] if available_years else None

    # Get kecamatan list (all provinces/dati2, only kecamatan names)
    kecamatan_result = await session.execute(
        select(SpptReport.KD_KECAMATAN, SpptReport.NM_KECAMATAN)
        .distinct()
        .order_by(SpptReport.NM_KECAMATAN)
    )
    kecamatan_list = [
        {"kd_kecamatan": kd, "nm_kecamatan": nm}
        for kd, nm in kecamatan_result.all() if nm
    ]

    return SpptReportFiltersResponse(
        available_years=available_years,
        kecamatan_list=kecamatan_list,
        max_year=max_year,
    )


@router.get("/sppt-report/data", response_model=SpptReportTableResponse)
async def get_sppt_report_data(
    session: SessionDep,
    current_user: User = Depends(get_current_user),
    year: Optional[str] = Query(None, description="Filter by year (THN_PAJAK_SPPT)"),
    kd_kecamatan: Optional[str] = Query(None, description="Filter by kecamatan code"),
    page: int = Query(1, ge=1, description="Page number"),
    limit: int = Query(50, ge=1, le=1000, description="Items per page"),
):
    """Get SPPT report data with filtering and pagination"""
    require_admin(current_user)

    # Build base query conditions
    conditions = []

    # Add filters if provided, otherwise use max year as default
    if year:
        conditions.append(SpptReport.THN_PAJAK_SPPT == year)
    else:
        # Get max year as default
        max_year_result = await session.execute(
            select(func.max(SpptReport.THN_PAJAK_SPPT))
        )
        max_year = max_year_result.scalar()
        if max_year:
            conditions.append(SpptReport.THN_PAJAK_SPPT == max_year)
            year = max_year

    if kd_kecamatan:
        conditions.append(SpptReport.KD_KECAMATAN == kd_kecamatan)

    # Build main query
    base_query = select(SpptReport)
    if conditions:
        base_query = base_query.where(and_(*conditions))

    # Get total count
    count_query = select(func.count()).select_from(SpptReport)
    if conditions:
        count_query = count_query.where(and_(*conditions))
    total_count = await session.scalar(count_query)

    # Get paginated data
    data_query = base_query.order_by(
        SpptReport.NM_KECAMATAN,
        SpptReport.NM_KELURAHAN
    ).offset((page - 1) * limit).limit(limit)

    result = await session.execute(data_query)
    sppt_reports = result.scalars().all()

    # Convert to response format
    data = [
        SpptReportResponse(
            THN_PAJAK_SPPT=item.THN_PAJAK_SPPT,
            KD_PROPINSI=item.KD_PROPINSI,
            KD_DATI2=item.KD_DATI2,
            KD_KECAMATAN=item.KD_KECAMATAN,
            KD_KELURAHAN=item.KD_KELURAHAN,
            NM_KECAMATAN=item.NM_KECAMATAN,
            NM_KELURAHAN=item.NM_KELURAHAN,
            LEMBAR_PBB=item.LEMBAR_PBB,
            LEMBAR_REALISASI=float(item.LEMBAR_REALISASI) if item.LEMBAR_REALISASI else 0,
            LEMBAR_TUNGGAKAN=float(item.LEMBAR_TUNGGAKAN) if item.LEMBAR_TUNGGAKAN else 0,
            LUAS_BUMI_SPPT=float(item.LUAS_BUMI_SPPT) if item.LUAS_BUMI_SPPT else 0,
            LUAS_BNG_SPPT=float(item.LUAS_BNG_SPPT) if item.LUAS_BNG_SPPT else 0,
            NJOP_BUMI_SPPT=float(item.NJOP_BUMI_SPPT) if item.NJOP_BUMI_SPPT else 0,
            NJOP_BNG_SPPT=float(item.NJOP_BNG_SPPT) if item.NJOP_BNG_SPPT else 0,
            NJOP_SPPT=float(item.NJOP_SPPT) if item.NJOP_SPPT else 0,
            PBB_TERHUTANG_SPPT=float(item.PBB_TERHUTANG_SPPT) if item.PBB_TERHUTANG_SPPT else 0,
            FAKTOR_PENGURANG_SPPT=float(item.FAKTOR_PENGURANG_SPPT) if item.FAKTOR_PENGURANG_SPPT else 0,
            PBB_YG_HARUS_DIBAYAR_SPPT=float(item.PBB_YG_HARUS_DIBAYAR_SPPT) if item.PBB_YG_HARUS_DIBAYAR_SPPT else 0,
            REALISASI=float(item.REALISASI) if item.REALISASI else 0,
            TUNGGAKAN=float(item.TUNGGAKAN) if item.TUNGGAKAN else 0,
        )
        for item in sppt_reports
    ]

    # Calculate aggregate stats
    stats_query = select(
        func.sum(SpptReport.LUAS_BUMI_SPPT).label('total_luas_bumi'),
        func.sum(SpptReport.LUAS_BNG_SPPT).label('total_luas_bangunan'),
        func.sum(SpptReport.NJOP_SPPT).label('total_njop'),
        func.sum(SpptReport.PBB_TERHUTANG_SPPT).label('total_pbb_terhutang'),
        func.sum(SpptReport.PBB_YG_HARUS_DIBAYAR_SPPT).label('total_pbb_harus_dibayar'),
        func.sum(SpptReport.REALISASI).label('total_realisasi'),
        func.sum(SpptReport.TUNGGAKAN).label('total_tunggakan'),
        func.sum(SpptReport.LEMBAR_PBB).label('total_lembar_ketetapan'),
        func.sum(SpptReport.LEMBAR_REALISASI).label('total_lembar_realisasi'),
        func.sum(SpptReport.LEMBAR_TUNGGAKAN).label('total_lembar_tunggakan'),
    ).select_from(SpptReport)

    if conditions:
        stats_query = stats_query.where(and_(*conditions))

    stats_result = await session.execute(stats_query)
    stats_row = stats_result.first()

    # Calculate distinct kecamatan and kelurahan counts (unaffected by filters)
    kecamatan_query = select(func.count(func.distinct(SpptReport.KD_KECAMATAN))).select_from(SpptReport)
    kelurahan_query = select(func.count(func.distinct(SpptReport.KD_KELURAHAN))).select_from(SpptReport)

    # Don't apply year/kecamatan filters to total counts
    total_kecamatan = await session.scalar(kecamatan_query)
    total_kelurahan = await session.scalar(kelurahan_query)

    total_pbb_harus_dibayar = float(stats_row.total_pbb_harus_dibayar or 0)
    total_realisasi = float(stats_row.total_realisasi or 0)
    total_tunggakan = float(stats_row.total_tunggakan or 0)

    # Calculate percentages
    persentase_realisasi = (total_realisasi / total_pbb_harus_dibayar * 100) if total_pbb_harus_dibayar > 0 else 0
    persentase_tunggakan = (total_tunggakan / total_pbb_harus_dibayar * 100) if total_pbb_harus_dibayar > 0 else 0

    # Get yearly data for chart (only apply kecamatan filter, not year filter)
    yearly_conditions = []
    if kd_kecamatan:
        yearly_conditions.append(SpptReport.KD_KECAMATAN == kd_kecamatan)

    yearly_query = select(
        SpptReport.THN_PAJAK_SPPT,
        func.sum(SpptReport.PBB_YG_HARUS_DIBAYAR_SPPT).label('total_pbb_harus_dibayar'),
        func.sum(SpptReport.REALISASI).label('total_realisasi'),
        func.sum(SpptReport.TUNGGAKAN).label('total_tunggakan'),
    ).select_from(SpptReport).group_by(SpptReport.THN_PAJAK_SPPT).order_by(SpptReport.THN_PAJAK_SPPT.desc()).limit(15)

    if yearly_conditions:
        yearly_query = yearly_query.where(and_(*yearly_conditions))

    yearly_result = await session.execute(yearly_query)
    yearly_rows = list(reversed(yearly_result.all()))  # Reverse to get chronological order for chart

    yearly_data = [
        YearlyDataResponse(
            year=row.THN_PAJAK_SPPT,
            pbb_harus_dibayar=float(row.total_pbb_harus_dibayar or 0),
            realisasi=float(row.total_realisasi or 0),
            tunggakan=float(row.total_tunggakan or 0),
        )
        for row in yearly_rows
    ]

    # Get kecamatan name for filter info
    kecamatan_name = None
    if kd_kecamatan and data:
        kecamatan_name = data[0].NM_KECAMATAN

    stats = SpptReportStatsResponse(
        total_kecamatan=total_kecamatan or 0,
        total_kelurahan=total_kelurahan or 0,
        total_luas_bumi=float(stats_row.total_luas_bumi or 0),
        total_luas_bangunan=float(stats_row.total_luas_bangunan or 0),
        total_njop=float(stats_row.total_njop or 0),
        total_pbb_terhutang=float(stats_row.total_pbb_terhutang or 0),
        total_pbb_harus_dibayar=total_pbb_harus_dibayar,
        total_realisasi=total_realisasi,
        total_tunggakan=total_tunggakan,
        total_lembar_ketetapan=int(stats_row.total_lembar_ketetapan or 0),
        total_lembar_realisasi=float(stats_row.total_lembar_realisasi or 0),
        total_lembar_tunggakan=float(stats_row.total_lembar_tunggakan or 0),
        persentase_realisasi=round(persentase_realisasi, 2),
        persentase_tunggakan=round(persentase_tunggakan, 2),
        yearly_data=yearly_data,
        filtered_by_year=year,
        filtered_by_kecamatan=kecamatan_name,
    )

    return SpptReportTableResponse(
        data=data,
        total_count=total_count or 0,
        stats=stats,
    )