import { useState, useEffect } from 'react';
import { marketAPI } from '../../services/api';
import PriceChange from '../common/PriceChange';
import LoadingSpinner from '../common/LoadingSpinner';
import { useApp } from '../../context/AppContext';

export default function MarketOverview() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const { navigateToStock } = useApp();

  useEffect(() => {
    marketAPI.getOverview()
      .then(r => setData(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6 flex items-center justify-center h-48">
      <LoadingSpinner text="Loading market data..." />
    </div>
  );

  return (
    <div className="space-y-4">
      {/* Indices */}
      <div className="bg-slate-900 rounded-2xl border border-slate-800 p-5">
        <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4">Major Indices</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
          {(data?.indices || []).map(idx => (
            <button
              key={idx.symbol}
              onClick={() => navigateToStock(idx.symbol)}
              className="bg-slate-800 hover:bg-slate-700 rounded-xl p-3 text-left transition-colors"
            >
              <p className="text-xs text-slate-400 truncate">{idx.name}</p>
              <p className="text-sm font-bold text-slate-100 mt-1">${idx.price.toLocaleString()}</p>
              <PriceChange value={idx.change_1d} showIcon={false} className="text-xs mt-0.5" />
            </button>
          ))}
        </div>
      </div>

      {/* Sector Heatmap */}
      <div className="bg-slate-900 rounded-2xl border border-slate-800 p-5">
        <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4">Sector Performance (Today)</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
          {(data?.sectors || []).map(s => {
            const intensity = Math.min(Math.abs(s.change_1d) / 3, 1);
            const bg = s.change_1d > 0
              ? `rgba(16, 185, 129, ${0.1 + intensity * 0.4})`
              : `rgba(239, 68, 68, ${0.1 + intensity * 0.4})`;
            return (
              <div
                key={s.sector}
                className="rounded-xl p-3 text-center"
                style={{ backgroundColor: bg }}
              >
                <p className="text-xs text-slate-300 font-medium truncate">{s.sector}</p>
                <p className={`text-sm font-bold mt-1 ${s.change_1d >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                  {s.change_1d > 0 ? '+' : ''}{s.change_1d.toFixed(2)}%
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
