from uuid import UUID
import asyncio
import logging
from fastapi import Depends, HTTPException
from sqlmodel.ext.asyncio.session import AsyncSession
from sqlmodel import select
from sqlalchemy.exc import OperationalError, DisconnectionError

from app.core import security
from app.core.database import get_async_session
from app.core.deps import SessionDep, get_token
from .schemas import RegisterRequest, TokenPayload
from .exceptions import user_already_exists_exception, credentials_exception
from app.models.user import User

logger = logging.getLogger(__name__)


async def retry_db_operation(operation, max_retries=3, delay=1):
    """Retry database operations with exponential backoff for MySQL 5 compatibility"""
    for attempt in range(max_retries):
        try:
            return await operation()
        except (OperationalError, DisconnectionError) as e:
            if attempt == max_retries - 1:
                logger.error(f"Database operation failed after {max_retries} attempts: {e}")
                raise HTTPException(
                    status_code=503,
                    detail={"code": "DATABASE_CONNECTION_ERROR", "msg": "Database temporarily unavailable"}
                )

            wait_time = delay * (2 ** attempt)  # Exponential backoff
            logger.warning(f"Database connection error on attempt {attempt + 1}, retrying in {wait_time}s: {e}")
            await asyncio.sleep(wait_time)


async def get_user_by_email(*, session: AsyncSession, email: str) -> User | None:
    statement = select(User).where(User.email == email)

    # Retry database operation for MySQL 5 compatibility
    async def get_user_by_email_operation():
        return await session.scalar(statement)

    try:
        db_user = await retry_db_operation(get_user_by_email_operation)
        return db_user
    except HTTPException:
        # If retry fails, return None instead of raising error
        # This is safer for email lookup operations
        logger.warning(f"Failed to get user by email {email} after retries")
        return None


async def get_user(
    session: SessionDep,
    token: str,
    require_active: bool = True,
) -> User:
    payload = security.decode_token(token, token_type="access")
    token_data = TokenPayload(**payload)

    try:
        user_id = UUID(token_data.sub)
    except ValueError:
        raise HTTPException(
            status_code=400,
            detail={"code": "USER_INVALID_ID", "msg": "Invalid user ID"},
        )

    # Retry database operation for MySQL 5 compatibility
    async def get_user_operation():
        return await session.get(User, user_id)

    user = await retry_db_operation(get_user_operation)

    if not user:
        raise HTTPException(
            status_code=404,
            detail={"code": "USER_NOT_FOUND", "msg": "User not found"},
        )

    if require_active and not user.is_active:
        raise HTTPException(
            status_code=400,
            detail={"code": "USER_INACTIVE", "msg": "Inactive user"},
        )

    return user


async def get_current_user(
    session: SessionDep,
    token: str = Depends(get_token),
) -> User:
    return await get_user(session=session, token=token, require_active=True)


async def get_current_user_allow_inactive(
    session: SessionDep,
    token: str = Depends(get_token),
) -> User:
    return await get_user(session=session, token=token, require_active=False)


async def create_user(*, session: AsyncSession, register: RegisterRequest) -> User:
    if await get_user_by_email(session=session, email=register.email):
        raise user_already_exists_exception()

    db_user = User.model_validate(
        register, update={"password": security.hash_password(register.password)}
    )

    # Retry database operations for MySQL 5 compatibility
    async def create_user_operation():
        session.add(db_user)
        await session.commit()
        await session.refresh(db_user)
        return db_user

    return await retry_db_operation(create_user_operation)


async def authenticate(
    *, session: AsyncSession, email: str, password: str
) -> User | None:
    # get_user_by_email already has retry logic built in
    db_user = await get_user_by_email(session=session, email=email)
    if not db_user or not security.verify_password(password, db_user.password):
        raise credentials_exception()
    return db_user
