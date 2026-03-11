import { useState, useEffect } from 'react';
import { Zap, TrendingUp, BarChart2, ArrowUpCircle, RefreshCw, Plus, Check } from 'lucide-react';
import { marketAPI } from '../../services/api';
import PriceChange from '../common/PriceChange';
import LoadingSpinner from '../common/LoadingSpinner';
import { useApp } from '../../context/AppContext';

const tabs = [
  { id: 'top_momentum', label: 'Top Momentum', icon: Zap },
  { id: 'top_movers_today', label: "Today's Movers", icon: TrendingUp },
  { id: 'volume_surges', label: 'Volume Surges', icon: BarChart2 },
  { id: 'oversold_bounce', label: 'Oversold Bounce', icon: ArrowUpCircle },
];

function RSIBadge({ rsi }) {
  if (!rsi) return null;
  const color = rsi < 30 ? 'text-emerald-400 bg-emerald-400/10' : rsi > 70 ? 'text-red-400 bg-red-400/10' : 'text-amber-400 bg-amber-400/10';
  return <span className={`text-xs px-1.5 py-0.5 rounded font-mono ${color}`}>RSI {rsi}</span>;
}

export default function TrendingStocks() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('top_momentum');
  const { navigateToStock, addToWatchlist, isInWatchlist } = useApp();

  const load = () => {
    setLoading(true);
    marketAPI.getTrending(20)
      .then(r => setData(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const stocks = data?.[activeTab] || [];

  return (
    <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden">
      <div className="flex items-center justify-between px-5 pt-5 pb-4">
        <h2 className="text-base font-bold text-slate-100">Market Opportunities</h2>
        <button onClick={load} disabled={loading}
          className="p-1.5 rounded-lg hover:bg-slate-700 text-slate-400 hover:text-slate-200 transition-colors">
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      <div className="flex border-b border-slate-800 overflow-x-auto">
        {tabs.map(t => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id)}
            className={`flex items-center gap-1.5 px-4 py-2.5 text-sm whitespace-nowrap border-b-2 transition-colors ${
              activeTab === t.id
                ? 'border-sky-500 text-sky-400 font-medium'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <t.icon className="h-3.5 w-3.5" />
            {t.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <LoadingSpinner text="Scanning market..." />
        </div>
      ) : stocks.length === 0 ? (
        <div className="text-center py-12 text-slate-500">No data available</div>
      ) : (
        <div className="divide-y divide-slate-800/50">
          {stocks.map((s, i) => (
            <div key={s.symbol} className="flex items-center px-5 py-3 hover:bg-slate-800/50 group transition-colors">
              <span className="w-6 text-xs text-slate-600 font-mono">{i + 1}</span>
              <button
                onClick={() => navigateToStock(s.symbol)}
                className="flex-1 flex items-center gap-3 text-left min-w-0"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sky-400">{s.symbol}</span>
                    <span className="text-xs px-1.5 py-0.5 rounded bg-emerald-400/10 text-emerald-400 font-semibold">
                      {s.signal}
                    </span>
                    <RSIBadge rsi={s.rsi} />
                    {s.volume_ratio > 1.5 && (
                      <span className="text-xs px-1.5 py-0.5 rounded bg-violet-400/10 text-violet-400 font-medium">
                        {s.volume_ratio.toFixed(1)}x vol
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 truncate">{s.company_name}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="font-semibold text-slate-100">${s.current_price.toLocaleString()}</p>
                  <PriceChange value={s.change_1d} showIcon={false} className="text-xs" />
                </div>
              </button>
              <div className="ml-4 text-right flex-shrink-0 hidden sm:block">
                <p className="text-xs text-slate-500">1M</p>
                <PriceChange value={s.change_1m} showIcon={false} className="text-xs" />
              </div>
              <div className="ml-4 flex-shrink-0">
                <div className="w-16 h-1.5 bg-slate-700 rounded-full overflow-hidden">
                  <div className="h-full rounded-full bg-gradient-to-r from-sky-500 to-violet-500"
                    style={{ width: `${s.momentum_score}%` }} />
                </div>
                <p className="text-xs text-slate-500 text-center mt-0.5">{s.momentum_score}</p>
              </div>
              <button
                onClick={(e) => { e.stopPropagation(); addToWatchlist(s.symbol); }}
                className="ml-3 p-1.5 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-slate-700 text-slate-400 hover:text-sky-400 transition-all"
              >
                {isInWatchlist(s.symbol) ? <Check className="h-4 w-4 text-emerald-400" /> : <Plus className="h-4 w-4" />}
              </button>
            </div>
          ))}
        </div>
      )}

      {data && (
        <div className="px-5 py-3 border-t border-slate-800">
          <p className="text-xs text-slate-500">Scanned {data.total_scanned} stocks</p>
        </div>
      )}
    </div>
  );
}
