from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlmodel import select, func, or_
from app.core.deps import SessionDep
from app.models.user import User
from app.models.dashboard_responses import UserListResponse, UserUpdateRequest, UserCreateRequest, PaginatedUserListResponse
from app.auth.service import get_current_user, retry_db_operation
from app.core.security import hash_password
import math

router = APIRouter(prefix="/admin", tags=["admin"])


@router.get("/users", response_model=PaginatedUserListResponse)
async def get_all_users(
    session: SessionDep,
    current_user: User = Depends(get_current_user),
    page: int = Query(1, ge=1, description="Page number"),
    limit: int = Query(50, ge=1, le=100, description="Items per page"),
    search: Optional[str] = Query(None, description="Search in email, name")
):
    """Get all users with pagination and search - admin only"""
    if not current_user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only admin can access user list"
        )

    # Build base query
    base_statement = select(User)
    count_statement = select(func.count(User.id))

    # Add search filter if provided
    if search:
        search_filter = or_(
            User.email.ilike(f"%{search}%"),
            User.nama.ilike(f"%{search}%")
        )
        base_statement = base_statement.where(search_filter)
        count_statement = count_statement.where(search_filter)

    # Get total count
    async def get_count_operation():
        result = await session.exec(count_statement)
        return result.one()

    total_count = await retry_db_operation(get_count_operation)

    # Add pagination
    offset = (page - 1) * limit
    statement = base_statement.offset(offset).limit(limit)

    async def get_users_operation():
        result = await session.exec(statement)
        return result.all()

    users = await retry_db_operation(get_users_operation)

    # Calculate total pages
    total_pages = math.ceil(total_count / limit)

    user_list = [
        UserListResponse(
            id=str(user.id),
            username=user.email,  # Use email as username since there's no username field
            email=user.email,
            full_name=user.nama,
            is_admin=user.is_admin,
            is_active=user.is_active,
            created_at=user.created_at,
            updated_at=user.updated_at
        )
        for user in users
    ]

    return PaginatedUserListResponse(
        data=user_list,
        total_count=total_count,
        page=page,
        limit=limit,
        total_pages=total_pages
    )


@router.patch("/users/{user_id}")
async def update_user(
    user_id: str,
    user_update: UserUpdateRequest,
    session: SessionDep,
    current_user: User = Depends(get_current_user)
):
    """Update user admin status and active status - admin only"""
    if not current_user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only admin can update users"
        )

    # Get user to update
    try:
        from uuid import UUID
        user_uuid = UUID(user_id)
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid user ID format"
        )

    statement = select(User).where(User.id == user_uuid)
    result = await session.exec(statement)
    user = result.first()

    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )

    # Prevent admin from removing their own admin status
    if user.id == current_user.id and user_update.is_admin is False:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot remove admin status from yourself"
        )

    # Update fields if provided
    if user_update.is_admin is not None:
        user.is_admin = user_update.is_admin
    if user_update.is_active is not None:
        user.is_active = user_update.is_active

    session.add(user)
    await session.commit()
    await session.refresh(user)

    return {"message": "User updated successfully"}


@router.delete("/users/{user_id}")
async def delete_user(
    user_id: str,
    session: SessionDep,
    current_user: User = Depends(get_current_user)
):
    """Delete user - admin only"""
    if not current_user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only admin can delete users"
        )

    # Get user to delete
    try:
        from uuid import UUID
        user_uuid = UUID(user_id)
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid user ID format"
        )

    statement = select(User).where(User.id == user_uuid)
    result = await session.exec(statement)
    user = result.first()

    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )

    # Prevent admin from deleting themselves
    if user.id == current_user.id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot delete yourself"
        )

    await session.delete(user)
    await session.commit()

    return {"message": "User deleted successfully"}


@router.post("/users", response_model=UserListResponse)
async def create_user(
    user_data: UserCreateRequest,
    session: SessionDep,
    current_user: User = Depends(get_current_user)
):
    """Create new user - admin only"""
    if not current_user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only admin can create users"
        )

    # Check if email already exists
    statement = select(User).where(User.email == user_data.email)
    result = await session.exec(statement)
    existing_user = result.first()

    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already exists"
        )

    # Hash password and create user
    hashed_password = hash_password(user_data.password)

    new_user = User(
        email=user_data.email,
        nama=user_data.full_name,
        password=hashed_password,
        is_admin=user_data.is_admin,
        is_active=user_data.is_active
    )

    session.add(new_user)
    await session.commit()
    await session.refresh(new_user)

    return UserListResponse(
        id=str(new_user.id),
        username=new_user.email,  # Use email as username
        email=new_user.email,
        full_name=new_user.nama,
        is_admin=new_user.is_admin,
        is_active=new_user.is_active,
        created_at=new_user.created_at,
        updated_at=new_user.updated_at
    )