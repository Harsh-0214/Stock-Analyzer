# StockIQ — Smart Market Analysis Platform

A full-stack stock analyzer with real-time buy/sell signals, Fear & Greed Index, trending stocks, watchlist management, and built-in market education. **No API keys required** — uses free Yahoo Finance data via yfinance.

## Features

- **📈 Live Stock Data** — Real-time prices, volume, and fundamentals for any stock
- **🎯 Buy/Sell Signals** — Technical analysis signals (RSI, MACD, Bollinger Bands, Moving Averages, Volume)
- **😱 Fear & Greed Index** — Multi-component sentiment gauge updated in real-time
- **🚀 Trending Stocks** — Momentum scanner across 80+ stocks with multiple filters
- **📋 Watchlist** — Track stocks with buy price, target price, P&L tracking, and notes
- **📊 Interactive Charts** — Candlestick-style charts with overlayable technical indicators
- **📚 Education Center** — 6 comprehensive lessons from basics to advanced options

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend | Python FastAPI + yfinance |
| Data | Yahoo Finance (free, no API key) |
| Database | SQLite (via SQLAlchemy) |
| Frontend | React + Tailwind CSS (CDN) |
| Charts | Recharts |
| Icons | Lucide React |

## Local Development

### Prerequisites
- Python 3.11+
- Node.js 18+

### Backend Setup

```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

API runs at `http://localhost:8000`
Swagger docs at `http://localhost:8000/docs`

### Frontend Setup

```bash
cd frontend
npm install
npm start
```

App runs at `http://localhost:3000` (proxies API calls to backend automatically)

---

## Deploying to Vercel

### Step 1: Deploy the Backend

1. Go to [vercel.com](https://vercel.com) and sign in
2. Click **"Add New Project"**
3. Import this GitHub repo
4. Set the **Root Directory** to `backend`
5. Set the **Build Command** to: `pip install -r requirements.txt`
6. Set the **Output Directory** to leave blank
7. Add this **Environment Variable**:
   ```
   ALLOWED_ORIGINS = https://your-frontend.vercel.app
   ```
8. Deploy — note the URL (e.g. `https://stockiq-backend.vercel.app`)

> **Note**: For the backend on Vercel, you may need to use a Python serverless hosting like Railway or Render instead, as Vercel's Python support has limitations with long-running processes. See the Railway instructions below.

### Step 2: Deploy the Frontend

1. Go to [vercel.com](https://vercel.com), click **"Add New Project"**
2. Import the same GitHub repo
3. Set the **Root Directory** to `frontend`
4. Add this **Environment Variable**:
   ```
   REACT_APP_API_URL = https://your-backend-url.vercel.app
   ```
5. Click **Deploy** — your frontend is live!

---

## Recommended: Backend on Railway (Easier)

1. Go to [railway.app](https://railway.app) and sign in with GitHub
2. Click **"New Project" → "Deploy from GitHub repo"**
3. Select this repo, set root directory to `backend`
4. Add environment variable: `PORT=8000`
5. Set start command: `uvicorn main:app --host 0.0.0.0 --port $PORT`
6. Copy the URL and paste it as `REACT_APP_API_URL` in your Vercel frontend

---

## API Endpoints

| Endpoint | Description |
|----------|-------------|
| `GET /api/stocks/{symbol}/info` | Stock fundamentals & current price |
| `GET /api/stocks/{symbol}/history` | Historical OHLCV + technical indicators |
| `GET /api/stocks/{symbol}/signals` | Buy/Sell/Hold signal analysis |
| `GET /api/market/fear-greed` | Fear & Greed Index |
| `GET /api/market/overview` | Market indices + sector performance |
| `GET /api/market/trending` | Momentum stock scanner |
| `GET /api/watchlist` | Get watchlist |
| `POST /api/watchlist` | Add to watchlist |
| `PUT /api/watchlist/{symbol}` | Update watchlist item |
| `DELETE /api/watchlist/{symbol}` | Remove from watchlist |
| `GET /api/education` | List educational lessons |
| `GET /api/education/{id}` | Get lesson content |

---

## Technical Indicators Used for Signals

| Indicator | Buy Signal | Sell Signal |
|-----------|-----------|-------------|
| RSI (14) | < 30 (oversold) | > 70 (overbought) |
| MACD | Bullish crossover | Bearish crossover |
| SMA 20/50/200 | Price > MAs in alignment | Price < MAs in alignment |
| Golden Cross | SMA50 > SMA200 | SMA50 < SMA200 (Death Cross) |
| Bollinger Bands | Price at lower band | Price at upper band |
| Volume | 2x+ surge with price rise | 2x+ surge with price drop |

---

## Disclaimer

This tool is for **educational purposes only**. Nothing here constitutes financial advice. Always do your own research and consult a financial advisor before making investment decisions.
