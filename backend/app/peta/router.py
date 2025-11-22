"""
Router untuk Peta GIS API
Endpoint untuk query polygon berdasarkan NOP
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel.ext.asyncio.session import AsyncSession

from app.core.deps import SessionDep
from app.models.user import User
from app.auth import service as auth_service
from app.peta.schemas import PetaGeoJSONResponse, PetaInfoResponse
from app.peta.service import PetaService

router = APIRouter(prefix="/peta", tags=["peta"])


@router.get("/nop/{nop}", response_model=dict)
async def get_peta_by_nop(
    nop: str,
    session: SessionDep,
    current_user: User = Depends(auth_service.get_current_user)
):
    """
    Get polygon geometry untuk NOP tertentu dalam format GeoJSON
    
    Args:
        nop: Nomor Objek Pajak (18 digit)
        
    Returns:
        GeoJSON Feature dengan geometry polygon dan properties
    """
    # Query polygon dari database
    feature = await PetaService.get_polygon_by_nop(session, nop)
    
    if not feature:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Polygon untuk NOP {nop} tidak ditemukan"
        )
    
    return feature


@router.get("/nop/{nop}/info", response_model=PetaInfoResponse)
async def get_info_by_nop(
    nop: str,
    session: SessionDep,
    current_user: User = Depends(auth_service.get_current_user)
):
    """
    Get info objek pajak tanpa geometry
    
    Args:
        nop: Nomor Objek Pajak
        
    Returns:
        Info objek pajak (properties only, no geometry)
    """
    info = await PetaService.get_info_by_nop(session, nop)
    
    if not info:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Info untuk NOP {nop} tidak ditemukan"
        )
    
    return info


@router.get("/nop-list", response_model=list)
async def list_nops(
    session: SessionDep,
    current_user: User = Depends(auth_service.get_current_user),
    limit: int = 100
):
    """
    List NOP yang tersedia untuk dipilih
    
    Args:
        limit: Maximum number of NOPs to return (default 100)
        
    Returns:
        List of available NOPs
    """
    nops = await PetaService.list_available_nops(session, limit)
    return nops
