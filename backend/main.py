import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from models.database import create_tables
from routers import stocks, watchlist, market, education, crypto

app = FastAPI(
    title="StockIQ API",
    description="Professional stock analysis with technical indicators, fear/greed index, and market insights",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
async def startup_event():
    try:
        create_tables()
    except Exception as e:
        print(f"Warning: could not initialize database: {e}")
    print("Stock Analyzer API started successfully")


app.include_router(stocks.router)
app.include_router(watchlist.router)
app.include_router(market.router)
app.include_router(education.router)
app.include_router(crypto.router)


@app.get("/api/health")
async def health():
    return {"status": "ok", "message": "Stock Analyzer API is running"}
