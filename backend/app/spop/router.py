from typing import Optional
from fastapi import APIRouter, Depends, Query, HTTPException, status
from sqlmodel.ext.asyncio.session import AsyncSession

from app.core.deps import SessionDep
from app.models.user import User
from app.auth import service as auth_service
from app.spop.schemas import (
    SpopCreate,
    SpopUpdate,
    SpopRead,
    SpopListResponse,
    RefPropinsi,
    RefDati2,
    RefKecamatan,
    RefKelurahan
)
from app.spop.service import SpopService
from math import ceil

router = APIRouter(prefix="/spop", tags=["SPOP - Surat Pemberitahuan Objek Pajak"])


@router.get("/reference/propinsi", response_model=list[RefPropinsi])
async def get_propinsi_list(session: SessionDep):
    """Ambil daftar provinsi untuk dropdown"""
    return await SpopService.get_all_propinsi(session)


@router.get("/reference/dati2/{kd_propinsi}", response_model=list[RefDati2])
async def get_dati2_list(kd_propinsi: str, session: SessionDep):
    """Ambil daftar kabupaten/kota berdasarkan provinsi"""
    return await SpopService.get_dati2_by_propinsi(session, kd_propinsi)


@router.get("/reference/kecamatan/{kd_propinsi}/{kd_dati2}", response_model=list[RefKecamatan])
async def get_kecamatan_list(
    kd_propinsi: str,
    kd_dati2: str,
    session: SessionDep
):
    """Ambil daftar kecamatan berdasarkan kabupaten/kota"""
    return await SpopService.get_kecamatan_by_dati2(session, kd_propinsi, kd_dati2)


@router.get("/reference/kelurahan/{kd_propinsi}/{kd_dati2}/{kd_kecamatan}", response_model=list[RefKelurahan])
async def get_kelurahan_list(
    kd_propinsi: str,
    kd_dati2: str,
    kd_kecamatan: str,
    session: SessionDep
):
    """Ambil daftar kelurahan berdasarkan kecamatan"""
    return await SpopService.get_kelurahan_by_kecamatan(
        session, kd_propinsi, kd_dati2, kd_kecamatan
    )


@router.get("/list", response_model=SpopListResponse)
async def get_spop_list(
    session: SessionDep,
    current_user: User = Depends(auth_service.get_current_user),
    page: int = Query(1, ge=1, description="Halaman"),
    page_size: int = Query(20, ge=1, le=100, description="Jumlah data per halaman"),
    kd_propinsi: Optional[str] = Query(None, description="Filter berdasarkan provinsi"),
    kd_dati2: Optional[str] = Query(None, description="Filter berdasarkan kabupaten/kota"),
    kd_kecamatan: Optional[str] = Query(None, description="Filter berdasarkan kecamatan"),
    kd_kelurahan: Optional[str] = Query(None, description="Filter berdasarkan kelurahan"),
    search: Optional[str] = Query(None, description="Pencarian berdasarkan alamat, subjek pajak, atau nomor formulir")
):
    """
    Ambil daftar SPOP dengan pagination dan filter - hanya milik user yang login
    """
    spop_list, total = await SpopService.get_spop_list(
        session=session,
        current_user_email=str(current_user.email),
        page=page,
        page_size=page_size,
        kd_propinsi=kd_propinsi,
        kd_dati2=kd_dati2,
        kd_kecamatan=kd_kecamatan,
        kd_kelurahan=kd_kelurahan,
        search=search
    )
    
    return SpopListResponse(
        data=spop_list,
        total=total,
        page=page,
        page_size=page_size,
        total_pages=ceil(total / page_size) if total > 0 else 0
    )


