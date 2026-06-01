"""
StockIQ Discord Bot
-------------------
Commands:
  !analyze <SYMBOL>   — Full analysis embed with signals, key levels, price targets
  !price <SYMBOL>     — Quick price + change snapshot
  !signals <SYMBOL>   — All technical indicator signals in one embed
  !help               — Show available commands

Setup:
  pip install discord.py aiohttp
  Set your bot token in BOT_TOKEN below (or use an env var)
  Run: python stockiq_bot.py
"""

import asyncio
import os

import aiohttp
import discord
from discord.ext import commands

# ── Config ────────────────────────────────────────────────────────────────────

BOT_TOKEN = os.getenv("DISCORD_BOT_TOKEN", "MTUxMDg2MjcxNzU1MDg1NDIxNA.GYaPOx._aI570kavdwpgYSsVfF7UISmf4gOvhLjZVOP74")
API_BASE  = "https://stock-analyzer-teal.vercel.app/api"

# ── Bot setup ─────────────────────────────────────────────────────────────────

intents = discord.Intents.default()
intents.message_content = True
bot = commands.Bot(command_prefix="!", intents=intents, help_command=None)

# ── Helpers ───────────────────────────────────────────────────────────────────

async def fetch(session: aiohttp.ClientSession, path: str):
    async with session.get(f"{API_BASE}{path}", timeout=aiohttp.ClientTimeout(total=20)) as r:
        if r.status != 200:
            return None
        return await r.json()


def signal_emoji(signal: str) -> str:
    return {"BUY": "🟢", "SELL": "🔴", "HOLD": "🟡"}.get(signal.upper(), "⚪")


def direction_emoji(change: float) -> str:
    return "📈" if change >= 0 else "📉"


def embed_color(signal: str) -> discord.Color:
    return {
        "BUY":  discord.Color.green(),
        "SELL": discord.Color.red(),
        "HOLD": discord.Color.gold(),
    }.get(signal.upper(), discord.Color.blurple())


def fmt_price(v) -> str:
    return f"${v:,.2f}" if v is not None else "N/A"


def fmt_num(v, decimals=2) -> str:
    return f"{v:,.{decimals}f}" if v is not None else "N/A"


def fmt_pct(v) -> str:
    if v is None:
        return "N/A"
    sign = "+" if v >= 0 else ""
    return f"{sign}{v:.2f}%"


def fmt_mcap(v) -> str:
    if v is None:
        return "N/A"
    if v >= 1e12:
        return f"${v/1e12:.2f}T"
    if v >= 1e9:
        return f"${v/1e9:.2f}B"
    if v >= 1e6:
        return f"${v/1e6:.2f}M"
    return f"${v:,.0f}"


def score_bar(score: int, total: int = 11) -> str:
    filled = round((score / total) * 10)
    return "█" * filled + "░" * (10 - filled) + f"  {score}/{total}"


# ── !analyze ──────────────────────────────────────────────────────────────────

