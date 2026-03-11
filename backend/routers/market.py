from fastapi import APIRouter
from services.fear_greed import calculate_fear_greed_index
from services.trending import get_trending_stocks, get_market_overview

router = APIRouter(prefix="/api/market", tags=["market"])


@router.get("/fear-greed")
async def fear_greed():
    """Get the Fear & Greed Index."""
    return calculate_fear_greed_index()


@router.get("/overview")
async def market_overview():
    """Get market indices and sector performance."""
    return get_market_overview()


@router.get("/trending")
async def trending_stocks(limit: int = 20):
    """Get trending and momentum stocks."""
    return get_trending_stocks(limit=limit)