@router.get("/{kd_propinsi}/{kd_dati2}/{kd_kecamatan}/{kd_kelurahan}/{kd_blok}/{no_urut}/{kd_jns_op}", response_model=SpopRead)
async def get_spop_detail(
    kd_propinsi: str,
    kd_dati2: str,
    kd_kecamatan: str,
    kd_kelurahan: str,
    kd_blok: str,
    no_urut: str,
    kd_jns_op: str,
    session: SessionDep,
    current_user: User = Depends(auth_service.get_current_user)
):
    """
    Ambil detail SPOP berdasarkan NOP (Nomor Objek Pajak) - hanya milik user yang login
    """
    spop = await SpopService.get_spop_by_nop(
        session=session,
        kd_propinsi=kd_propinsi,
        kd_dati2=kd_dati2,
        kd_kecamatan=kd_kecamatan,
        kd_kelurahan=kd_kelurahan,
        kd_blok=kd_blok,
        no_urut=no_urut,
        kd_jns_op=kd_jns_op
    )
    
    if not spop:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="SPOP tidak ditemukan"
        )
    
    # Validasi kepemilikan SPOP
    from app.models.dat_subjek_pajak import DatSubjekPajak
    from sqlmodel import select
    
    subjek_query = select(DatSubjekPajak.SUBJEK_PAJAK_ID).where(
        DatSubjekPajak.EMAIL_WP == str(current_user.email)
    )
    subjek_result = await session.execute(subjek_query)
    subjek_pajak_id = subjek_result.scalar_one_or_none()
    
    if not subjek_pajak_id or spop.SUBJEK_PAJAK_ID != subjek_pajak_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Anda tidak memiliki akses ke SPOP ini"
        )
    
    return spop


@router.post("/create", response_model=SpopRead, status_code=status.HTTP_201_CREATED)
async def create_spop(
    spop_data: SpopCreate,
    session: SessionDep,
    current_user: User = Depends(auth_service.get_current_user)
):
    """
    Buat SPOP baru - SUBJEK_PAJAK_ID akan otomatis diambil dari user yang login
    """
    # Get subjek_pajak_id from current user
    from app.models.dat_subjek_pajak import DatSubjekPajak
    from sqlmodel import select
    
    subjek_query = select(DatSubjekPajak.SUBJEK_PAJAK_ID).where(
        DatSubjekPajak.EMAIL_WP == str(current_user.email)
    )
    subjek_result = await session.execute(subjek_query)
    subjek_pajak_id = subjek_result.scalar_one_or_none()
    
    if not subjek_pajak_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User tidak memiliki Subjek Pajak ID"
        )
    
    # Override SUBJEK_PAJAK_ID dengan ID dari user yang login
    spop_data.SUBJEK_PAJAK_ID = subjek_pajak_id
    
    spop = await SpopService.create_spop(session=session, spop_data=spop_data)
    return spop


@router.put("/update", response_model=SpopRead)
async def update_spop(
    spop_data: SpopUpdate,
    session: SessionDep,
    current_user: User = Depends(auth_service.get_current_user)
):
    """
    Update SPOP yang sudah ada - hanya bisa update SPOP milik sendiri
    """
    # Validasi kepemilikan SPOP
    from app.models.dat_subjek_pajak import DatSubjekPajak
    from sqlmodel import select
    
    subjek_query = select(DatSubjekPajak.SUBJEK_PAJAK_ID).where(
        DatSubjekPajak.EMAIL_WP == str(current_user.email)
    )
    subjek_result = await session.execute(subjek_query)
    subjek_pajak_id = subjek_result.scalar_one_or_none()
    
    if not subjek_pajak_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User tidak memiliki Subjek Pajak ID"
        )
    
    # Cek apakah SPOP ada dan milik user
    existing_spop = await SpopService.get_spop_by_nop(
        session=session,
        kd_propinsi=spop_data.KD_PROPINSI,
        kd_dati2=spop_data.KD_DATI2,
        kd_kecamatan=spop_data.KD_KECAMATAN,
        kd_kelurahan=spop_data.KD_KELURAHAN,
        kd_blok=spop_data.KD_BLOK,
        no_urut=spop_data.NO_URUT,
        kd_jns_op=spop_data.KD_JNS_OP
    )
    
    if not existing_spop:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="SPOP tidak ditemukan"
        )
    
    if existing_spop.SUBJEK_PAJAK_ID != subjek_pajak_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Anda tidak memiliki akses untuk mengubah SPOP ini"
        )
    
    spop = await SpopService.update_spop(session=session, spop_data=spop_data)
    return spop


# ============ Reference Data Endpoints ============
# Note: Tidak ada endpoint DELETE sesuai requirement
# SPOP tidak boleh dihapus, hanya bisa dibuat dan diupdate