@bot.command(name="analyze")
async def analyze(ctx, symbol: str = None):
    if not symbol:
        await ctx.send("Usage: `!analyze <SYMBOL>` — e.g. `!analyze NFLX`")
        return

    symbol = symbol.upper()
    async with ctx.typing():
        async with aiohttp.ClientSession() as session:
            info, sig = await asyncio.gather(
                fetch(session, f"/stocks/{symbol}/info"),
                fetch(session, f"/stocks/{symbol}/signals"),
            )

    if not info or not sig:
        await ctx.send(f"❌ Could not fetch data for **{symbol}**. Check the ticker and try again.")
        return

    overall   = sig.get("overall_signal", "HOLD")
    score     = sig.get("score", 0)
    price     = sig.get("current_price", info.get("current_price"))
    change    = info.get("price_change", 0)
    change_p  = info.get("price_change_pct", 0)
    targets   = sig.get("price_targets", {})
    levels    = sig.get("key_levels", {})
    inds      = sig.get("indicators", {})
    signals   = sig.get("signals", [])

    em = discord.Embed(
        title=f"{signal_emoji(overall)}  {info.get('company_name', symbol)}  ({symbol})",
        description=(
            f"**{overall}** — Score: `{score_bar(score)}`\n"
            f"{targets.get('basis', '')}"
        ),
        color=embed_color(overall),
        url=f"https://stock-analyzer-teal.vercel.app",
    )

    em.add_field(
        name=f"{direction_emoji(change)}  Price",
        value=(
            f"**{fmt_price(price)}**\n"
            f"{fmt_price(change)} ({fmt_pct(change_p)}) today"
        ),
        inline=True,
    )

    em.add_field(
        name="📊  Fundamentals",
        value=(
            f"Mkt Cap: **{fmt_mcap(info.get('market_cap'))}**\n"
            f"P/E: **{fmt_num(info.get('pe_ratio'))}**  |  Fwd P/E: **{fmt_num(info.get('forward_pe'))}**\n"
            f"Beta: **{fmt_num(info.get('beta'))}**  |  EPS: **{fmt_num(info.get('eps'))}**"
        ),
        inline=True,
    )

    em.add_field(
        name="📅  52-Week Range",
        value=(
            f"Low: **{fmt_price(info.get('low_52w'))}**  ({fmt_pct(info.get('pct_from_52w_low'))} from low)\n"
            f"High: **{fmt_price(info.get('high_52w'))}**  ({fmt_pct(info.get('pct_from_52w_high'))} from high)"
        ),
        inline=False,
    )

    em.add_field(
        name="🗺️  Key Levels",
        value=(
            f"Support: **{fmt_price(levels.get('support'))}**  |  Resistance: **{fmt_price(levels.get('resistance'))}**\n"
            f"SMA20: **{fmt_price(levels.get('sma_20'))}**  |  SMA50: **{fmt_price(levels.get('sma_50'))}**  |  SMA200: **{fmt_price(levels.get('sma_200'))}**\n"
            f"BB Upper: **{fmt_price(levels.get('bb_upper'))}**  |  BB Lower: **{fmt_price(levels.get('bb_lower'))}**  |  ATR: **{fmt_num(levels.get('atr'))}**"
        ),
        inline=False,
    )

    em.add_field(
        name="🎯  Price Targets",
        value=(
            f"Watch Buy At: **{fmt_price(targets.get('watch_buy_at'))}**\n"
            f"Watch Sell At: **{fmt_price(targets.get('watch_sell_at'))}**"
        ),
        inline=True,
    )

    em.add_field(
        name="📐  Indicators",
        value=(
            f"RSI(14): **{fmt_num(inds.get('rsi'))}**\n"
            f"MACD: **{fmt_num(inds.get('macd'))}**  |  Signal: **{fmt_num(inds.get('macd_signal'))}**\n"
            f"Stoch %K: **{fmt_num(inds.get('stoch_k'))}**  |  ADX: **{fmt_num(inds.get('adx'))}**"
        ),
        inline=True,
    )

    buy_sigs  = [s for s in signals if s["signal"] == "BUY"]
    sell_sigs = [s for s in signals if s["signal"] == "SELL"]
    hold_sigs = [s for s in signals if s["signal"] == "HOLD"]

    signal_lines = [
        f"{signal_emoji(s['signal'])} **{s['indicator']}** — {s['detail']}"
        for s in signals
    ]

    em.add_field(
        name=f"🔬  Signal Breakdown  (🟢 {len(buy_sigs)} Buy  🔴 {len(sell_sigs)} Sell  🟡 {len(hold_sigs)} Hold)",
        value="\n".join(signal_lines) or "No signals available.",
        inline=False,
    )

    em.set_footer(
        text=(
            f"{info.get('sector', '')} · {info.get('exchange', '')}  |  "
            "⚠️ Not financial advice · NFA/DYOR  |  Data: Yahoo Finance via StockIQ"
        )
    )

    await ctx.send(embed=em)


# ── !price ────────────────────────────────────────────────────────────────────

@bot.command(name="price")
async def price_cmd(ctx, symbol: str = None):
    if not symbol:
        await ctx.send("Usage: `!price <SYMBOL>` — e.g. `!price AAPL`")
        return

    symbol = symbol.upper()
    async with ctx.typing():
        async with aiohttp.ClientSession() as session:
            info = await fetch(session, f"/stocks/{symbol}/info")

    if not info:
        await ctx.send(f"❌ Could not fetch data for **{symbol}**.")
        return

    change   = info.get("price_change", 0)
    change_p = info.get("price_change_pct", 0)
    color    = discord.Color.green() if change >= 0 else discord.Color.red()

    em = discord.Embed(
        title=f"{direction_emoji(change)}  {info.get('company_name', symbol)} ({symbol})",
        color=color,
    )
    em.add_field(name="Price",    value=f"**{fmt_price(info.get('current_price'))}**", inline=True)
    em.add_field(name="Change",   value=f"{fmt_price(change)} ({fmt_pct(change_p)})",  inline=True)
    em.add_field(name="Volume",   value=f"{info.get('volume', 0):,}",                  inline=True)
    em.add_field(name="Day High", value=fmt_price(info.get("day_high")),               inline=True)
    em.add_field(name="Day Low",  value=fmt_price(info.get("day_low")),                inline=True)
    em.add_field(name="Mkt Cap",  value=fmt_mcap(info.get("market_cap")),              inline=True)
    em.set_footer(text="Data: Yahoo Finance via StockIQ  |  NFA/DYOR")

    await ctx.send(embed=em)


