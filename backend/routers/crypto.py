from fastapi import APIRouter, HTTPException
from services.crypto_service import get_top_cryptos, get_crypto_info, get_crypto_history, get_crypto_signals, search_cryptos

router = APIRouter(prefix="/api/crypto", tags=["crypto"])


@router.get("/top")
async def top_cryptos(limit: int = 20):
    try:
        data = get_top_cryptos(limit)
        return {"cryptos": data}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/search")
async def search(q: str):
    try:
        results = search_cryptos(q)
        return {"results": results}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/{symbol}/info")
async def crypto_info(symbol: str):
    try:
        ticker = symbol.upper()
        if not ticker.endswith("-USD"):
            ticker = f"{ticker}-USD"
        data = get_crypto_info(ticker)
        if not data:
            raise HTTPException(status_code=404, detail="Crypto not found")
        return data
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/{symbol}/history")
async def crypto_history(symbol: str, period: str = "1y", interval: str = "1d"):
    try:
        ticker = symbol.upper()
        if not ticker.endswith("-USD"):
            ticker = f"{ticker}-USD"
        data = get_crypto_history(ticker, period, interval)
        return data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/{symbol}/signals")
async def crypto_signals(symbol: str):
    try:
        ticker = symbol.upper()
        if not ticker.endswith("-USD"):
            ticker = f"{ticker}-USD"
        data = get_crypto_signals(ticker)
        return data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
