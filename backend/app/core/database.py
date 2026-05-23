import os
from urllib.parse import urlparse, urlencode, parse_qs, urlunparse
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine, async_sessionmaker
from app.core.config import settings
from app.models.base import Base

# Serverless environments (Vercel) need NullPool — no persistent connections
_IS_SERVERLESS = bool(os.environ.get("VERCEL") or os.environ.get("AWS_LAMBDA_FUNCTION_NAME"))


def _build_engine_args(url: str) -> tuple[str, dict]:
    """Strip sslmode from URL and return (clean_url, connect_args).

    asyncpg doesn't accept sslmode as a query param — SSL must be passed
    via connect_args instead.
    """
    parsed = urlparse(url)
    params = parse_qs(parsed.query)
    ssl_mode = params.pop("sslmode", [None])[0]
    clean_query = urlencode({k: v[0] for k, v in params.items()})
    clean_url = urlunparse(parsed._replace(query=clean_query))
    connect_args = {"ssl": True} if ssl_mode in ("require", "verify-ca", "verify-full") else {}
    return clean_url, connect_args


_db_url, _connect_args = _build_engine_args(settings.database_url)

if _IS_SERVERLESS:
    from sqlalchemy.pool import NullPool
    engine = create_async_engine(_db_url, echo=False, poolclass=NullPool, connect_args=_connect_args)
else:
    engine = create_async_engine(
        _db_url,
        echo=settings.app_env == "dev",
        pool_pre_ping=True,
        connect_args=_connect_args,
    )

AsyncSessionLocal = async_sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)


async def get_db() -> AsyncSession:
    async with AsyncSession(engine, expire_on_commit=False) as session:
        try:
            yield session
        finally:
            await session.close()


async def init_db() -> None:
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
