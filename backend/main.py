import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from models.database import create_tables
from routers import stocks, watchlist, market, education

app = FastAPI(
    title="StockIQ API",
    description="Professional stock analysis with technical indicators, fear/greed index, and market insights",
    version="1.0.0",
)

_env_origins = os.getenv("ALLOWED_ORIGINS", "")
allowed_origins = (
    [o.strip() for o in _env_origins.split(",") if o.strip()]
    or ["http://localhost:3000", "http://127.0.0.1:3000"]
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
async def startup_event():
    create_tables()
    print("Stock Analyzer API started successfully")


app.include_router(stocks.router)
app.include_router(watchlist.router)
app.include_router(market.router)
app.include_router(education.router)


@app.get("/api/health")
async def health():
    return {"status": "ok", "message": "Stock Analyzer API is running"}
