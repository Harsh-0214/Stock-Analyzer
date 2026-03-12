import yfinance as yf
import pandas as pd
import numpy as np
from datetime import datetime
from services.indicators import (
    sma, ema, rsi, macd, bollinger_bands, stochastic,
    williams_r, cci, obv, adx, roc, atr,
)

# Common exchange suffixes to try when a bare symbol returns no data
_EXCHANGE_SUFFIXES = [".TO", ".L", ".AX", ".HK", ".DE", ".PA", ".T", ".V", ".MI"]


def _resolve_symbol(symbol: str) -> tuple[yf.Ticker, str]:
    """Return (Ticker, resolved_symbol). Tries exchange suffixes if bare symbol has no data."""
    ticker = yf.Ticker(symbol)
    hist = ticker.history(period="5d")
    if not hist.empty:
        return ticker, symbol
    # Try common exchange suffixes
    for suffix in _EXCHANGE_SUFFIXES:
        candidate = symbol + suffix
        t = yf.Ticker(candidate)
        h = t.history(period="5d")
        if not h.empty:
            return t, candidate
    return ticker, symbol  # Return original; caller will handle the empty data


def get_stock_info(symbol: str) -> dict:
    """Fetch comprehensive stock information."""
    try:
        ticker, symbol = _resolve_symbol(symbol)
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
        ticker, symbol = _resolve_symbol(symbol)
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
    """Generate buy/sell/hold signals based on 13 technical indicators with price targets."""
    try:
        ticker, symbol = _resolve_symbol(symbol)
        hist = ticker.history(period="1y")

        if hist.empty or len(hist) < 50:
            return {"error": "Insufficient data for analysis"}

        close = hist["Close"]
        high_s = hist["High"]
        low_s = hist["Low"]
        volume = hist["Volume"]

        current_price = float(close.iloc[-1])

        # ── Core indicators ──────────────────────────────────────────────────
        sma_20_val  = float(sma(close, 20).iloc[-1])
        sma_50_val  = float(sma(close, 50).iloc[-1])
        sma_200_s   = sma(close, 200)
        sma_200_val = float(sma_200_s.iloc[-1]) if not pd.isna(sma_200_s.iloc[-1]) else None

        ema_9_val   = float(ema(close, 9).iloc[-1])
        ema_21_val  = float(ema(close, 21).iloc[-1])
        ema_9_prev  = float(ema(close, 9).iloc[-2])
        ema_21_prev = float(ema(close, 21).iloc[-2])

        rsi_val = float(rsi(close, 14).iloc[-1])

        macd_line, signal_line, _ = macd(close)
        macd_val        = float(macd_line.iloc[-1])
        macd_signal_val = float(signal_line.iloc[-1])
        macd_prev       = float(macd_line.iloc[-2])
        macd_sig_prev   = float(signal_line.iloc[-2])

        bb_upper_s, _, bb_lower_s = bollinger_bands(close)
        bb_upper_val = float(bb_upper_s.iloc[-1])
        bb_lower_val = float(bb_lower_s.iloc[-1])
        bb_range     = bb_upper_val - bb_lower_val
        bb_position  = (current_price - bb_lower_val) / bb_range if bb_range > 0 else 0.5

        stoch_k_s, stoch_d_s = stochastic(high_s, low_s, close)
        stoch_k      = float(stoch_k_s.iloc[-1])
        stoch_d      = float(stoch_d_s.iloc[-1])
        stoch_k_prev = float(stoch_k_s.iloc[-2])
        stoch_d_prev = float(stoch_d_s.iloc[-2])

        wr_val  = float(williams_r(high_s, low_s, close).iloc[-1])
        cci_val = float(cci(high_s, low_s, close).iloc[-1])

        obv_s      = obv(close, volume)
        obv_val    = float(obv_s.iloc[-1])
        obv_sma    = float(obv_s.tail(20).mean())

        adx_val_s, plus_di_s, minus_di_s = adx(high_s, low_s, close)
        adx_val   = float(adx_val_s.iloc[-1])
        plus_di   = float(plus_di_s.iloc[-1])
        minus_di  = float(minus_di_s.iloc[-1])

        roc_val = float(roc(close, 10).iloc[-1])

        atr_val = float(atr(high_s, low_s, close).iloc[-1])

        avg_volume    = float(volume.tail(20).mean())
        current_vol   = float(volume.iloc[-1])
        volume_surge  = current_vol / avg_volume if avg_volume > 0 else 1.0

        # ── Support / Resistance (multi-level) ──────────────────────────────
        # Use pivot points and recent swing highs/lows
        resistance_30  = float(high_s.tail(30).max())
        resistance_60  = float(high_s.tail(60).max())
        support_30     = float(low_s.tail(30).min())
        support_60     = float(low_s.tail(60).min())

        # Best support = highest low below current price
        support = max(support_30, support_60) if support_30 < current_price else support_30
        # Best resistance = lowest high above current price
        resistance_candidates = [v for v in [resistance_30, resistance_60] if v > current_price]
        resistance = min(resistance_candidates) if resistance_candidates else resistance_30

        # ── Signal scoring ───────────────────────────────────────────────────
        signals = []
        score = 0

        # 1. RSI
        if rsi_val < 30:
            signals.append({"indicator": "RSI", "signal": "BUY", "strength": "STRONG",
                             "detail": f"RSI {rsi_val:.1f} — Oversold (<30), high reversal probability"})
            score += 15
        elif rsi_val < 40:
            signals.append({"indicator": "RSI", "signal": "BUY", "strength": "MODERATE",
                             "detail": f"RSI {rsi_val:.1f} — Nearing oversold, watch for bounce"})
            score += 8
        elif rsi_val > 70:
            signals.append({"indicator": "RSI", "signal": "SELL", "strength": "STRONG",
                             "detail": f"RSI {rsi_val:.1f} — Overbought (>70), pullback likely"})
            score -= 15
        elif rsi_val > 60:
            signals.append({"indicator": "RSI", "signal": "SELL", "strength": "MODERATE",
                             "detail": f"RSI {rsi_val:.1f} — Approaching overbought territory"})
            score -= 8
        else:
            signals.append({"indicator": "RSI", "signal": "HOLD", "strength": "NEUTRAL",
                             "detail": f"RSI {rsi_val:.1f} — Neutral zone (40–60)"})

        # 2. MACD crossover
        crossed_up   = macd_prev < macd_sig_prev and macd_val > macd_signal_val
        crossed_down = macd_prev > macd_sig_prev and macd_val < macd_signal_val
        if crossed_up:
            signals.append({"indicator": "MACD", "signal": "BUY", "strength": "STRONG",
                             "detail": "Bullish crossover — MACD crossed above signal line"})
            score += 12
        elif crossed_down:
            signals.append({"indicator": "MACD", "signal": "SELL", "strength": "STRONG",
                             "detail": "Bearish crossover — MACD crossed below signal line"})
            score -= 12
        elif macd_val > macd_signal_val:
            signals.append({"indicator": "MACD", "signal": "BUY", "strength": "MODERATE",
                             "detail": "MACD above signal line — sustained bullish momentum"})
            score += 6
        else:
            signals.append({"indicator": "MACD", "signal": "SELL", "strength": "MODERATE",
                             "detail": "MACD below signal line — sustained bearish momentum"})
            score -= 6

        # 3. Moving Average alignment
        if current_price > sma_20_val > sma_50_val:
            signals.append({"indicator": "Moving Averages", "signal": "BUY", "strength": "STRONG",
                             "detail": f"Price > SMA20 (${sma_20_val:.2f}) > SMA50 (${sma_50_val:.2f}) — full bullish stack"})
            score += 10
        elif current_price < sma_20_val < sma_50_val:
            signals.append({"indicator": "Moving Averages", "signal": "SELL", "strength": "STRONG",
                             "detail": f"Price < SMA20 (${sma_20_val:.2f}) < SMA50 (${sma_50_val:.2f}) — full bearish stack"})
            score -= 10
        elif current_price > sma_20_val:
            signals.append({"indicator": "Moving Averages", "signal": "BUY", "strength": "MODERATE",
                             "detail": f"Price above SMA20 (${sma_20_val:.2f}) — short-term bullish"})
            score += 5
        else:
            signals.append({"indicator": "Moving Averages", "signal": "SELL", "strength": "MODERATE",
                             "detail": f"Price below SMA20 (${sma_20_val:.2f}) — short-term bearish"})
            score -= 5

        # 4. Golden/Death Cross (SMA50 vs SMA200)
        if sma_200_val:
            if sma_50_val > sma_200_val:
                signals.append({"indicator": "Golden / Death Cross", "signal": "BUY", "strength": "STRONG",
                                 "detail": f"Golden Cross: SMA50 > SMA200 (${sma_200_val:.2f}) — long-term bull trend"})
                score += 10
            else:
                signals.append({"indicator": "Golden / Death Cross", "signal": "SELL", "strength": "STRONG",
                                 "detail": f"Death Cross: SMA50 < SMA200 (${sma_200_val:.2f}) — long-term bear trend"})
                score -= 10

        # 5. EMA 9/21 crossover (faster signal)
        ema_crossed_up   = ema_9_prev < ema_21_prev and ema_9_val > ema_21_val
        ema_crossed_down = ema_9_prev > ema_21_prev and ema_9_val < ema_21_val
        if ema_crossed_up:
            signals.append({"indicator": "EMA Cross (9/21)", "signal": "BUY", "strength": "STRONG",
                             "detail": f"EMA9 (${ema_9_val:.2f}) crossed above EMA21 — early bullish signal"})
            score += 8
        elif ema_crossed_down:
            signals.append({"indicator": "EMA Cross (9/21)", "signal": "SELL", "strength": "STRONG",
                             "detail": f"EMA9 (${ema_9_val:.2f}) crossed below EMA21 — early bearish signal"})
            score -= 8
        elif ema_9_val > ema_21_val:
            signals.append({"indicator": "EMA Cross (9/21)", "signal": "BUY", "strength": "MODERATE",
                             "detail": f"EMA9 (${ema_9_val:.2f}) above EMA21 (${ema_21_val:.2f}) — bullish momentum"})
            score += 4
        else:
            signals.append({"indicator": "EMA Cross (9/21)", "signal": "SELL", "strength": "MODERATE",
                             "detail": f"EMA9 (${ema_9_val:.2f}) below EMA21 (${ema_21_val:.2f}) — bearish momentum"})
            score -= 4

        # 6. Bollinger Bands
        if bb_position < 0.1:
            signals.append({"indicator": "Bollinger Bands", "signal": "BUY", "strength": "STRONG",
                             "detail": f"Price near lower band (${bb_lower_val:.2f}) — oversold, mean-reversion likely"})
            score += 8
        elif bb_position > 0.9:
            signals.append({"indicator": "Bollinger Bands", "signal": "SELL", "strength": "STRONG",
                             "detail": f"Price near upper band (${bb_upper_val:.2f}) — overbought, pullback likely"})
            score -= 8
        else:
            signals.append({"indicator": "Bollinger Bands", "signal": "HOLD", "strength": "NEUTRAL",
                             "detail": f"Price at {bb_position:.0%} of BB range — no edge signal"})

        # 7. Stochastic oscillator
        stoch_crossed_up   = stoch_k_prev < stoch_d_prev and stoch_k > stoch_d
        stoch_crossed_down = stoch_k_prev > stoch_d_prev and stoch_k < stoch_d
        if stoch_k < 20 and stoch_crossed_up:
            signals.append({"indicator": "Stochastic", "signal": "BUY", "strength": "STRONG",
                             "detail": f"%K ({stoch_k:.1f}) crossed above %D in oversold zone — strong reversal"})
            score += 10
        elif stoch_k > 80 and stoch_crossed_down:
            signals.append({"indicator": "Stochastic", "signal": "SELL", "strength": "STRONG",
                             "detail": f"%K ({stoch_k:.1f}) crossed below %D in overbought zone — strong reversal"})
            score -= 10
        elif stoch_k < 20:
            signals.append({"indicator": "Stochastic", "signal": "BUY", "strength": "MODERATE",
                             "detail": f"%K ({stoch_k:.1f}) oversold (<20) — potential bounce building"})
            score += 5
        elif stoch_k > 80:
            signals.append({"indicator": "Stochastic", "signal": "SELL", "strength": "MODERATE",
                             "detail": f"%K ({stoch_k:.1f}) overbought (>80) — potential top forming"})
            score -= 5
        else:
            signals.append({"indicator": "Stochastic", "signal": "HOLD", "strength": "NEUTRAL",
                             "detail": f"%K ({stoch_k:.1f}) neutral — no edge signal"})

        # 8. Williams %R
        if wr_val < -80:
            signals.append({"indicator": "Williams %R", "signal": "BUY", "strength": "STRONG",
                             "detail": f"W%R {wr_val:.1f} — Deeply oversold (<-80), reversal likely"})
            score += 8
        elif wr_val < -60:
            signals.append({"indicator": "Williams %R", "signal": "BUY", "strength": "MODERATE",
                             "detail": f"W%R {wr_val:.1f} — Oversold zone, watch for entry"})
            score += 4
        elif wr_val > -20:
            signals.append({"indicator": "Williams %R", "signal": "SELL", "strength": "STRONG",
                             "detail": f"W%R {wr_val:.1f} — Deeply overbought (>-20), pullback likely"})
            score -= 8
        elif wr_val > -40:
            signals.append({"indicator": "Williams %R", "signal": "SELL", "strength": "MODERATE",
                             "detail": f"W%R {wr_val:.1f} — Overbought zone, consider taking profits"})
            score -= 4
        else:
            signals.append({"indicator": "Williams %R", "signal": "HOLD", "strength": "NEUTRAL",
                             "detail": f"W%R {wr_val:.1f} — Neutral zone"})

        # 9. CCI
        if cci_val < -100:
            signals.append({"indicator": "CCI", "signal": "BUY", "strength": "STRONG",
                             "detail": f"CCI {cci_val:.1f} — Oversold (<-100), potential trend reversal"})
            score += 8
        elif cci_val < -50:
            signals.append({"indicator": "CCI", "signal": "BUY", "strength": "MODERATE",
                             "detail": f"CCI {cci_val:.1f} — Below zero, building bullish case"})
            score += 4
        elif cci_val > 100:
            signals.append({"indicator": "CCI", "signal": "SELL", "strength": "STRONG",
                             "detail": f"CCI {cci_val:.1f} — Overbought (>100), profit-taking zone"})
            score -= 8
        elif cci_val > 50:
            signals.append({"indicator": "CCI", "signal": "SELL", "strength": "MODERATE",
                             "detail": f"CCI {cci_val:.1f} — Elevated, risk of pullback"})
            score -= 4
        else:
            signals.append({"indicator": "CCI", "signal": "HOLD", "strength": "NEUTRAL",
                             "detail": f"CCI {cci_val:.1f} — Neutral zone (-50 to +50)"})

        # 10. OBV trend (volume confirms price)
        if obv_val > obv_sma * 1.02:
            signals.append({"indicator": "OBV (Volume Flow)", "signal": "BUY", "strength": "MODERATE",
                             "detail": "OBV rising above its average — institutional accumulation detected"})
            score += 6
        elif obv_val < obv_sma * 0.98:
            signals.append({"indicator": "OBV (Volume Flow)", "signal": "SELL", "strength": "MODERATE",
                             "detail": "OBV below average — distribution phase, smart money exiting"})
            score -= 6

        # 11. ADX + Directional Indicators
        if adx_val > 25:
            if plus_di > minus_di:
                strength_label = "STRONG" if adx_val > 40 else "MODERATE"
                signals.append({"indicator": "ADX / Trend Strength", "signal": "BUY", "strength": strength_label,
                                 "detail": f"ADX {adx_val:.1f} — Strong uptrend (DI+ {plus_di:.1f} > DI- {minus_di:.1f})"})
                score += 8 if adx_val > 40 else 5
            else:
                strength_label = "STRONG" if adx_val > 40 else "MODERATE"
                signals.append({"indicator": "ADX / Trend Strength", "signal": "SELL", "strength": strength_label,
                                 "detail": f"ADX {adx_val:.1f} — Strong downtrend (DI- {minus_di:.1f} > DI+ {plus_di:.1f})"})
                score -= 8 if adx_val > 40 else 5
        else:
            signals.append({"indicator": "ADX / Trend Strength", "signal": "HOLD", "strength": "NEUTRAL",
                             "detail": f"ADX {adx_val:.1f} — Weak/ranging market (<25), avoid trend trades"})

        # 12. ROC (momentum)
        if roc_val > 5:
            signals.append({"indicator": "Momentum (ROC)", "signal": "BUY", "strength": "MODERATE",
                             "detail": f"ROC +{roc_val:.1f}% over 10 days — strong positive momentum"})
            score += 5
        elif roc_val < -5:
            signals.append({"indicator": "Momentum (ROC)", "signal": "SELL", "strength": "MODERATE",
                             "detail": f"ROC {roc_val:.1f}% over 10 days — strong negative momentum"})
            score -= 5

        # 13. Volume surge confirmation
        if volume_surge > 2.0:
            price_up = float(close.iloc[-1]) > float(close.iloc[-2])
            if price_up:
                signals.append({"indicator": "Volume Surge", "signal": "BUY", "strength": "STRONG",
                                 "detail": f"Volume {volume_surge:.1f}x avg on up-day — high-conviction buying"})
                score += 6
            else:
                signals.append({"indicator": "Volume Surge", "signal": "SELL", "strength": "STRONG",
                                 "detail": f"Volume {volume_surge:.1f}x avg on down-day — high-conviction selling"})
                score -= 6

        # ── Overall signal ────────────────────────────────────────────────────
        if score >= 50:
            overall, color = "STRONG BUY", "green"
        elif score >= 20:
            overall, color = "BUY", "lightgreen"
        elif score <= -50:
            overall, color = "STRONG SELL", "red"
        elif score <= -20:
            overall, color = "SELL", "orange"
        else:
            overall, color = "HOLD", "yellow"

        # ── Price targets (ATR-based risk/reward) ─────────────────────────────
        atr_mult_stop   = 1.5
        atr_mult_t1     = 2.0
        atr_mult_t2     = 3.5

        if overall in ("STRONG BUY", "BUY"):
            # Enter near current price or at pullback to support
            buy_zone_low  = round(max(support, current_price - atr_val), 2)
            buy_zone_high = round(current_price, 2)
            stop_loss     = round(max(buy_zone_low - atr_mult_stop * atr_val, buy_zone_low * 0.95), 2)
            risk          = buy_zone_high - stop_loss
            target_1      = round(buy_zone_high + atr_mult_t1 * atr_val, 2)
            target_2      = round(buy_zone_high + atr_mult_t2 * atr_val, 2)
            # Cap targets at resistance as first natural ceiling
            target_1      = min(target_1, resistance) if target_1 > resistance else target_1
            rr            = round((target_2 - buy_zone_high) / risk, 1) if risk > 0 else None
            price_targets = {
                "action":         "BUY",
                "buy_zone_low":   buy_zone_low,
                "buy_zone_high":  buy_zone_high,
                "stop_loss":      stop_loss,
                "target_1":       target_1,
                "target_2":       target_2,
                "risk_reward":    f"1:{rr}" if rr else "N/A",
                "basis":          f"ATR-based stop {atr_mult_stop}× below entry; T1={atr_mult_t1}×, T2={atr_mult_t2}× ATR above",
            }
        elif overall in ("STRONG SELL", "SELL"):
            # Sell near current price; stop above resistance
            sell_price    = round(current_price, 2)
            stop_loss     = round(min(resistance + atr_mult_stop * atr_val, sell_price * 1.05), 2)
            risk          = stop_loss - sell_price
            target_1      = round(sell_price - atr_mult_t1 * atr_val, 2)
            target_2      = round(sell_price - atr_mult_t2 * atr_val, 2)
            target_1      = max(target_1, support) if target_1 < support else target_1
            rr            = round((sell_price - target_2) / risk, 1) if risk > 0 else None
            price_targets = {
                "action":         "SELL",
                "sell_price":     sell_price,
                "stop_loss":      stop_loss,
                "target_1":       target_1,
                "target_2":       target_2,
                "risk_reward":    f"1:{rr}" if rr else "N/A",
                "basis":          f"ATR-based stop {atr_mult_stop}× above entry; T1={atr_mult_t1}×, T2={atr_mult_t2}× ATR below",
            }
        else:
            price_targets = {
                "action":        "HOLD",
                "watch_buy_at":  round(support, 2),
                "watch_sell_at": round(resistance, 2),
                "basis":         "No clear edge — wait for price to reach support/resistance or signal to change",
            }

        return {
            "symbol": symbol.upper(),
            "current_price": round(current_price, 2),
            "overall_signal": overall,
            "signal_color": color,
            "score": score,
            "signals": signals,
            "price_targets": price_targets,
            "key_levels": {
                "support":    round(support, 2),
                "resistance": round(resistance, 2),
                "sma_20":     round(sma_20_val, 2),
                "sma_50":     round(sma_50_val, 2),
                "sma_200":    round(sma_200_val, 2) if sma_200_val else None,
                "bb_upper":   round(bb_upper_val, 2),
                "bb_lower":   round(bb_lower_val, 2),
                "atr":        round(atr_val, 2),
            },
            "indicators": {
                "rsi":          round(rsi_val, 2),
                "macd":         round(macd_val, 4),
                "macd_signal":  round(macd_signal_val, 4),
                "stoch_k":      round(stoch_k, 2),
                "stoch_d":      round(stoch_d, 2),
                "williams_r":   round(wr_val, 2),
                "cci":          round(cci_val, 2),
                "adx":          round(adx_val, 2),
                "roc":          round(roc_val, 2),
                "volume_ratio": round(volume_surge, 2),
                "bb_position":  round(bb_position, 3),
            },
        }
    except Exception as e:
        return {"error": str(e)}