# ── !signals ──────────────────────────────────────────────────────────────────

@bot.command(name="signals")
async def signals_cmd(ctx, symbol: str = None):
    if not symbol:
        await ctx.send("Usage: `!signals <SYMBOL>` — e.g. `!signals TSLA`")
        return

    symbol = symbol.upper()
    async with ctx.typing():
        async with aiohttp.ClientSession() as session:
            sig = await fetch(session, f"/stocks/{symbol}/signals")

    if not sig:
        await ctx.send(f"❌ Could not fetch signals for **{symbol}**.")
        return

    overall = sig.get("overall_signal", "HOLD")
    score   = sig.get("score", 0)
    signals = sig.get("signals", [])

    em = discord.Embed(
        title=f"{signal_emoji(overall)}  {symbol} — Technical Signals",
        description=f"Overall: **{overall}**  |  Score: `{score_bar(score)}`",
        color=embed_color(overall),
    )

    strength_map = {"STRONG": "⚡", "MODERATE": "•", "NEUTRAL": "·"}
    for s in signals:
        prefix = strength_map.get(s.get("strength", "NEUTRAL"), "·")
        em.add_field(
            name=f"{signal_emoji(s['signal'])} {prefix} {s['indicator']}",
            value=s["detail"],
            inline=False,
        )

    em.set_footer(text="Data: Yahoo Finance via StockIQ  |  NFA/DYOR")
    await ctx.send(embed=em)


# ── !help ─────────────────────────────────────────────────────────────────────

@bot.command(name="help")
async def help_cmd(ctx):
    em = discord.Embed(
        title="📈  StockIQ Bot Commands",
        description="Powered by [StockIQ](https://stock-analyzer-teal.vercel.app) — free Yahoo Finance data, no API key needed.",
        color=discord.Color.blurple(),
    )
    em.add_field(
        name="`!analyze <SYMBOL>`",
        value="Full analysis: price, signals, key levels, price targets, and all indicators.\nExample: `!analyze NFLX`",
        inline=False,
    )
    em.add_field(
        name="`!price <SYMBOL>`",
        value="Quick price snapshot: current price, change, volume, market cap.\nExample: `!price AAPL`",
        inline=False,
    )
    em.add_field(
        name="`!signals <SYMBOL>`",
        value="All 11 technical indicator signals in one embed.\nExample: `!signals TSLA`",
        inline=False,
    )
    em.set_footer(text="⚠️ Not financial advice · NFA/DYOR · Always do your own research.")
    await ctx.send(embed=em)


# ── Error handling ─────────────────────────────────────────────────────────────

@bot.event
async def on_command_error(ctx, error):
    if isinstance(error, commands.MissingRequiredArgument):
        await ctx.send("❌ Missing argument. Try `!help` to see usage.")
    elif isinstance(error, commands.CommandNotFound):
        pass
    else:
        await ctx.send(f"❌ Something went wrong: `{error}`")


# ── Ready ──────────────────────────────────────────────────────────────────────

@bot.event
async def on_ready():
    print(f"✅ StockIQ Bot logged in as {bot.user} (ID: {bot.user.id})")
    print(f"   API: {API_BASE}")
    await bot.change_presence(
        activity=discord.Activity(
            type=discord.ActivityType.watching,
            name="the markets 📈 | !help"
        )
    )


# ── Run ────────────────────────────────────────────────────────────────────────

if __name__ == "__main__":
    if BOT_TOKEN == "YOUR_BOT_TOKEN_HERE":
        print("❌ Set your bot token in BOT_TOKEN or the DISCORD_BOT_TOKEN env var.")
    else:
        bot.run(BOT_TOKEN)
