from sqlalchemy import create_engine
from sqlalchemy.engine import URL
from sqlalchemy.orm import DeclarativeBase, sessionmaker

from app.config import settings

engine = create_engine(URL.create(
    "postgresql+psycopg2",
    username=settings.postgres_user,
    password=settings.postgres_password,
    host=settings.database_host,
    port=settings.database_port,
    database=settings.postgres_db,
))
SessionLocal = sessionmaker(bind=engine)


class Base(DeclarativeBase):
    pass


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