def _classify_news_impact(title: str, summary: str = "") -> dict:
    """Classify news sentiment and what it impacts on the stock."""
    text = (title + " " + summary).lower()

    # Sentiment scoring based on keyword groups
    bullish_keywords = [
        "beat", "beats", "record", "record high", "surge", "surges", "soar", "rally",
        "upgrade", "upgraded", "buy rating", "outperform", "raise", "raised", "boost",
        "profit", "earnings growth", "revenue growth", "expansion", "partnership",
        "acquisition", "deal", "contract", "approved", "approval", "launches", "launch",
        "innovative", "breakthrough", "dividend", "buyback", "share buyback", "strong",
        "positive", "optimistic", "exceeds", "exceed", "top estimates", "above expectations",
    ]
    bearish_keywords = [
        "miss", "misses", "disappoints", "disappoint", "drop", "drops", "fall", "falls",
        "decline", "plunge", "plunges", "downgrade", "downgraded", "underperform",
        "cut", "cuts", "lower", "lowered", "loss", "losses", "lawsuit", "investigation",
        "probe", "recall", "layoffs", "layoff", "restructuring", "missed", "below",
        "disappointing", "warning", "negative", "risk", "concern", "uncertainty",
        "weak", "struggles", "struggle", "deficit", "penalty", "fine", "fraud",
    ]

    bull_score = sum(1 for kw in bullish_keywords if kw in text)
    bear_score = sum(1 for kw in bearish_keywords if kw in text)

    if bull_score > bear_score:
        sentiment = "Bullish"
        sentiment_color = "green"
    elif bear_score > bull_score:
        sentiment = "Bearish"
        sentiment_color = "red"
    else:
        sentiment = "Neutral"
        sentiment_color = "gray"

    # Determine impact area
    impact_area = "General"
    if any(kw in text for kw in ["earnings", "profit", "revenue", "eps", "quarter", "annual", "guidance"]):
        impact_area = "Earnings & Revenue"
    elif any(kw in text for kw in ["fda", "approval", "approved", "drug", "trial", "clinical", "therapy"]):
        impact_area = "Regulatory & Product"
    elif any(kw in text for kw in ["ceo", "cfo", "executive", "management", "board", "director", "appoint"]):
        impact_area = "Leadership"
    elif any(kw in text for kw in ["merger", "acquisition", "buyout", "takeover", "deal", "partnership"]):
        impact_area = "M&A / Deals"
    elif any(kw in text for kw in ["lawsuit", "settlement", "investigation", "probe", "fine", "penalty", "fraud"]):
        impact_area = "Legal & Regulatory"
    elif any(kw in text for kw in ["dividend", "buyback", "split", "share repurchase"]):
        impact_area = "Shareholder Returns"
    elif any(kw in text for kw in ["upgrade", "downgrade", "price target", "analyst", "rating", "outperform"]):
        impact_area = "Analyst Opinion"
    elif any(kw in text for kw in ["product", "launch", "release", "innovation", "technology"]):
        impact_area = "Product & Innovation"
    elif any(kw in text for kw in ["economy", "inflation", "fed", "interest rate", "market", "sector", "industry"]):
        impact_area = "Macro / Market"

    # Build an impact explanation
    impact_map = {
        "Earnings & Revenue": {
            "Bullish": "May drive price higher — strong earnings signal improved profitability.",
            "Bearish": "May pressure price — weak earnings raise doubts about future growth.",
            "Neutral": "Earnings-related; watch for guidance updates.",
        },
        "Regulatory & Product": {
            "Bullish": "Positive regulatory or product news can unlock new revenue streams.",
            "Bearish": "Regulatory setbacks can delay revenue and increase costs.",
            "Neutral": "Regulatory development; outcome uncertain for stock price.",
        },
        "Leadership": {
            "Bullish": "Strong leadership changes can boost investor confidence.",
            "Bearish": "Management uncertainty may increase volatility short-term.",
            "Neutral": "Leadership change; market awaits strategic direction.",
        },
        "M&A / Deals": {
            "Bullish": "Deal activity often signals growth ambitions and can boost valuation.",
            "Bearish": "M&A concerns can weigh on shares if integration risks are high.",
            "Neutral": "Deal in progress; final terms will determine impact.",
        },
        "Legal & Regulatory": {
            "Bullish": "Favorable resolution removes overhang and reduces risk premium.",
            "Bearish": "Legal exposure adds uncertainty and potential financial liability.",
            "Neutral": "Legal proceedings ongoing; outcome remains to be seen.",
        },
        "Shareholder Returns": {
            "Bullish": "Dividends or buybacks signal financial confidence and reward investors.",
            "Bearish": "Cuts to shareholder returns may signal cash flow pressure.",
            "Neutral": "Capital allocation update; details matter for valuation.",
        },
        "Analyst Opinion": {
            "Bullish": "Upgrades or higher price targets can attract institutional interest.",
            "Bearish": "Downgrades or cuts to targets may trigger institutional selling.",
            "Neutral": "Analyst view updated; overall consensus matters more than one opinion.",
        },
        "Product & Innovation": {
            "Bullish": "New products can expand addressable market and boost future revenue.",
            "Bearish": "Product issues or delays can dent growth expectations.",
            "Neutral": "Product news; commercial success will determine price impact.",
        },
        "Macro / Market": {
            "Bullish": "Favorable macro tailwinds can lift the broader sector and this stock.",
            "Bearish": "Macro headwinds may compress valuations across the sector.",
            "Neutral": "Macro factor; impact depends on company's sensitivity to the trend.",
        },
        "General": {
            "Bullish": "Positive news may increase buying interest in the near term.",
            "Bearish": "Negative news may trigger selling pressure short-term.",
            "Neutral": "Mixed signals; monitor for follow-through in price action.",
        },
    }

    impact_explanation = impact_map.get(impact_area, impact_map["General"]).get(sentiment, "")

    return {
        "sentiment": sentiment,
        "sentiment_color": sentiment_color,
        "impact_area": impact_area,
        "impact_explanation": impact_explanation,
    }


