import { useState, useEffect, useCallback } from 'react';
import { TrendingUp, TrendingDown, Bitcoin, Search, RefreshCw, BarChart2 } from 'lucide-react';
import { cryptoAPI } from '../../services/api';
import { useApp } from '../../context/AppContext';

import LoadingSpinner from '../common/LoadingSpinner';

function fmt(num) {
  if (num == null) return '—';
  if (num >= 1e12) return `$${(num / 1e12).toFixed(2)}T`;
  if (num >= 1e9)  return `$${(num / 1e9).toFixed(2)}B`;
  if (num >= 1e6)  return `$${(num / 1e6).toFixed(2)}M`;
  return `$${num.toLocaleString()}`;
}

function fmtPrice(price) {
  if (price == null) return '—';
  if (price < 0.01) return `$${price.toFixed(6)}`;
  if (price < 1)    return `$${price.toFixed(4)}`;
  if (price < 1000) return `$${price.toFixed(2)}`;
  return `$${price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function CryptoRow({ crypto, rank, onSelect }) {
  const isUp = crypto.change_pct >= 0;
  return (
    <tr
      onClick={() => onSelect(crypto.slug)}
      className="border-b border-slate-800/60 hover:bg-slate-800/40 cursor-pointer transition-colors"
    >
      <td className="px-4 py-3 text-slate-500 text-sm w-10">{rank}</td>
      <td className="px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-400 to-yellow-500 flex items-center justify-center flex-shrink-0">
            <span className="text-white font-bold text-xs">{crypto.slug.slice(0, 2)}</span>
          </div>
          <div>
            <p className="font-semibold text-slate-100 text-sm">{crypto.name}</p>
            <p className="text-slate-500 text-xs">{crypto.slug}</p>
          </div>
        </div>
      </td>
      <td className="px-4 py-3 text-right font-mono font-semibold text-slate-100">
        {fmtPrice(crypto.price)}
      </td>
      <td className="px-4 py-3 text-right">
        <span className={`inline-flex items-center gap-1 text-sm font-semibold ${isUp ? 'text-emerald-400' : 'text-red-400'}`}>
          {isUp ? <TrendingUp className="h-3.5 w-3.5" /> : <TrendingDown className="h-3.5 w-3.5" />}
          {isUp ? '+' : ''}{crypto.change_pct?.toFixed(2)}%
        </span>
      </td>
      <td className="px-4 py-3 text-right text-slate-300 text-sm hidden sm:table-cell">{fmt(crypto.market_cap)}</td>
      <td className="px-4 py-3 text-right text-slate-400 text-sm hidden md:table-cell">{fmt(crypto.volume_24h)}</td>
    </tr>
  );
}

function CryptoCard({ crypto, rank, onSelect }) {
  const isUp = crypto.change_pct >= 0;
  return (
    <div
      onClick={() => onSelect(crypto.slug)}
      className="bg-slate-900 border border-slate-800 rounded-xl p-4 hover:border-slate-600 cursor-pointer transition-all hover:bg-slate-800/60"
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-orange-400 to-yellow-500 flex items-center justify-center">
            <span className="text-white font-bold text-sm">{crypto.slug.slice(0, 2)}</span>
          </div>
          <div>
            <p className="font-semibold text-slate-100 text-sm">{crypto.slug}</p>
            <p className="text-slate-500 text-xs">{crypto.name}</p>
          </div>
        </div>
        <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${isUp ? 'bg-emerald-900/50 text-emerald-400' : 'bg-red-900/50 text-red-400'}`}>
          {isUp ? '+' : ''}{crypto.change_pct?.toFixed(2)}%
        </span>
      </div>
      <p className="font-mono font-bold text-lg text-slate-100">{fmtPrice(crypto.price)}</p>
      <p className="text-xs text-slate-500 mt-1">MCap: {fmt(crypto.market_cap)}</p>
    </div>
  );
}

