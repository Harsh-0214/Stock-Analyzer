# StockIQ — Smart Market Analysis Platform

A full-stack stock analyzer with real-time buy/sell signals, Fear & Greed Index, trending stocks, watchlist management, and built-in market education. **No API keys required** — uses free Yahoo Finance data via yfinance.

## Features

- **📈 Live Stock Data** — Real-time prices, volume, and fundamentals for any stock
- **🎯 Buy/Sell Signals** — Technical analysis signals (RSI, MACD, Bollinger Bands, Moving Averages, Volume)
- **😱 Fear & Greed Index** — Multi-component sentiment gauge updated in real-time
- **🚀 Trending Stocks** — Momentum scanner across 80+ stocks with multiple filters
- **📋 Watchlist** — Track stocks with buy price, target price, P&L tracking, and notes
- **📊 Interactive Charts** — Charts with overlayable technical indicators (SMA, Bollinger Bands, RSI)
- **📚 Education Center** — 6 comprehensive lessons from basics to advanced options

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend | Python FastAPI + yfinance |
| Data | Yahoo Finance (free, no API key) |
| Database | PostgreSQL via Neon (prod) / SQLite (local dev) |
| Frontend | React + Tailwind CSS (CDN) |
| Charts | Recharts |
| Icons | Lucide React |

---

## Deploying to Vercel (Both Frontend & Backend)

### Overview

You will create **two Vercel projects** from this one repo — one for the backend, one for the frontend. You also need a **free Neon database** (takes 2 minutes).

---

### Step 1 — Get a Free Database (Neon)

The watchlist needs a database that persists. Vercel's filesystem is ephemeral so we use Neon's free PostgreSQL.

1. Go to **[neon.tech](https://neon.tech)** → Sign up (free, no credit card)
2. Click **"New Project"** → name it `stockiq`
3. On the dashboard, find **"Connection string"** and copy it — it looks like:
   ```
   postgresql://username:password@ep-something.us-east-1.aws.neon.tech/neondb?sslmode=require
   ```
4. Save this string — you'll need it in Step 3

---

### Step 2 — Deploy the Backend on Vercel

1. Go to **[vercel.com](https://vercel.com)** → **Add New Project**
2. Import your GitHub repo: `Harsh-0214/Stock-Analyzer`
3. On the **Configure Project** screen:
   - **Root Directory**: `backend`
   - **Framework Preset**: Other
   - Leave Build Command and Output Directory blank
4. Click **Environment Variables** and add:

   | Name | Value |
   |------|-------|
   | `DATABASE_URL` | _(paste your Neon connection string from Step 1)_ |
   | `ALLOWED_ORIGINS` | `https://your-frontend.vercel.app` _(fill in after Step 3)_ |

5. Click **Deploy**
6. Once deployed, copy the URL (e.g. `https://stock-analyzer-backend.vercel.app`) — you need it in Step 3

---

### Step 3 — Deploy the Frontend on Vercel

1. Go to **[vercel.com](https://vercel.com)** → **Add New Project**
2. Import the **same GitHub repo**: `Harsh-0214/Stock-Analyzer`
3. On the **Configure Project** screen:
   - **Root Directory**: `frontend`
   - **Framework Preset**: Create React App
4. Click **Environment Variables** and add:

   | Name | Value |
   |------|-------|
   | `REACT_APP_API_URL` | _(paste your backend URL from Step 2)_ |

5. Click **Deploy** — your app is live!

---

### Step 4 — Connect Them (Update CORS)

Go back to your **backend Vercel project** → Settings → Environment Variables → update `ALLOWED_ORIGINS` to your real frontend URL:

```
https://stock-analyzer-frontend.vercel.app
```

Then **redeploy the backend** (Vercel dashboard → Deployments → Redeploy).

---

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

No `DATABASE_URL` env var needed locally — it auto-uses SQLite.

### Frontend Setup

```bash
cd frontend
npm install
npm start
```

App runs at `http://localhost:3000` (proxies API calls to localhost:8000 automatically).

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
