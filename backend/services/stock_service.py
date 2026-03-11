import yfinance as yf
import pandas as pd
import numpy as np
from datetime import datetime
from services.indicators import sma, ema, rsi, macd, bollinger_bands, stochastic


def get_stock_info(symbol: str) -> dict:
    """Fetch comprehensive stock information."""
    try:
        ticker = yf.Ticker(symbol)
        info = ticker.info

        hist_1y = ticker.history(period="1y")
        hist_3m = ticker.history(period="3mo")

        if hist_1y.empty:
            return {"error": f"No data found for symbol {symbol}"}

        current_price = hist_1y["Close"].iloc[-1]
        prev_close = hist_1y["Close"].iloc[-2] if len(hist_1y) > 1 else current_price
        price_change = current_price - prev_close
        price_change_pct = (price_change / prev_close) * 100

        high_52w = hist_1y["High"].max()
        low_52w = hist_1y["Low"].min()

        avg_volume_30d = hist_3m["Volume"].tail(30).mean()
        current_volume = hist_1y["Volume"].iloc[-1]
        volume_ratio = current_volume / avg_volume_30d if avg_volume_30d > 0 else 1

        return {
            "symbol": symbol.upper(),
            "company_name": info.get("longName", symbol),
            "sector": info.get("sector", "Unknown"),
            "industry": info.get("industry", "Unknown"),
            "current_price": round(float(current_price), 2),
            "prev_close": round(float(prev_close), 2),
            "price_change": round(float(price_change), 2),
            "price_change_pct": round(float(price_change_pct), 2),
            "open": round(float(info.get("open", current_price)), 2),
            "day_high": round(float(info.get("dayHigh", hist_1y["High"].iloc[-1])), 2),
            "day_low": round(float(info.get("dayLow", hist_1y["Low"].iloc[-1])), 2),
            "volume": int(current_volume),
            "avg_volume": int(avg_volume_30d),
            "volume_ratio": round(float(volume_ratio), 2),
            "market_cap": info.get("marketCap"),
            "pe_ratio": info.get("trailingPE"),
            "forward_pe": info.get("forwardPE"),
            "eps": info.get("trailingEps"),
            "dividend_yield": info.get("dividendYield"),
            "beta": info.get("beta"),
            "high_52w": round(float(high_52w), 2),
            "low_52w": round(float(low_52w), 2),
            "pct_from_52w_high": round(((current_price - high_52w) / high_52w) * 100, 2),
            "pct_from_52w_low": round(((current_price - low_52w) / low_52w) * 100, 2),
            "description": info.get("longBusinessSummary", ""),
            "website": info.get("website", ""),
            "employees": info.get("fullTimeEmployees"),
            "country": info.get("country", ""),
            "currency": info.get("currency", "USD"),
            "exchange": info.get("exchange", ""),
        }
    except Exception as e:
        return {"error": str(e)}


def get_stock_history(symbol: str, period: str = "1y", interval: str = "1d") -> dict:
    """Fetch historical price data with technical indicators."""
    try:
        ticker = yf.Ticker(symbol)
        hist = ticker.history(period=period, interval=interval)

        if hist.empty:
            return {"error": f"No historical data for {symbol}"}

        hist = hist.reset_index()
        hist.columns = [c.lower() for c in hist.columns]

        close = hist["close"]
        high = hist["high"]
        low = hist["low"]

        hist["sma_20"] = sma(close, 20)
        hist["sma_50"] = sma(close, 50)
        hist["sma_200"] = sma(close, 200)
        hist["ema_12"] = ema(close, 12)
        hist["ema_26"] = ema(close, 26)
        hist["rsi"] = rsi(close, 14)

        macd_line, signal_line, macd_hist = macd(close)
        hist["macd"] = macd_line
        hist["macd_signal"] = signal_line
        hist["macd_hist"] = macd_hist

        bb_upper, bb_mid, bb_lower = bollinger_bands(close)
        hist["bb_upper"] = bb_upper
        hist["bb_middle"] = bb_mid
        hist["bb_lower"] = bb_lower

        k, d = stochastic(high, low, close)
        hist["stoch_k"] = k
        hist["stoch_d"] = d

        hist["volume_sma_20"] = sma(hist["volume"].astype(float), 20)

        hist = hist.replace({np.nan: None})

        records = []
        for _, row in hist.iterrows():
            date_val = row["date"]
            if hasattr(date_val, "isoformat"):
                date_str = date_val.isoformat()
            else:
                date_str = str(date_val)

            def safe_float(v, decimals=4):
                return round(float(v), decimals) if v is not None else None

            records.append({
                "date": date_str,
                "open": safe_float(row["open"]),
                "high": safe_float(row["high"]),
                "low": safe_float(row["low"]),
                "close": safe_float(row["close"]),
                "volume": int(row["volume"]) if row["volume"] else 0,
                "sma_20": safe_float(row["sma_20"]),
                "sma_50": safe_float(row["sma_50"]),
                "sma_200": safe_float(row["sma_200"]),
                "ema_12": safe_float(row["ema_12"]),
                "ema_26": safe_float(row["ema_26"]),
                "rsi": safe_float(row["rsi"], 2),
                "macd": safe_float(row["macd"]),
                "macd_signal": safe_float(row["macd_signal"]),
                "macd_hist": safe_float(row["macd_hist"]),
                "bb_upper": safe_float(row["bb_upper"]),
                "bb_middle": safe_float(row["bb_middle"]),
                "bb_lower": safe_float(row["bb_lower"]),
                "stoch_k": safe_float(row["stoch_k"], 2),
                "stoch_d": safe_float(row["stoch_d"], 2),
                "volume_sma_20": int(row["volume_sma_20"]) if row["volume_sma_20"] is not None else None,
            })

        return {"symbol": symbol.upper(), "period": period, "interval": interval, "data": records}
    except Exception as e:
        return {"error": str(e)}


