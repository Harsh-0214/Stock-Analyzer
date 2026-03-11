import os
from sqlalchemy import create_engine, Column, String, DateTime, Float, Text
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from datetime import datetime

# Use DATABASE_URL env var for Neon/Postgres in production,
# fall back to local SQLite for development.
_raw_url = os.getenv("DATABASE_URL", "sqlite:////tmp/stock_analyzer.db")

# Neon (and some other providers) give a postgres:// URL.
# SQLAlchemy requires postgresql:// so fix it here.
if _raw_url.startswith("postgres://"):
    _raw_url = _raw_url.replace("postgres://", "postgresql://", 1)

IS_SQLITE = _raw_url.startswith("sqlite")
connect_args = {"check_same_thread": False} if IS_SQLITE else {}

engine = create_engine(_raw_url, connect_args=connect_args)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


class WatchlistItem(Base):
    __tablename__ = "watchlist"

    symbol = Column(String, primary_key=True, index=True)
    company_name = Column(String)
    added_at = Column(DateTime, default=datetime.utcnow)
    notes = Column(Text, default="")
    target_price = Column(Float, nullable=True)
    buy_price = Column(Float, nullable=True)


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def create_tables():
    Base.metadata.create_all(bind=engine)
