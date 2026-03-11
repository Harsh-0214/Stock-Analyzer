import { useState, useEffect, useCallback } from 'react';
import { ArrowLeft, Plus, Check, Building2, Users, Globe } from 'lucide-react';
import { stockAPI } from '../../services/api';
import { useApp } from '../../context/AppContext';
import StockChart from './StockChart';
import SignalAnalysis from './SignalAnalysis';
import LoadingSpinner from '../common/LoadingSpinner';
import PriceChange from '../common/PriceChange';

function StatCard({ label, value, sub }) {
  return (
    <div className="bg-slate-800 rounded-xl p-3">
      <p className="text-xs text-slate-400">{label}</p>
      <p className="text-sm font-semibold text-slate-100 mt-0.5">{value ?? '—'}</p>
      {sub && <p className="text-xs text-slate-500 mt-0.5">{sub}</p>}
    </div>
  );
}

function formatMarketCap(mc) {
  if (!mc) return '—';
  if (mc >= 1e12) return `$${(mc / 1e12).toFixed(2)}T`;
  if (mc >= 1e9) return `$${(mc / 1e9).toFixed(2)}B`;
  if (mc >= 1e6) return `$${(mc / 1e6).toFixed(2)}M`;
  return `$${mc.toLocaleString()}`;
}

