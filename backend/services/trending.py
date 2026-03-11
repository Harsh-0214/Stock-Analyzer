import yfinance as yf
import pandas as pd
import numpy as np
from services.indicators import sma, rsi, macd
import concurrent.futures

MARKET_UNIVERSE = [
    "AAPL", "MSFT", "NVDA", "GOOGL", "AMZN", "META", "TSLA", "AVGO", "ORCL", "AMD",
    "JPM", "BAC", "GS", "MS", "WFC", "V", "MA", "AXP", "BLK", "C",
    "JNJ", "UNH", "PFE", "ABBV", "LLY", "MRK", "TMO", "ABT", "AMGN",
    "WMT", "COST", "HD", "TGT", "NKE", "MCD", "SBUX", "LOW",
    "XOM", "CVX", "COP", "SLB", "EOG", "MPC",
    "CAT", "HON", "GE", "DE", "UPS", "FDX", "BA", "LMT",
    "PLTR", "SNOW", "NET", "CRWD", "ZS", "DDOG", "SHOP", "SQ", "COIN",
    "QCOM", "MU", "INTC", "TXN", "AMAT", "LRCX", "MRVL",
    "MRNA", "BNTX", "REGN", "VRTX", "BIIB",
]


def _analyze_single_stock(symbol: str) -> dict | None:
    try:
        ticker = yf.Ticker(symbol)
        hist = ticker.history(period="6mo")
        info = ticker.info

        if hist.empty or len(hist) < 50:
            return None

        close = hist["Close"]
        volume = hist["Volume"]
        current_price = float(close.iloc[-1])
        prev_price = float(close.iloc[-2])

        change_1d = ((current_price - prev_price) / prev_price) * 100
        change_5d = ((current_price - float(close.iloc[-6])) / float(close.iloc[-6])) * 100 if len(close) > 5 else 0
        change_1m = ((current_price - float(close.iloc[-22])) / float(close.iloc[-22])) * 100 if len(close) > 21 else 0
        change_3m = ((current_price - float(close.iloc[0])) / float(close.iloc[0])) * 100

        avg_vol = float(volume.tail(20).mean())
        curr_vol = float(volume.iloc[-1])
        vol_ratio = curr_vol / avg_vol if avg_vol > 0 else 1.0

        rsi_val = float(rsi(close, 14).iloc[-1])
        sma_20_val = float(sma(close, 20).iloc[-1])
        sma_50_val = float(sma(close, 50).iloc[-1])
        macd_line, signal_line, _ = macd(close)
        macd_val = float(macd_line.iloc[-1])
        macd_sig = float(signal_line.iloc[-1])

        score = 50
        if 40 < rsi_val < 65:
            score += 15
        elif rsi_val < 35:
            score += 10
        elif rsi_val > 75:
            score -= 15

        if current_price > sma_20_val > sma_50_val:
            score += 20
        elif current_price > sma_20_val:
            score += 10
        elif current_price < sma_20_val < sma_50_val:
            score -= 20

        if macd_val > macd_sig:
            score += 10
        else:
            score -= 10

        if change_1m > 10:
            score += 15
        elif change_1m > 5:
            score += 8
        elif change_1m < -10:
            score -= 15
        elif change_1m < -5:
            score -= 8

        if vol_ratio > 1.5 and change_1d > 0:
            score += 10

        score = float(np.clip(score, 0, 100))

        # A stock is bullish when price is in an uptrend, MACD confirms
        # momentum, RSI is not overbought, and the score clears the neutral midpoint
        is_bullish = (
            current_price > sma_20_val
            and macd_val > macd_sig
            and rsi_val < 75
            and score >= 60
        )

        return {
            "symbol": symbol,
            "company_name": info.get("longName", symbol),
            "sector": info.get("sector", "Unknown"),
            "current_price": round(current_price, 2),
            "change_1d": round(change_1d, 2),
            "change_5d": round(change_5d, 2),
            "change_1m": round(change_1m, 2),
            "change_3m": round(change_3m, 2),
            "volume_ratio": round(vol_ratio, 2),
            "rsi": round(rsi_val, 1),
            "momentum_score": round(score, 1),
            "market_cap": info.get("marketCap"),
            "pe_ratio": info.get("trailingPE"),
            "signal": "BULLISH" if is_bullish else "NEUTRAL",
            "is_bullish": is_bullish,
        }
    except Exception:
        return None


