from fastapi import APIRouter

router = APIRouter(prefix="/api/education", tags=["education"])

LESSONS = [
    {
        "id": "fundamentals",
        "title": "Stock Market Fundamentals",
        "category": "Beginner",
        "icon": "📈",
        "duration": "10 min",
        "description": "Learn the basics of how stock markets work",
        "content": {
            "overview": "The stock market is a marketplace where buyers and sellers trade shares of publicly listed companies. Understanding how it works is the foundation of successful investing.",
            "sections": [
                {
                    "title": "What is a Stock?",
                    "body": "A stock (also called a share or equity) represents partial ownership in a company. When you buy a stock, you become a shareholder — you own a small piece of that company and are entitled to a portion of its profits and assets.",
                    "key_points": [
                        "Stocks give you ownership rights in a company",
                        "Stock prices are determined by supply and demand",
                        "Companies issue stocks to raise capital for growth",
                        "Public companies are listed on exchanges like NYSE or NASDAQ"
                    ]
                },
                {
                    "title": "How Stock Prices Move",
                    "body": "Stock prices fluctuate based on countless factors: company earnings, economic data, investor sentiment, news events, and more. At its core, prices are driven by supply (sellers) and demand (buyers).",
                    "key_points": [
                        "Positive earnings = typically higher stock price",
                        "Negative news = typically lower stock price",
                        "Market sentiment (fear/greed) heavily influences prices",
                        "Macro factors like interest rates affect all stocks"
                    ]
                },
                {
                    "title": "Bull vs Bear Markets",
                    "body": "A bull market is a period of rising stock prices (typically 20%+ gains). A bear market is a period of falling prices (typically 20%+ decline). Bull markets represent optimism and economic growth, while bear markets reflect pessimism or recession fears.",
                    "key_points": [
                        "Bull market: prices rising 20%+ from recent lows",
                        "Bear market: prices falling 20%+ from recent highs",
                        "Market corrections (10% drops) are normal and healthy",
                        "Long-term investors benefit from staying invested through cycles"
                    ]
                }
            ]
        }
    },
    {
        "id": "technical-analysis",
        "title": "Technical Analysis",
        "category": "Intermediate",
        "icon": "📊",
        "duration": "15 min",
        "description": "Master charts, indicators, and price patterns",
        "content": {
            "overview": "Technical analysis is the study of historical price and volume data to forecast future price movements. Traders use charts and indicators to identify patterns and trends.",
            "sections": [
                {
                    "title": "Moving Averages (SMA & EMA)",
                    "body": "Moving averages smooth out price data to identify trends. The Simple Moving Average (SMA) calculates the average price over N periods. The Exponential Moving Average (EMA) gives more weight to recent prices.",
                    "key_points": [
                        "SMA 20: Short-term trend (last 20 days)",
                        "SMA 50: Medium-term trend (last 50 days)",
                        "SMA 200: Long-term trend (last 200 days)",
                        "Golden Cross: SMA50 crosses above SMA200 = bullish signal",
                        "Death Cross: SMA50 crosses below SMA200 = bearish signal",
                        "Price above all MAs = strong uptrend"
                    ]
                },
                {
                    "title": "RSI (Relative Strength Index)",
                    "body": "RSI measures the speed and magnitude of price changes on a scale of 0-100. It's used to identify overbought (>70) and oversold (<30) conditions.",
                    "key_points": [
                        "RSI > 70: Overbought — potential SELL signal",
                        "RSI < 30: Oversold — potential BUY signal",
                        "RSI 40-60: Neutral zone",
                        "RSI divergence from price can signal reversals",
                        "In strong uptrends, RSI often stays in 50-80 range"
                    ]
                },
                {
                    "title": "MACD (Moving Average Convergence/Divergence)",
                    "body": "MACD shows the relationship between two exponential moving averages (12-day and 26-day EMAs). It consists of the MACD line, signal line, and histogram.",
                    "key_points": [
                        "MACD Line = 12-day EMA minus 26-day EMA",
                        "Signal Line = 9-day EMA of MACD Line",
                        "Bullish crossover: MACD crosses above signal line",
                        "Bearish crossover: MACD crosses below signal line",
                        "Histogram shows momentum strength"
                    ]
                },
                {
                    "title": "Bollinger Bands",
                    "body": "Bollinger Bands consist of a middle band (20-day SMA) with upper and lower bands two standard deviations away. They measure volatility and identify overbought/oversold conditions.",
                    "key_points": [
                        "Price near upper band: potentially overbought",
                        "Price near lower band: potentially oversold",
                        "Band squeeze (narrowing) = volatility contraction, breakout coming",
                        "Band expansion = high volatility",
                        "Price walking up upper band = strong uptrend"
                    ]
                },
                {
                    "title": "Support & Resistance",
                    "body": "Support is a price level where buying pressure overcomes selling, preventing further decline. Resistance is where selling pressure overcomes buying, preventing further rise.",
                    "key_points": [
                        "Support: price floor where buyers step in",
                        "Resistance: price ceiling where sellers take over",
                        "Broken resistance becomes new support",
                        "Round numbers often act as psychological support/resistance",
                        "The more times a level is tested, the stronger it becomes"
                    ]
                }
            ]
        }
    },
    {
        "id": "fundamental-analysis",
        "title": "Fundamental Analysis",
        "category": "Intermediate",
        "icon": "💼",
        "duration": "12 min",
        "description": "Value stocks using financial metrics and business analysis",
        "content": {
            "overview": "Fundamental analysis evaluates a company's intrinsic value by examining financial statements, business model, industry position, and economic factors.",
            "sections": [
                {
                    "title": "Price-to-Earnings (P/E) Ratio",
                    "body": "The P/E ratio compares a company's stock price to its earnings per share. It tells you how much investors are willing to pay per dollar of earnings.",
                    "key_points": [
                        "P/E = Stock Price / Earnings Per Share",
                        "Low P/E (<15): Potentially undervalued or slow growth",
                        "High P/E (>30): High growth expectations or overvalued",
                        "Forward P/E uses projected future earnings",
                        "Compare P/E to industry peers, not just a number in isolation",
                        "PEG ratio = P/E / Growth Rate (PEG<1 = potentially undervalued)"
                    ]
                },
                {
                    "title": "Market Capitalization",
                    "body": "Market cap is the total market value of a company's outstanding shares (Price × Shares Outstanding). It categorizes companies by size.",
                    "key_points": [
                        "Mega cap: >$200B (AAPL, MSFT, NVDA)",
                        "Large cap: $10B-$200B — stable, well-established",
                        "Mid cap: $2B-$10B — growth potential with some stability",
                        "Small cap: $300M-$2B — higher risk, higher reward potential",
                        "Micro cap: <$300M — very speculative"
                    ]
                },
                {
                    "title": "Revenue & Earnings Growth",
                    "body": "Growing revenue and earnings are the most direct indicators of a healthy, expanding business. Look for consistent, accelerating growth.",
                    "key_points": [
                        "Revenue growth >15% annually = high growth stock",
                        "Earnings beats vs analyst estimates move prices significantly",
                        "Gross margin shows pricing power and efficiency",
                        "Operating leverage: revenue grows faster than expenses",
                        "Earnings surprises often lead to significant price moves"
                    ]
                },
                {
                    "title": "Beta & Volatility",
                    "body": "Beta measures a stock's volatility relative to the overall market. A beta of 1.0 moves with the market; above 1.0 is more volatile; below 1.0 is less volatile.",
                    "key_points": [
                        "Beta 0.5: Half as volatile as the market",
                        "Beta 1.0: Moves in line with the market",
                        "Beta 1.5: 50% more volatile than the market",
                        "High beta stocks: better in bull markets, worse in bear markets",
                        "Low beta stocks: defensive plays during uncertainty"
                    ]
                }
            ]
        }
    },
    {
        "id": "risk-management",
        "title": "Risk Management",
        "category": "Advanced",
        "icon": "🛡️",
        "duration": "12 min",
        "description": "Protect your capital with position sizing and stop losses",
        "content": {
            "overview": "Risk management is the most important skill in trading. Professional traders focus on managing losses — the profits take care of themselves when you limit downside.",
            "sections": [
                {
                    "title": "The 2% Rule",
                    "body": "Never risk more than 2% of your total portfolio on a single trade. This ensures that even a long losing streak won't wipe out your account.",
                    "key_points": [
                        "2% rule: max loss per trade = 2% of portfolio",
                        "$10,000 portfolio = max $200 risk per trade",
                        "Position size = Risk Amount / (Entry - Stop Loss)",
                        "Keeps you in the game through losing streaks",
                        "Professional traders often risk only 0.5-1%"
                    ]
                },
                {
                    "title": "Stop Losses",
                    "body": "A stop loss is a predetermined price at which you exit a losing trade. It removes emotion from decision-making and limits damage.",
                    "key_points": [
                        "Hard stop: automatic sell order at fixed price",
                        "Soft stop: mental note to exit at price level",
                        "Trailing stop: moves up with price to lock in profits",
                        "Place stops below key support levels, not arbitrary %",
                        "Never move your stop loss to avoid a loss — this is fatal"
                    ]
                },
                {
                    "title": "Risk/Reward Ratio",
                    "body": "Only take trades where your potential profit is at least 2-3x your potential loss. This way you can be right only 40% of the time and still be profitable.",
                    "key_points": [
                        "Minimum 2:1 R/R ratio (risk $1 to make $2)",
                        "3:1 R/R with 40% win rate = profitable",
                        "Calculate before entry: where is your target and stop?",
                        "Higher R/R allows lower win rate to be profitable",
                        "Most professional traders aim for 2:1 to 5:1"
                    ]
                },
                {
                    "title": "Portfolio Diversification",
                    "body": "Don't put all your eggs in one basket. Spread risk across sectors, asset classes, and position sizes.",
                    "key_points": [
                        "Max 5-10% of portfolio in a single stock",
                        "Diversify across at least 3-5 different sectors",
                        "Include uncorrelated assets (stocks, bonds, commodities)",
                        "Over-diversification dilutes returns — own your best ideas",
                        "Correlation: during crashes, most assets fall together"
                    ]
                }
            ]
        }
    },
    {
        "id": "market-psychology",
        "title": "Market Psychology & Emotions",
        "category": "Advanced",
        "icon": "🧠",
        "duration": "10 min",
        "description": "Master your emotions and understand market cycles",
        "content": {
            "overview": "90% of retail traders lose money — not because they can't find good stocks, but because emotions override logic. Understanding psychology gives you an edge.",
            "sections": [
                {
                    "title": "The Emotional Cycle of Investing",
                    "body": "Markets are driven by cycles of optimism and pessimism. Most retail investors buy at the top (when everyone is excited) and sell at the bottom (when everyone is scared).",
                    "key_points": [
                        "Optimism → Excitement → Thrill → Euphoria (market top)",
                        "Anxiety → Denial → Fear → Desperation (decline)",
                        "Panic → Capitulation (market bottom) → Despondency",
                        "Hope → Relief → Optimism (recovery)",
                        "Be greedy when others are fearful; fearful when others are greedy"
                    ]
                },
                {
                    "title": "Common Trading Biases",
                    "body": "Cognitive biases lead to poor decisions. Recognizing them is the first step to overcoming them.",
                    "key_points": [
                        "Loss aversion: pain of losing > pleasure of winning (2x stronger)",
                        "Confirmation bias: seeking info that confirms existing beliefs",
                        "FOMO: Fear Of Missing Out leads to chasing breakouts",
                        "Recency bias: overweighting recent events",
                        "Anchoring: fixating on purchase price instead of current value",
                        "Disposition effect: selling winners too early, holding losers too long"
                    ]
                },
                {
                    "title": "The Fear & Greed Index",
                    "body": "The Fear & Greed Index measures market sentiment on a scale of 0 (Extreme Fear) to 100 (Extreme Greed). It's a contrarian indicator — buy when fearful, sell when greedy.",
                    "key_points": [
                        "0-25: Extreme Fear — historically best time to buy",
                        "25-45: Fear — market may be oversold",
                        "45-55: Neutral — wait for clearer signal",
                        "55-75: Greed — exercise caution with new positions",
                        "75-100: Extreme Greed — consider taking profits",
                        "Warren Buffett: 'Be fearful when others are greedy'"
                    ]
                },
                {
                    "title": "Trading Journal & Discipline",
                    "body": "Successful traders keep detailed records of every trade. A trading journal forces accountability and reveals patterns in your decision-making.",
                    "key_points": [
                        "Record: entry price, exit, reason, emotion at time",
                        "Review monthly to identify recurring mistakes",
                        "Follow your system — don't deviate based on feeling",
                        "Accept that losses are part of the game",
                        "Never overtrade to recover losses (revenge trading)",
                        "Best trades often feel uncomfortable at entry"
                    ]
                }
            ]
        }
    },
    {
        "id": "options-basics",
        "title": "Options Trading Basics",
        "category": "Advanced",
        "icon": "⚡",
        "duration": "15 min",
        "description": "Understand calls, puts, and options strategies",
        "content": {
            "overview": "Options are financial contracts that give the buyer the right (but not obligation) to buy or sell a stock at a specific price before a certain date. They can amplify gains — or losses.",
            "sections": [
                {
                    "title": "Calls & Puts",
                    "body": "A call option gives you the right to BUY stock at the strike price. A put option gives you the right to SELL stock at the strike price.",
                    "key_points": [
                        "Call option: bet stock will go UP",
                        "Put option: bet stock will go DOWN",
                        "Strike price: the price you can buy/sell at",
                        "Expiration date: when the option expires",
                        "Premium: the price you pay for the option",
                        "In-the-money (ITM) vs Out-of-the-money (OTM)"
                    ]
                },
                {
                    "title": "The Greeks",
                    "body": "Options Greeks measure how an option's price changes with various factors: price movement (delta), time decay (theta), volatility (vega).",
                    "key_points": [
                        "Delta: how much option price moves per $1 stock move",
                        "Theta: time decay — options lose value every day",
                        "Vega: sensitivity to implied volatility changes",
                        "Gamma: rate of change of delta",
                        "High theta: selling options captures time decay",
                        "ATM options have delta ~0.5"
                    ]
                },
                {
                    "title": "Risk Warning",
                    "body": "Options are leveraged instruments. While they can generate massive returns, they can also expire completely worthless. Most options expire worthless.",
                    "key_points": [
                        "Options can go to $0 — you lose 100% of premium",
                        "Most retail options buyers lose money",
                        "Time decay works against buyers, for sellers",
                        "Never buy options with money you can't afford to lose",
                        "Start with covered calls before complex strategies",
                        "Paper trade first before risking real capital"
                    ]
                }
            ]
        }
    }
]


@router.get("")
async def get_all_lessons():
    """Get all educational lessons summary."""
    return [
        {
            "id": l["id"],
            "title": l["title"],
            "category": l["category"],
            "icon": l["icon"],
            "duration": l["duration"],
            "description": l["description"],
        }
        for l in LESSONS
    ]


@router.get("/{lesson_id}")
async def get_lesson(lesson_id: str):
    """Get a specific lesson with full content."""
    lesson = next((l for l in LESSONS if l["id"] == lesson_id), None)
    if not lesson:
        from fastapi import HTTPException
        raise HTTPException(status_code=404, detail=f"Lesson '{lesson_id}' not found")
    return lesson
