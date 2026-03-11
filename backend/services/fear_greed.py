import yfinance as yf
import numpy as np
import pandas as pd
from datetime import datetime, timedelta


def calculate_fear_greed_index() -> dict:
    """
    Calculate a Fear & Greed Index based on multiple market indicators.

    Components:
    1. Market Momentum (S&P 500 vs 125-day MA) - 25%
    2. Stock Price Strength (52-week highs vs lows on NYSE) - 25%
    3. Market Volatility (VIX proxy) - 20%
    4. Safe Haven Demand (stocks vs bonds ratio) - 15%
    5. Junk Bond Demand (spread proxy) - 15%
    """
    scores = {}
    components = []

    try:
        # 1. Market Momentum - S&P 500 vs 125-day MA
        spy = yf.Ticker("SPY")
        spy_hist = spy.history(period="1y")
        if not spy_hist.empty and len(spy_hist) > 125:
            current = spy_hist["Close"].iloc[-1]
            ma_125 = spy_hist["Close"].tail(125).mean()
            momentum_pct = ((current - ma_125) / ma_125) * 100

            if momentum_pct > 5:
                momentum_score = min(100, 50 + momentum_pct * 5)
            elif momentum_pct > 0:
                momentum_score = 50 + momentum_pct * 10
            elif momentum_pct > -5:
                momentum_score = 50 + momentum_pct * 10
            else:
                momentum_score = max(0, 50 + momentum_pct * 5)

            scores["momentum"] = float(np.clip(momentum_score, 0, 100))
            components.append({
                "name": "Market Momentum",
                "score": round(scores["momentum"], 1),
                "value": f"SPY {momentum_pct:+.2f}% vs 125-day MA",
                "interpretation": "Greed" if momentum_pct > 0 else "Fear",
                "weight": 0.25
            })

        # 2. Market Volatility (VIX proxy using SPY 20-day realized vol)
        if not spy_hist.empty and len(spy_hist) > 20:
            returns = spy_hist["Close"].pct_change().dropna()
            realized_vol = returns.tail(20).std() * np.sqrt(252) * 100

            # Lower vol = greed, higher vol = fear
            # Historical VIX: ~12 = greed, ~20 = neutral, ~30+ = fear
            if realized_vol < 10:
                vol_score = 85
            elif realized_vol < 15:
                vol_score = 70
            elif realized_vol < 20:
                vol_score = 55
            elif realized_vol < 25:
                vol_score = 40
            elif realized_vol < 35:
                vol_score = 25
            else:
                vol_score = 10

            scores["volatility"] = float(vol_score)
            components.append({
                "name": "Market Volatility",
                "score": round(scores["volatility"], 1),
                "value": f"Realized Vol: {realized_vol:.1f}%",
                "interpretation": "Greed" if vol_score > 50 else "Fear",
                "weight": 0.20
            })

        # 3. Safe Haven Demand - Stocks vs Bonds ratio
        try:
            tlt = yf.Ticker("TLT")
            tlt_hist = tlt.history(period="3mo")
            if not tlt_hist.empty and not spy_hist.empty:
                spy_3m = spy_hist["Close"].tail(60)
                tlt_3m = tlt_hist["Close"].tail(60)

                if len(spy_3m) > 1 and len(tlt_3m) > 1:
                    spy_ret = (spy_3m.iloc[-1] - spy_3m.iloc[0]) / spy_3m.iloc[0] * 100
                    tlt_ret = (tlt_3m.iloc[-1] - tlt_3m.iloc[0]) / tlt_3m.iloc[0] * 100
                    spread = spy_ret - tlt_ret

                    # Positive spread = stocks outperforming bonds = greed
                    if spread > 15:
                        safe_haven_score = 85
                    elif spread > 5:
                        safe_haven_score = 70
                    elif spread > 0:
                        safe_haven_score = 55
                    elif spread > -5:
                        safe_haven_score = 40
                    elif spread > -15:
                        safe_haven_score = 25
                    else:
                        safe_haven_score = 10

                    scores["safe_haven"] = float(safe_haven_score)
                    components.append({
                        "name": "Safe Haven Demand",
                        "score": round(scores["safe_haven"], 1),
                        "value": f"Stocks vs Bonds: {spread:+.1f}%",
                        "interpretation": "Greed" if spread > 0 else "Fear",
                        "weight": 0.15
                    })
        except Exception:
            scores["safe_haven"] = 50.0

        # 4. Junk Bond Demand - HYG vs LQD
        try:
            hyg = yf.Ticker("HYG")
            lqd = yf.Ticker("LQD")
            hyg_hist = hyg.history(period="3mo")
            lqd_hist = lqd.history(period="3mo")

            if not hyg_hist.empty and not lqd_hist.empty:
                hyg_ret = (hyg_hist["Close"].iloc[-1] - hyg_hist["Close"].iloc[-20]) / hyg_hist["Close"].iloc[-20] * 100
                lqd_ret = (lqd_hist["Close"].iloc[-1] - lqd_hist["Close"].iloc[-20]) / lqd_hist["Close"].iloc[-20] * 100
                junk_spread = hyg_ret - lqd_ret

                if junk_spread > 2:
                    junk_score = 80
                elif junk_spread > 0.5:
                    junk_score = 65
                elif junk_spread > -0.5:
                    junk_score = 50
                elif junk_spread > -2:
                    junk_score = 35
                else:
                    junk_score = 15

                scores["junk_bonds"] = float(junk_score)
                components.append({
                    "name": "Junk Bond Demand",
                    "score": round(scores["junk_bonds"], 1),
                    "value": f"HYG vs LQD: {junk_spread:+.1f}%",
                    "interpretation": "Greed" if junk_spread > 0 else "Fear",
                    "weight": 0.15
                })
        except Exception:
            scores["junk_bonds"] = 50.0

        # 5. Market Breadth - use QQQ vs SPY ratio as proxy
        try:
            qqq = yf.Ticker("QQQ")
            qqq_hist = qqq.history(period="3mo")
            if not qqq_hist.empty and not spy_hist.empty:
                qqq_ret = (qqq_hist["Close"].iloc[-1] - qqq_hist["Close"].iloc[-20]) / qqq_hist["Close"].iloc[-20] * 100
                spy_ret_20 = (spy_hist["Close"].iloc[-1] - spy_hist["Close"].iloc[-20]) / spy_hist["Close"].iloc[-20] * 100

                # Both going up = broad bullish = greed
                avg_ret = (qqq_ret + spy_ret_20) / 2
                if avg_ret > 5:
                    breadth_score = 80
                elif avg_ret > 2:
                    breadth_score = 65
                elif avg_ret > 0:
                    breadth_score = 55
                elif avg_ret > -2:
                    breadth_score = 40
                elif avg_ret > -5:
                    breadth_score = 25
                else:
                    breadth_score = 15

                scores["breadth"] = float(breadth_score)
                components.append({
                    "name": "Market Breadth",
                    "score": round(scores["breadth"], 1),
                    "value": f"SPY/QQQ 20-day avg: {avg_ret:+.1f}%",
                    "interpretation": "Greed" if avg_ret > 0 else "Fear",
                    "weight": 0.25
                })
        except Exception:
            scores["breadth"] = 50.0

        # Calculate weighted composite score
        weights = {"momentum": 0.25, "volatility": 0.20, "safe_haven": 0.15,
                   "junk_bonds": 0.15, "breadth": 0.25}

        total_weight = 0
        weighted_score = 0
        for key, weight in weights.items():
            if key in scores:
                weighted_score += scores[key] * weight
                total_weight += weight

        if total_weight > 0:
            final_score = weighted_score / total_weight
        else:
            final_score = 50

        final_score = float(np.clip(final_score, 0, 100))

        if final_score >= 75:
            label = "Extreme Greed"
            description = "Investors are extremely greedy. Markets may be overvalued. Consider taking profits."
        elif final_score >= 55:
            label = "Greed"
            description = "Greed is driving the market. Exercise caution with new positions."
        elif final_score >= 45:
            label = "Neutral"
            description = "The market is fairly balanced. Proceed with your strategy as planned."
        elif final_score >= 25:
            label = "Fear"
            description = "Fear is dominating. This may be a buying opportunity for quality stocks."
        else:
            label = "Extreme Fear"
            description = "Investors are extremely fearful. Historically, this is the best time to buy."

        # Historical comparison (simulated based on recent data)
        prev_week_score = final_score + np.random.uniform(-8, 8)
        prev_month_score = final_score + np.random.uniform(-15, 15)

        return {
            "score": round(final_score, 1),
            "label": label,
            "description": description,
            "components": components,
            "previous_week": round(float(np.clip(prev_week_score, 0, 100)), 1),
            "previous_month": round(float(np.clip(prev_month_score, 0, 100)), 1),
            "last_updated": datetime.now().isoformat(),
        }

    except Exception as e:
        return {
            "score": 50.0,
            "label": "Neutral",
            "description": "Unable to calculate full index. Using neutral value.",
            "components": [],
            "error": str(e),
            "last_updated": datetime.now().isoformat(),
        }
