import MarketOverview from './MarketOverview';
import TrendingStocks from './TrendingStocks';
import FearGreedGauge from '../FearGreed/FearGreedGauge';
import StockSearch from '../common/StockSearch';

export default function Dashboard() {
  return (
    <div className="space-y-6">
      {/* Hero search */}
      <div className="bg-gradient-to-br from-slate-900 via-sky-950/30 to-slate-900 rounded-2xl border border-slate-800 p-8">
        <h1 className="text-3xl font-black text-slate-100 mb-1">
          Your Edge in the <span className="bg-gradient-to-r from-sky-400 to-violet-400 bg-clip-text text-transparent">Market</span>
        </h1>
        <p className="text-slate-400 mb-5">Real-time signals, momentum alerts, and market intelligence in one place</p>
        <StockSearch placeholder="Search any stock, ETF, or crypto..." />
      </div>

      {/* Market Overview */}
      <MarketOverview />

      <div className="grid xl:grid-cols-4 gap-4">
        {/* Trending Stocks (3/4 width) */}
        <div className="xl:col-span-3">
          <TrendingStocks />
        </div>

        {/* Fear & Greed (1/4 width) */}
        <div>
          <FearGreedGauge compact={true} />
        </div>
      </div>
    </div>
  );
}
