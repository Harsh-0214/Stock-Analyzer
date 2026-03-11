import yfinance as yf
from concurrent.futures import ThreadPoolExecutor, as_completed
from services.stock_service import get_stock_info, get_stock_history, get_signal_analysis

CRYPTO_LIST = [
    {"symbol": "BTC-USD",  "name": "Bitcoin",       "slug": "BTC"},
    {"symbol": "ETH-USD",  "name": "Ethereum",      "slug": "ETH"},
    {"symbol": "BNB-USD",  "name": "BNB",           "slug": "BNB"},
    {"symbol": "SOL-USD",  "name": "Solana",        "slug": "SOL"},
    {"symbol": "XRP-USD",  "name": "XRP",           "slug": "XRP"},
    {"symbol": "DOGE-USD", "name": "Dogecoin",      "slug": "DOGE"},
    {"symbol": "ADA-USD",  "name": "Cardano",       "slug": "ADA"},
    {"symbol": "AVAX-USD", "name": "Avalanche",     "slug": "AVAX"},
    {"symbol": "LINK-USD", "name": "Chainlink",     "slug": "LINK"},
    {"symbol": "DOT-USD",  "name": "Polkadot",      "slug": "DOT"},
    {"symbol": "MATIC-USD","name": "Polygon",       "slug": "MATIC"},
    {"symbol": "UNI-USD",  "name": "Uniswap",       "slug": "UNI"},
    {"symbol": "LTC-USD",  "name": "Litecoin",      "slug": "LTC"},
    {"symbol": "ATOM-USD", "name": "Cosmos",        "slug": "ATOM"},
    {"symbol": "NEAR-USD", "name": "NEAR Protocol", "slug": "NEAR"},
    {"symbol": "APT-USD",  "name": "Aptos",         "slug": "APT"},
    {"symbol": "ARB-USD",  "name": "Arbitrum",      "slug": "ARB"},
    {"symbol": "OP-USD",   "name": "Optimism",      "slug": "OP"},
    {"symbol": "FIL-USD",  "name": "Filecoin",      "slug": "FIL"},
    {"symbol": "ICP-USD",  "name": "Internet Computer", "slug": "ICP"},
]

CRYPTO_SYMBOLS = [c["symbol"] for c in CRYPTO_LIST]
CRYPTO_NAME_MAP = {c["symbol"]: c["name"] for c in CRYPTO_LIST}
CRYPTO_SLUG_MAP = {c["slug"].lower(): c["symbol"] for c in CRYPTO_LIST}


def _fetch_single_crypto(symbol: str) -> dict | None:
    try:
        ticker = yf.Ticker(symbol)
        info = ticker.info
        hist = ticker.history(period="2d")
        if hist.empty:
            return None

        price = float(hist["Close"].iloc[-1])
        prev = float(hist["Close"].iloc[-2]) if len(hist) >= 2 else price
        change_pct = ((price - prev) / prev * 100) if prev else 0

        market_cap = info.get("marketCap") or info.get("market_cap")
        volume = info.get("volume24Hr") or info.get("volume") or (
            float(hist["Volume"].iloc[-1]) if not hist.empty else None
        )
        high_52 = info.get("fiftyTwoWeekHigh")
        low_52 = info.get("fiftyTwoWeekLow")

        return {
            "symbol": symbol,
            "slug": symbol.replace("-USD", ""),
            "name": CRYPTO_NAME_MAP.get(symbol, symbol.replace("-USD", "")),
            "price": round(price, 6) if price < 1 else round(price, 2),
            "change_pct": round(change_pct, 2),
            "market_cap": market_cap,
            "volume_24h": volume,
            "high_52w": high_52,
            "low_52w": low_52,
        }
    except Exception:
        return None


def get_top_cryptos(limit: int = 20) -> list:
    symbols = CRYPTO_SYMBOLS[:limit]
    results = []
    with ThreadPoolExecutor(max_workers=10) as ex:
        futures = {ex.submit(_fetch_single_crypto, s): s for s in symbols}
        for future in as_completed(futures):
            data = future.result()
            if data:
                results.append(data)
    # Sort by original list order
    order = {s: i for i, s in enumerate(symbols)}
    results.sort(key=lambda x: order.get(x["symbol"], 999))
    return results


def get_crypto_info(symbol: str) -> dict:
    info = get_stock_info(symbol)
    if info:
        info["is_crypto"] = True
        info["slug"] = symbol.replace("-USD", "")
    return info


def get_crypto_history(symbol: str, period: str = "1y", interval: str = "1d") -> dict:
    return get_stock_history(symbol, period, interval)


def get_crypto_signals(symbol: str) -> dict:
    return get_signal_analysis(symbol)


def search_cryptos(query: str) -> list:
    q = query.lower().strip()
    results = []
    for c in CRYPTO_LIST:
        if (
            q in c["slug"].lower()
            or q in c["name"].lower()
            or q in c["symbol"].lower()
        ):
            results.append({
                "symbol": c["slug"],
                "name": c["name"],
                "exchange": "Crypto",
                "type": "crypto",
            })
    return results[:10]
