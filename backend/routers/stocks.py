from fastapi import APIRouter, HTTPException, Query
from services.stock_service import (
    get_stock_info, get_stock_history, get_signal_analysis, search_stocks
)

router = APIRouter(prefix="/api/stocks", tags=["stocks"])


@router.get("/search")
async def search(q: str = Query(..., min_length=1)):
    """Search for stocks by symbol."""
    results = search_stocks(q.upper())
    return {"results": results}


@router.get("/{symbol}/info")
async def stock_info(symbol: str):
    """Get comprehensive stock information."""
    data = get_stock_info(symbol.upper())
    if "error" in data:
        raise HTTPException(status_code=404, detail=data["error"])
    return data


@router.get("/{symbol}/history")
async def stock_history(
    symbol: str,
    period: str = Query("1y", description="1d, 5d, 1mo, 3mo, 6mo, 1y, 2y, 5y"),
    interval: str = Query("1d", description="1m, 5m, 15m, 30m, 60m, 1d, 1wk, 1mo"),
):
    """Get historical price data with technical indicators."""
    data = get_stock_history(symbol.upper(), period, interval)
    if "error" in data:
        raise HTTPException(status_code=404, detail=data["error"])
    return data


@router.get("/{symbol}/signals")
async def stock_signals(symbol: str):
    """Get buy/sell signals and technical analysis."""
    data = get_signal_analysis(symbol.upper())
    if "error" in data:
        raise HTTPException(status_code=404, detail=data["error"])
    return data