export default function StockDetail({ symbol }) {
  const [info, setInfo] = useState(null);
  const [histData, setHistData] = useState([]);
  const [signals, setSignals] = useState(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('1y');
  const [activeTab, setActiveTab] = useState('chart');
  const { addToWatchlist, removeFromWatchlist, isInWatchlist, setActiveTab: setNav } = useApp();

  const inWatchlist = isInWatchlist(symbol);

  useEffect(() => {
    if (!symbol) return;
    setLoading(true);
    Promise.all([
      stockAPI.getInfo(symbol),
      stockAPI.getHistory(symbol, '1y', '1d'),
      stockAPI.getSignals(symbol),
    ]).then(([infoRes, histRes, sigRes]) => {
      setInfo(infoRes.data);
      setHistData(histRes.data?.data || []);
      setSignals(sigRes.data);
    }).catch(() => {}).finally(() => setLoading(false));
  }, [symbol]);

  const handlePeriodChange = useCallback((newPeriod, interval) => {
    setPeriod(newPeriod);
    stockAPI.getHistory(symbol, newPeriod, interval)
      .then(r => setHistData(r.data?.data || []))
      .catch(() => {});
  }, [symbol]);

  if (loading) return (
    <div className="flex items-center justify-center h-96">
      <LoadingSpinner size="lg" text={`Loading ${symbol}...`} />
    </div>
  );

  if (!info) return (
    <div className="flex flex-col items-center justify-center h-96 gap-4">
      <p className="text-slate-400">Could not load data for {symbol}</p>
      <button onClick={() => setNav('dashboard')} className="px-4 py-2 bg-slate-700 rounded-lg text-sm hover:bg-slate-600">
        Back to Dashboard
      </button>
    </div>
  );

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-4">
          <button
            onClick={() => setNav('dashboard')}
            className="mt-1 p-2 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-3xl font-black text-slate-100">{info.symbol}</h1>
              <span className="text-slate-400 text-lg font-medium">{info.company_name}</span>
              {info.sector && (
                <span className="text-xs px-2.5 py-1 bg-slate-800 rounded-full text-slate-400">{info.sector}</span>
              )}
            </div>
            <div className="flex items-center gap-4 mt-2">
              <span className="text-4xl font-black text-slate-100">${info.current_price?.toLocaleString()}</span>
              <div>
                <PriceChange value={info.price_change_pct} className="text-base" />
                <p className="text-sm text-slate-500">{info.price_change > 0 ? '+' : ''}{info.price_change?.toFixed(2)} today</p>
              </div>
            </div>
          </div>
        </div>
        <div className="flex gap-2 mt-1 flex-shrink-0">
          <button
            onClick={() => inWatchlist ? removeFromWatchlist(symbol) : addToWatchlist(symbol)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
              inWatchlist
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 hover:bg-red-500/20 hover:text-red-400 hover:border-red-500/30'
                : 'bg-sky-600 hover:bg-sky-500 text-white'
            }`}
          >
            {inWatchlist ? <Check className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
            {inWatchlist ? 'Watching' : 'Watch'}
          </button>
        </div>
      </div>

      {/* Quick stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2">
        <StatCard label="Open" value={`$${info.open}`} />
        <StatCard label="Day High" value={`$${info.day_high}`} />
        <StatCard label="Day Low" value={`$${info.day_low}`} />
        <StatCard label="52W High" value={`$${info.high_52w}`} sub={<PriceChange value={info.pct_from_52w_high} showIcon={false} className="text-xs" />} />
        <StatCard label="52W Low" value={`$${info.low_52w}`} sub={<PriceChange value={info.pct_from_52w_low} showIcon={false} className="text-xs" />} />
        <StatCard label="Market Cap" value={formatMarketCap(info.market_cap)} />
        <StatCard label="P/E Ratio" value={info.pe_ratio?.toFixed(2)} sub={info.forward_pe ? `Fwd: ${info.forward_pe?.toFixed(2)}` : null} />
        <StatCard label="Volume" value={info.volume ? `${(info.volume / 1e6).toFixed(1)}M` : '—'}
          sub={`Avg: ${info.avg_volume ? (info.avg_volume / 1e6).toFixed(1) + 'M' : '—'}`} />
      </div>

      <div className="grid lg:grid-cols-3 gap-4">
        {/* Left: Chart + Tabs */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-slate-900 rounded-2xl border border-slate-800 p-5">
            <div className="flex gap-4 mb-4 border-b border-slate-800">
              {['chart', 'about'].map(t => (
                <button key={t} onClick={() => setActiveTab(t)}
                  className={`pb-2 text-sm font-medium capitalize border-b-2 transition-colors ${
                    activeTab === t ? 'border-sky-500 text-sky-400' : 'border-transparent text-slate-400 hover:text-slate-200'
                  }`}>{t}</button>
              ))}
            </div>

            {activeTab === 'chart' && (
              <StockChart histData={histData} onPeriodChange={handlePeriodChange} currentPeriod={period} />
            )}

            {activeTab === 'about' && (
              <div className="space-y-4">
                {info.description && (
                  <p className="text-sm text-slate-300 leading-relaxed">{info.description}</p>
                )}
                <div className="grid sm:grid-cols-2 gap-3">
                  {info.website && (
                    <a href={info.website} target="_blank" rel="noopener noreferrer"
                      className="flex items-center gap-2 text-sm text-sky-400 hover:text-sky-300">
                      <Globe className="h-4 w-4" /> {info.website}
                    </a>
                  )}
                  {info.employees && (
                    <div className="flex items-center gap-2 text-sm text-slate-400">
                      <Users className="h-4 w-4" /> {info.employees.toLocaleString()} employees
                    </div>
                  )}
                  {info.country && (
                    <div className="flex items-center gap-2 text-sm text-slate-400">
                      <Globe className="h-4 w-4" /> {info.country}
                    </div>
                  )}
                  {info.exchange && (
                    <div className="flex items-center gap-2 text-sm text-slate-400">
                      <Building2 className="h-4 w-4" /> {info.exchange}
                    </div>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-2 pt-2">
                  <StatCard label="EPS" value={info.eps ? `$${info.eps.toFixed(2)}` : '—'} />
                  <StatCard label="Beta" value={info.beta?.toFixed(2)} sub="vs market" />
                  <StatCard label="Dividend Yield" value={info.dividend_yield ? `${(info.dividend_yield * 100).toFixed(2)}%` : 'None'} />
                  <StatCard label="Industry" value={info.industry} />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right: Signal Analysis */}
        <div>
          <SignalAnalysis data={signals} />
        </div>
      </div>
    </div>
  );
}
