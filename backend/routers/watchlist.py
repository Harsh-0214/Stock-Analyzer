from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional
from models.database import get_db, WatchlistItem
from services.stock_service import get_stock_info

router = APIRouter(prefix="/api/watchlist", tags=["watchlist"])


class WatchlistAdd(BaseModel):
    symbol: str
    notes: Optional[str] = ""
    target_price: Optional[float] = None
    buy_price: Optional[float] = None


class WatchlistUpdate(BaseModel):
    notes: Optional[str] = None
    target_price: Optional[float] = None
    buy_price: Optional[float] = None


@router.get("")
async def get_watchlist(db: Session = Depends(get_db)):
    """Get all watchlist items with current prices."""
    items = db.query(WatchlistItem).all()
    result = []
    for item in items:
        stock_data = get_stock_info(item.symbol)
        entry = {
            "symbol": item.symbol,
            "company_name": item.company_name,
            "notes": item.notes,
            "target_price": item.target_price,
            "buy_price": item.buy_price,
            "added_at": item.added_at.isoformat() if item.added_at else None,
        }
        if "error" not in stock_data:
            entry.update({
                "current_price": stock_data.get("current_price"),
                "price_change": stock_data.get("price_change"),
                "price_change_pct": stock_data.get("price_change_pct"),
                "market_cap": stock_data.get("market_cap"),
                "pe_ratio": stock_data.get("pe_ratio"),
                "sector": stock_data.get("sector"),
            })
            if item.buy_price and stock_data.get("current_price"):
                entry["pnl_pct"] = round(((stock_data["current_price"] - item.buy_price) / item.buy_price) * 100, 2)
            if item.target_price and stock_data.get("current_price"):
                entry["upside_pct"] = round(((item.target_price - stock_data["current_price"]) / stock_data["current_price"]) * 100, 2)
        result.append(entry)
    return result


@router.post("")
async def add_to_watchlist(item: WatchlistAdd, db: Session = Depends(get_db)):
    """Add a stock to the watchlist."""
    symbol = item.symbol.upper()

    existing = db.query(WatchlistItem).filter(WatchlistItem.symbol == symbol).first()
    if existing:
        raise HTTPException(status_code=400, detail=f"{symbol} is already in your watchlist")

    stock_data = get_stock_info(symbol)
    if "error" in stock_data:
        raise HTTPException(status_code=404, detail=f"Stock {symbol} not found")

    db_item = WatchlistItem(
        symbol=symbol,
        company_name=stock_data.get("company_name", symbol),
        notes=item.notes or "",
        target_price=item.target_price,
        buy_price=item.buy_price,
    )
    db.add(db_item)
    db.commit()
    db.refresh(db_item)

    return {"message": f"{symbol} added to watchlist", "symbol": symbol}


@router.put("/{symbol}")
async def update_watchlist_item(symbol: str, update: WatchlistUpdate, db: Session = Depends(get_db)):
    """Update watchlist item notes, target price, or buy price."""
    item = db.query(WatchlistItem).filter(WatchlistItem.symbol == symbol.upper()).first()
    if not item:
        raise HTTPException(status_code=404, detail=f"{symbol} not found in watchlist")

    if update.notes is not None:
        item.notes = update.notes
    if update.target_price is not None:
        item.target_price = update.target_price
    if update.buy_price is not None:
        item.buy_price = update.buy_price

    db.commit()
    return {"message": f"{symbol} updated", "symbol": symbol}


@router.delete("/{symbol}")
async def remove_from_watchlist(symbol: str, db: Session = Depends(get_db)):
    """Remove a stock from the watchlist."""
    item = db.query(WatchlistItem).filter(WatchlistItem.symbol == symbol.upper()).first()
    if not item:
        raise HTTPException(status_code=404, detail=f"{symbol} not found in watchlist")

    db.delete(item)
    db.commit()
    return {"message": f"{symbol} removed from watchlist"}