def get_stock_news(symbol: str, limit: int = 8) -> dict:
    """Fetch recent news for a stock with sentiment and impact analysis."""
    try:
        ticker, symbol = _resolve_symbol(symbol)
        raw_news = ticker.news or []

        articles = []
        for item in raw_news[:limit]:
            content = item.get("content", {})
            title = content.get("title") or item.get("title", "")
            summary = content.get("summary") or item.get("summary", "")
            provider = (
                content.get("provider", {}).get("displayName")
                or item.get("publisher", "")
            )
            pub_date = content.get("pubDate") or item.get("providerPublishTime")

            # Build canonical URL
            canonical = content.get("canonicalUrl", {})
            if isinstance(canonical, dict):
                url = canonical.get("url", "")
            else:
                url = item.get("link", "")

            if not title:
                continue

            # Format timestamp
            if isinstance(pub_date, (int, float)):
                from datetime import timezone
                pub_str = datetime.fromtimestamp(pub_date, tz=timezone.utc).strftime("%b %d, %Y")
            elif isinstance(pub_date, str):
                pub_str = pub_date[:10]
            else:
                pub_str = ""

            impact = _classify_news_impact(title, summary)

            articles.append({
                "title": title,
                "summary": summary[:300] if summary else "",
                "publisher": provider,
                "published_at": pub_str,
                "url": url,
                **impact,
            })

        return {"symbol": symbol.upper(), "news": articles}
    except Exception as e:
        return {"error": str(e)}


def search_stocks(query: str) -> list:
    """Search for stocks/ETFs by symbol or name across all exchanges."""
    try:
        results = yf.Search(query, max_results=8, news_count=0, lists_count=0, raise_errors=False).quotes
        out = []
        for q in results:
            symbol = q.get("symbol") or q.get("Symbol")
            name   = q.get("longname") or q.get("shortname") or symbol
            if not symbol:
                continue
            out.append({
                "symbol":   symbol,
                "name":     name,
                "exchange": q.get("exchange", ""),
                "type":     q.get("quoteType", "EQUITY"),
                "sector":   q.get("sector", ""),
            })
        return out
    except Exception:
        return []
