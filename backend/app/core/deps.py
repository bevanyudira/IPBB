from typing import Annotated

from fastapi import Depends, HTTPException, status
from fastapi.security import (
    HTTPAuthorizationCredentials,
    OAuth2PasswordBearer,
    HTTPBearer,
)
from sqlmodel.ext.asyncio.session import AsyncSession
from app.core.config import settings
from app.core.database import get_async_session

# reusable_oauth2 = OAuth2PasswordBearer(tokenUrl=f"{settings.API_V1_STR}/auth/login")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl=f"/auth/login")
http_bearer = HTTPBearer(auto_error=False)

SessionDep = Annotated[AsyncSession, Depends(get_async_session)]
TokenDep = Annotated[str, Depends(oauth2_scheme)]


async def get_token(
    oauth_token: str = Depends(oauth2_scheme),
    bearer_creds: HTTPAuthorizationCredentials = Depends(http_bearer),
) -> str:
    if bearer_creds and bearer_creds.scheme.lower() == "bearer":
        return bearer_creds.credentials
    if oauth_token:
        return oauth_token
    raise HTTPException(status_code=401, detail="Not authenticated")


# ============================================================================
# AUTHORIZATION DEPENDENCIES
# ============================================================================

async def get_current_admin_user(
    current_user: "User" = Depends(lambda: None),  # Will be imported dynamically
) -> "User":
    """
    Dependency to get current user and verify admin status.
    Raises 403 if user is not admin.
    
    Usage:
        from app.core.deps import AdminUser
        
        @router.get("/admin-only")
        async def admin_endpoint(admin: AdminUser):
            # Only admins can reach here
            return {"message": "Hello admin!"}
    """
    # Import here to avoid circular dependency
    from app.auth.service import get_current_user as _get_current_user
    from app.models.user import User
    
    # Get current user first
    user = await _get_current_user(
        session=current_user if hasattr(current_user, 'exec') else None,
        token=None  # Will be handled by get_current_user
    )
    
    if not user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail={
                "code": "ADMIN_REQUIRED",
                "msg": "This endpoint requires administrator privileges"
            }
        )
    return user


async def get_verified_user(
    session: SessionDep,
    current_user: "User" = None,
) -> "User":
    """
    Dependency to get current user and verify SPPT verification status.
    Raises 403 if user is not verified.
    
    Usage:
        from app.core.deps import VerifiedUser
        
        @router.get("/verified-only")
        async def verified_endpoint(user: VerifiedUser):
            # Only verified users can reach here
            return {"message": "Hello verified user!"}
    """
    # Import here to avoid circular dependency
    from app.auth.service import get_current_user as _get_current_user
    from app.models.user import User
    
    # Get current user first
    if current_user is None:
        current_user = await _get_current_user(session=session, token=None)
    
    if not current_user.is_verified:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail={
                "code": "VERIFICATION_REQUIRED",
                "msg": "You must verify your SPPT data to access this feature"
            }
        )
    return current_user
