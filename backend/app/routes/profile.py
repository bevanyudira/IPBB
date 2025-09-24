from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import select
from sqlmodel.ext.asyncio.session import AsyncSession

from app.auth import service
from app.core.database import get_async_session
from app.models.dat_subjek_pajak import DatSubjekPajak
from app.models.user import User
from .schemas import DatSubjekPajakResponse

router = APIRouter(tags=["profile"])


@router.get("/me", response_model=DatSubjekPajakResponse)
async def get_my_profile(
    session: AsyncSession = Depends(get_async_session),
    current_user: User = Depends(service.get_current_user),
):
    """Get current user's profile data from dat_subjek_pajak based on email"""

    query = select(DatSubjekPajak).where(
        DatSubjekPajak.EMAIL_WP == str(current_user.email)
    )

    result = await session.exec(query)
    profile = result.first()

    if not profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Profile data not found for this user",
        )

    return profile


@router.get("/toggle-admin")
async def toggle_admin(
    session: AsyncSession = Depends(get_async_session),
    current_user: User = Depends(service.get_current_user),
):
    """Toggle current user's admin status"""

    current_user.is_admin = not current_user.is_admin
    session.add(current_user)
    await session.commit()
    await session.refresh(current_user)

    return {
        "message": f"Admin status {'enabled' if current_user.is_admin else 'disabled'}",
        "is_admin": current_user.is_admin
    }