def get_signal_analysis(symbol: str) -> dict:
    """Generate buy/sell/hold signals based on technical analysis."""
    try:
        ticker = yf.Ticker(symbol)
        hist = ticker.history(period="6mo")

        if hist.empty or len(hist) < 50:
            return {"error": "Insufficient data for analysis"}

        close = hist["Close"]
        high = hist["High"]
        low = hist["Low"]
        volume = hist["Volume"]

        current_price = float(close.iloc[-1])

        sma_20_val = float(sma(close, 20).iloc[-1])
        sma_50_val = float(sma(close, 50).iloc[-1])
        sma_200_series = sma(close, 200)
        sma_200_val = float(sma_200_series.iloc[-1]) if not pd.isna(sma_200_series.iloc[-1]) else None

        rsi_val = float(rsi(close, 14).iloc[-1])

        macd_line, signal_line, _ = macd(close)
        macd_val = float(macd_line.iloc[-1])
        macd_signal_val = float(signal_line.iloc[-1])
        macd_prev = float(macd_line.iloc[-2])
        macd_signal_prev = float(signal_line.iloc[-2])

        bb_upper_s, _, bb_lower_s = bollinger_bands(close)
        bb_upper_val = float(bb_upper_s.iloc[-1])
        bb_lower_val = float(bb_lower_s.iloc[-1])
        bb_range = bb_upper_val - bb_lower_val
        bb_position = (current_price - bb_lower_val) / bb_range if bb_range > 0 else 0.5

        avg_volume = float(volume.tail(20).mean())
        current_volume = float(volume.iloc[-1])
        volume_surge = current_volume / avg_volume if avg_volume > 0 else 1.0

        signals = []
        score = 0

        # RSI signals
        if rsi_val < 30:
            signals.append({"indicator": "RSI", "signal": "BUY", "strength": "STRONG",
                             "detail": f"RSI={rsi_val:.1f} — Oversold (<30), potential reversal"})
            score += 25
        elif rsi_val < 40:
            signals.append({"indicator": "RSI", "signal": "BUY", "strength": "MODERATE",
                             "detail": f"RSI={rsi_val:.1f} — Approaching oversold"})
            score += 10
        elif rsi_val > 70:
            signals.append({"indicator": "RSI", "signal": "SELL", "strength": "STRONG",
                             "detail": f"RSI={rsi_val:.1f} — Overbought (>70), potential pullback"})
            score -= 25
        elif rsi_val > 60:
            signals.append({"indicator": "RSI", "signal": "SELL", "strength": "MODERATE",
                             "detail": f"RSI={rsi_val:.1f} — Approaching overbought"})
            score -= 10
        else:
            signals.append({"indicator": "RSI", "signal": "HOLD", "strength": "NEUTRAL",
                             "detail": f"RSI={rsi_val:.1f} — Neutral zone (40–60)"})

        # MACD crossover
        crossed_up = macd_prev < macd_signal_prev and macd_val > macd_signal_val
        crossed_down = macd_prev > macd_signal_prev and macd_val < macd_signal_val

        if crossed_up:
            signals.append({"indicator": "MACD", "signal": "BUY", "strength": "STRONG",
                             "detail": "MACD bullish crossover — momentum turning positive"})
            score += 20
        elif crossed_down:
            signals.append({"indicator": "MACD", "signal": "SELL", "strength": "STRONG",
                             "detail": "MACD bearish crossover — momentum turning negative"})
            score -= 20
        elif macd_val > macd_signal_val:
            signals.append({"indicator": "MACD", "signal": "BUY", "strength": "MODERATE",
                             "detail": "MACD above signal line — bullish momentum"})
            score += 10
        else:
            signals.append({"indicator": "MACD", "signal": "SELL", "strength": "MODERATE",
                             "detail": "MACD below signal line — bearish momentum"})
            score -= 10

        # Moving averages
        if current_price > sma_20_val > sma_50_val:
            signals.append({"indicator": "Moving Averages", "signal": "BUY", "strength": "STRONG",
                             "detail": f"Price > SMA20 (${sma_20_val:.2f}) > SMA50 (${sma_50_val:.2f}) — bullish alignment"})
            score += 15
        elif current_price < sma_20_val < sma_50_val:
            signals.append({"indicator": "Moving Averages", "signal": "SELL", "strength": "STRONG",
                             "detail": f"Price < SMA20 (${sma_20_val:.2f}) < SMA50 (${sma_50_val:.2f}) — bearish alignment"})
            score -= 15
        elif current_price > sma_20_val:
            signals.append({"indicator": "Moving Averages", "signal": "BUY", "strength": "MODERATE",
                             "detail": f"Price above SMA20 (${sma_20_val:.2f}) — short-term bullish"})
            score += 8

        # Golden/Death Cross
        if sma_200_val:
            if sma_50_val > sma_200_val:
                signals.append({"indicator": "Golden/Death Cross", "signal": "BUY", "strength": "STRONG",
                                 "detail": f"Golden Cross: SMA50 > SMA200 (${sma_200_val:.2f}) — long-term bullish"})
                score += 15
            else:
                signals.append({"indicator": "Golden/Death Cross", "signal": "SELL", "strength": "STRONG",
                                 "detail": f"Death Cross: SMA50 < SMA200 (${sma_200_val:.2f}) — long-term bearish"})
                score -= 15

        # Bollinger Bands
        if bb_position < 0.1:
            signals.append({"indicator": "Bollinger Bands", "signal": "BUY", "strength": "STRONG",
                             "detail": f"Price near lower band (${bb_lower_val:.2f}) — potential reversal"})
            score += 15
        elif bb_position > 0.9:
            signals.append({"indicator": "Bollinger Bands", "signal": "SELL", "strength": "STRONG",
                             "detail": f"Price near upper band (${bb_upper_val:.2f}) — potential pullback"})
            score -= 15
        else:
            signals.append({"indicator": "Bollinger Bands", "signal": "HOLD", "strength": "NEUTRAL",
                             "detail": f"Price within BB range — position: {bb_position:.0%}"})

        # Volume
        if volume_surge > 2.0:
            price_up = float(close.iloc[-1]) > float(close.iloc[-2])
            if price_up:
                signals.append({"indicator": "Volume", "signal": "BUY", "strength": "STRONG",
                                 "detail": f"Volume surge {volume_surge:.1f}x avg with price increase"})
                score += 10
            else:
                signals.append({"indicator": "Volume", "signal": "SELL", "strength": "STRONG",
                                 "detail": f"Volume surge {volume_surge:.1f}x avg with price drop"})
                score -= 10

        # Overall
        if score >= 40:
            overall, color = "STRONG BUY", "green"
        elif score >= 15:
            overall, color = "BUY", "lightgreen"
        elif score <= -40:
            overall, color = "STRONG SELL", "red"
        elif score <= -15:
            overall, color = "SELL", "orange"
        else:
            overall, color = "HOLD", "yellow"

        resistance = float(hist["High"].tail(30).max())
        support = float(hist["Low"].tail(30).min())

        return {
            "symbol": symbol.upper(),
            "current_price": round(current_price, 2),
            "overall_signal": overall,
            "signal_color": color,
            "score": score,
            "signals": signals,
            "key_levels": {
                "support": round(support, 2),
                "resistance": round(resistance, 2),
                "sma_20": round(sma_20_val, 2),
                "sma_50": round(sma_50_val, 2),
                "sma_200": round(sma_200_val, 2) if sma_200_val else None,
                "bb_upper": round(bb_upper_val, 2),
                "bb_lower": round(bb_lower_val, 2),
            },
            "indicators": {
                "rsi": round(rsi_val, 2),
                "macd": round(macd_val, 4),
                "macd_signal": round(macd_signal_val, 4),
                "volume_ratio": round(volume_surge, 2),
                "bb_position": round(bb_position, 3),
            }
        }
    except Exception as e:
        return {"error": str(e)}


def search_stocks(query: str) -> list:
    """Search for stocks by symbol or company name."""
    try:
        ticker = yf.Ticker(query)
        info = ticker.info
        if info.get("longName"):
            return [{
                "symbol": query.upper(),
                "name": info.get("longName", query),
                "exchange": info.get("exchange", ""),
                "type": info.get("quoteType", "EQUITY"),
                "sector": info.get("sector", ""),
            }]
        return []
    except Exception:
        return []