def get_trending_stocks(limit: int = 20) -> dict:
    results = []
    with concurrent.futures.ThreadPoolExecutor(max_workers=10) as executor:
        futures = {executor.submit(_analyze_single_stock, sym): sym for sym in MARKET_UNIVERSE}
        for future in concurrent.futures.as_completed(futures):
            result = future.result()
            if result:
                results.append(result)

    results.sort(key=lambda x: x["momentum_score"], reverse=True)

    bullish = [r for r in results if r["is_bullish"]]

    top_movers = sorted(bullish, key=lambda x: x["change_1d"], reverse=True)[:10]
    volume_surges = sorted(bullish, key=lambda x: x["volume_ratio"], reverse=True)[:10]
    momentum_plays = [r for r in bullish if 50 < r["rsi"] < 65 and r["change_1m"] > 5][:10]
    oversold_bounce = [r for r in bullish if r["rsi"] < 45][:8]

    return {
        "top_momentum": bullish[:limit],
        "top_movers_today": top_movers,
        "volume_surges": volume_surges,
        "momentum_plays": momentum_plays,
        "oversold_bounce": oversold_bounce,
        "total_scanned": len(results),
    }


def get_market_overview() -> dict:
    indices = {
        "S&P 500": "SPY",
        "NASDAQ 100": "QQQ",
        "Russell 2000": "IWM",
        "Dow Jones": "DIA",
        "Gold": "GLD",
        "Oil": "USO",
        "Bitcoin": "BTC-USD",
    }

    overview = []
    for name, symbol in indices.items():
        try:
            ticker = yf.Ticker(symbol)
            hist = ticker.history(period="5d")
            if not hist.empty:
                current = float(hist["Close"].iloc[-1])
                prev = float(hist["Close"].iloc[-2]) if len(hist) > 1 else current
                change = ((current - prev) / prev) * 100
                change_5d = ((current - float(hist["Close"].iloc[0])) / float(hist["Close"].iloc[0])) * 100
                overview.append({
                    "name": name, "symbol": symbol,
                    "price": round(current, 2),
                    "change_1d": round(change, 2),
                    "change_5d": round(change_5d, 2),
                    "trend": "up" if change > 0 else "down",
                })
        except Exception:
            pass

    sectors = {
        "Technology": "XLK", "Financial": "XLF", "Healthcare": "XLV",
        "Energy": "XLE", "Consumer Disc.": "XLY", "Industrials": "XLI",
        "Materials": "XLB", "Utilities": "XLU", "Real Estate": "XLRE",
        "Comm. Services": "XLC", "Consumer Staples": "XLP",
    }

    sector_performance = []
    for sector_name, symbol in sectors.items():
        try:
            ticker = yf.Ticker(symbol)
            hist = ticker.history(period="1mo")
            if not hist.empty and len(hist) > 1:
                current = float(hist["Close"].iloc[-1])
                prev = float(hist["Close"].iloc[-2])
                change_1d = ((current - prev) / prev) * 100
                change_1m = ((current - float(hist["Close"].iloc[0])) / float(hist["Close"].iloc[0])) * 100
                sector_performance.append({
                    "sector": sector_name, "symbol": symbol,
                    "change_1d": round(change_1d, 2),
                    "change_1m": round(change_1m, 2),
                })
        except Exception:
            pass

    sector_performance.sort(key=lambda x: x["change_1d"], reverse=True)

    return {"indices": overview, "sectors": sector_performance}
