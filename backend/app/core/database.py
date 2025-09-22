from typing import AsyncGenerator

from fastapi import Depends
from fastapi_users.db import SQLAlchemyUserDatabase
from sqlalchemy.ext.asyncio import async_sessionmaker, create_async_engine
from sqlmodel.ext.asyncio.session import AsyncSession
from sqlalchemy.orm import DeclarativeBase

from app.models.user import User

from .config import settings


class Base(DeclarativeBase):
    pass


print("Database URL:", settings.DATABASE_URL)

# MySQL 5 compatible connection with proper pooling and timeouts
engine = create_async_engine(
    settings.DATABASE_URL,
    # Connection pool settings for better connection management
    pool_size=5,  # Number of connections to maintain in pool
    max_overflow=10,  # Additional connections allowed beyond pool_size
    pool_timeout=120,  # Increased to 120 seconds to wait for connection from pool
    pool_recycle=3600,  # Recycle connections after 1 hour
    pool_pre_ping=True,  # Test connections before use
    # MySQL 5 specific settings - using correct aiomysql parameters
    connect_args={
        "connect_timeout": 120,  # Increased connection timeout to 120 seconds
        "autocommit": True,      # Enable autocommit for MySQL 5
        "charset": "utf8mb4",    # Use utf8mb4 charset for better compatibility
    },
    echo=False  # Set to True for SQL debugging
)

async_session_maker = async_sessionmaker(
    engine, class_=AsyncSession, expire_on_commit=settings.EXPIRE_ON_COMMIT
)


async def create_db_and_tables():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)


async def get_async_session() -> AsyncGenerator[AsyncSession, None]:
    async with async_session_maker() as session:
        yield session


async def get_user_db(session: AsyncSession = Depends(get_async_session)):
    yield SQLAlchemyUserDatabase(session, User)
