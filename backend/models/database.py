from sqlalchemy import create_engine, Column, String, DateTime, Float, Text
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from datetime import datetime

SQLALCHEMY_DATABASE_URL = "sqlite:///./stock_analyzer.db"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False}
)
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