export default function CryptoDashboard() {
  const { navigateToStock } = useApp();
  const [cryptos, setCryptos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [view, setView] = useState('table'); // 'table' | 'grid'
  const [refreshing, setRefreshing] = useState(false);

  const loadCryptos = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    else setRefreshing(true);
    setError(null);
    try {
      const res = await cryptoAPI.getTop(20);
      setCryptos(res.data.cryptos || []);
    } catch (e) {
      setError('Failed to load crypto data');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { loadCryptos(); }, [loadCryptos]);

  const handleSelect = (slug) => {
    navigateToStock(`${slug}-USD`);
  };

  const filtered = cryptos.filter(c =>
    !search ||
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.slug.toLowerCase().includes(search.toLowerCase())
  );

  const gainers = [...cryptos].filter(c => c.change_pct > 0).sort((a, b) => b.change_pct - a.change_pct).slice(0, 3);
  const losers  = [...cryptos].filter(c => c.change_pct < 0).sort((a, b) => a.change_pct - b.change_pct).slice(0, 3);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-orange-400 to-yellow-500 rounded-xl flex items-center justify-center">
            <Bitcoin className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-100">Crypto</h1>
            <p className="text-slate-500 text-sm">Top cryptocurrencies by market cap</p>
          </div>
        </div>
        <button
          onClick={() => loadCryptos(true)}
          disabled={refreshing}
          className="flex items-center gap-2 px-3 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg text-slate-300 text-sm transition-colors"
        >
          <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Top Movers */}
      {!loading && cryptos.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Top Gainers */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
            <p className="text-emerald-400 font-semibold text-sm mb-3 flex items-center gap-1.5">
              <TrendingUp className="h-4 w-4" /> Top Gainers
            </p>
            <div className="space-y-2">
              {gainers.map(c => (
                <div key={c.symbol} onClick={() => handleSelect(c.slug)} className="flex items-center justify-between cursor-pointer hover:bg-slate-800 rounded-lg px-2 py-1 transition-colors">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-gradient-to-br from-orange-400 to-yellow-500 flex items-center justify-center">
                      <span className="text-white font-bold text-xs">{c.slug.slice(0,1)}</span>
                    </div>
                    <span className="text-slate-200 text-sm font-medium">{c.slug}</span>
                  </div>
                  <span className="text-emerald-400 font-semibold text-sm">+{c.change_pct?.toFixed(2)}%</span>
                </div>
              ))}
            </div>
          </div>

          {/* Top Losers */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
            <p className="text-red-400 font-semibold text-sm mb-3 flex items-center gap-1.5">
              <TrendingDown className="h-4 w-4" /> Top Losers
            </p>
            <div className="space-y-2">
              {losers.map(c => (
                <div key={c.symbol} onClick={() => handleSelect(c.slug)} className="flex items-center justify-between cursor-pointer hover:bg-slate-800 rounded-lg px-2 py-1 transition-colors">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-gradient-to-br from-orange-400 to-yellow-500 flex items-center justify-center">
                      <span className="text-white font-bold text-xs">{c.slug.slice(0,1)}</span>
                    </div>
                    <span className="text-slate-200 text-sm font-medium">{c.slug}</span>
                  </div>
                  <span className="text-red-400 font-semibold text-sm">{c.change_pct?.toFixed(2)}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Search + View Toggle */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search crypto..."
            className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-9 pr-4 py-2 text-slate-200 placeholder-slate-500 text-sm focus:outline-none focus:border-sky-500"
          />
        </div>
        <div className="flex items-center bg-slate-900 border border-slate-700 rounded-lg overflow-hidden">
          <button onClick={() => setView('table')} className={`px-3 py-2 text-sm transition-colors ${view === 'table' ? 'bg-sky-600/20 text-sky-400' : 'text-slate-400 hover:text-slate-200'}`}>
            <BarChart2 className="h-4 w-4" />
          </button>
          <button onClick={() => setView('grid')} className={`px-3 py-2 text-sm transition-colors ${view === 'grid' ? 'bg-sky-600/20 text-sky-400' : 'text-slate-400 hover:text-slate-200'}`}>
            <svg className="h-4 w-4" fill="none" viewBox="0 0 16 16" stroke="currentColor" strokeWidth={1.5}>
              <rect x="1" y="1" width="6" height="6" rx="1"/><rect x="9" y="1" width="6" height="6" rx="1"/>
              <rect x="1" y="9" width="6" height="6" rx="1"/><rect x="9" y="9" width="6" height="6" rx="1"/>
            </svg>
          </button>
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex justify-center py-20"><LoadingSpinner /></div>
      ) : error ? (
        <div className="text-center py-20">
          <p className="text-red-400">{error}</p>
          <button onClick={() => loadCryptos()} className="mt-3 text-sky-400 text-sm hover:underline">Retry</button>
        </div>
      ) : view === 'grid' ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
          {filtered.map((c, i) => (
            <CryptoCard key={c.symbol} crypto={c} rank={i + 1} onSelect={handleSelect} />
          ))}
        </div>
      ) : (
        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-800">
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider w-10">#</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Asset</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">Price</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">24h %</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider hidden sm:table-cell">Market Cap</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider hidden md:table-cell">Volume 24h</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((c, i) => (
                  <CryptoRow key={c.symbol} crypto={c} rank={i + 1} onSelect={handleSelect} />
                ))}
              </tbody>
            </table>
          </div>
          {filtered.length === 0 && (
            <p className="text-center text-slate-500 py-10">No results for "{search}"</p>
          )}
        </div>
      )}
    </div>
  );
}
