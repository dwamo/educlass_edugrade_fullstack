import os

from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine
from sqlalchemy.orm import sessionmaker

DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "postgresql+asyncpg://merged_super:test123@127.0.0.1:5432/merged_system_db",
)

SQL_ECHO = os.getenv("SQL_ECHO", "false").lower() in ("1", "true", "yes")

# Create the database engine
engine = create_async_engine(DATABASE_URL, echo=SQL_ECHO)

# Create an async session
async_session = sessionmaker(
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False
)

# Dependency for getting a database session
async def get_db():
    async with async_session() as session:
        yield session
