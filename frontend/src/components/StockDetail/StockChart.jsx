import { useState } from 'react';
import {
  ComposedChart, Line, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ReferenceLine, Area
} from 'recharts';
import { format, parseISO } from 'date-fns';

const PERIODS = [
  { label: '1W', period: '5d', interval: '1d' },
  { label: '1M', period: '1mo', interval: '1d' },
  { label: '3M', period: '3mo', interval: '1d' },
  { label: '6M', period: '6mo', interval: '1d' },
  { label: '1Y', period: '1y', interval: '1d' },
  { label: '2Y', period: '2y', interval: '1wk' },
];

const OVERLAYS = [
  { key: 'sma_20', label: 'SMA 20', color: '#f59e0b' },
  { key: 'sma_50', label: 'SMA 50', color: '#8b5cf6' },
  { key: 'sma_200', label: 'SMA 200', color: '#ef4444' },
  { key: 'bb_upper', label: 'BB Upper', color: '#64748b' },
  { key: 'bb_lower', label: 'BB Lower', color: '#64748b' },
];

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  const d = payload[0]?.payload;
  if (!d) return null;
  let dateStr = '';
  try { dateStr = format(parseISO(label), 'MMM d, yyyy'); } catch { dateStr = label; }

  return (
    <div className="bg-slate-800 border border-slate-700 rounded-xl p-3 text-xs shadow-xl min-w-[160px]">
      <p className="text-slate-400 mb-2 font-medium">{dateStr}</p>
      <div className="space-y-1">
        <div className="flex justify-between gap-4">
          <span className="text-slate-400">Open</span>
          <span className="text-slate-200 font-mono">${d.open?.toFixed(2)}</span>
        </div>
        <div className="flex justify-between gap-4">
          <span className="text-slate-400">High</span>
          <span className="text-emerald-400 font-mono">${d.high?.toFixed(2)}</span>
        </div>
        <div className="flex justify-between gap-4">
          <span className="text-slate-400">Low</span>
          <span className="text-red-400 font-mono">${d.low?.toFixed(2)}</span>
        </div>
        <div className="flex justify-between gap-4">
          <span className="text-slate-400">Close</span>
          <span className="text-sky-400 font-semibold font-mono">${d.close?.toFixed(2)}</span>
        </div>
        {d.volume && (
          <div className="flex justify-between gap-4 pt-1 border-t border-slate-700">
            <span className="text-slate-400">Volume</span>
            <span className="text-slate-300 font-mono">{(d.volume / 1e6).toFixed(1)}M</span>
          </div>
        )}
        {d.rsi != null && (
          <div className="flex justify-between gap-4">
            <span className="text-slate-400">RSI</span>
            <span className={`font-mono ${d.rsi < 30 ? 'text-emerald-400' : d.rsi > 70 ? 'text-red-400' : 'text-amber-400'}`}>
              {d.rsi?.toFixed(1)}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default function StockChart({ histData, onPeriodChange, currentPeriod = '1y' }) {
  const [activeOverlays, setActiveOverlays] = useState(['sma_20', 'sma_50']);
  const [showVolume, setShowVolume] = useState(true);
  const [showRSI, setShowRSI] = useState(false);

  const toggleOverlay = (key) => {
    setActiveOverlays(prev => prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]);
  };

  const data = histData || [];
  const isPositive = data.length > 1 && data[data.length - 1]?.close >= data[0]?.close;
  const lineColor = isPositive ? '#34d399' : '#f87171';

  const formatXAxis = (val) => {
    try {
      const d = parseISO(val);
      return format(d, currentPeriod === '1y' || currentPeriod === '2y' ? 'MMM yy' : 'MMM d');
    } catch { return ''; }
  };

  return (
    <div className="space-y-3">
      {/* Period selector */}
      <div className="flex items-center gap-2 flex-wrap">
        <div className="flex bg-slate-800 rounded-lg p-0.5 gap-0.5">
          {PERIODS.map(p => (
            <button
              key={p.period}
              onClick={() => onPeriodChange(p.period, p.interval)}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                currentPeriod === p.period ? 'bg-sky-600 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
        <div className="flex gap-1.5 flex-wrap">
          {OVERLAYS.map(o => (
            <button
              key={o.key}
              onClick={() => toggleOverlay(o.key)}
              className={`px-2.5 py-1 text-xs rounded-lg border transition-colors ${
                activeOverlays.includes(o.key)
                  ? 'border-transparent text-white'
                  : 'border-slate-700 text-slate-500 hover:text-slate-300'
              }`}
              style={activeOverlays.includes(o.key) ? { backgroundColor: o.color + '33', borderColor: o.color + '66', color: o.color } : {}}
            >
              {o.label}
            </button>
          ))}
          <button
            onClick={() => setShowVolume(!showVolume)}
            className={`px-2.5 py-1 text-xs rounded-lg border transition-colors ${
              showVolume ? 'border-violet-500/50 bg-violet-500/20 text-violet-400' : 'border-slate-700 text-slate-500 hover:text-slate-300'
            }`}
          >
            Volume
          </button>
          <button
            onClick={() => setShowRSI(!showRSI)}
            className={`px-2.5 py-1 text-xs rounded-lg border transition-colors ${
              showRSI ? 'border-sky-500/50 bg-sky-500/20 text-sky-400' : 'border-slate-700 text-slate-500 hover:text-slate-300'
            }`}
          >
            RSI
          </button>
        </div>
      </div>

      {/* Main Price Chart */}
      <div className="bg-slate-800/50 rounded-xl p-3" style={{ height: showRSI ? 340 : 300 }}>
        <ResponsiveContainer width="100%" height={showRSI ? 220 : 280}>
          <ComposedChart data={data} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="priceGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={lineColor} stopOpacity={0.15} />
                <stop offset="95%" stopColor={lineColor} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
            <XAxis dataKey="date" tickFormatter={formatXAxis} tick={{ fill: '#64748b', fontSize: 10 }}
              axisLine={false} tickLine={false} minTickGap={40} />
            <YAxis tick={{ fill: '#64748b', fontSize: 10 }} axisLine={false} tickLine={false}
              tickFormatter={v => `$${v.toFixed(0)}`} width={52} domain={['auto', 'auto']} />
            <Tooltip content={<CustomTooltip />} />

            <Area type="monotone" dataKey="close" stroke={lineColor} strokeWidth={1.5}
              fill="url(#priceGrad)" dot={false} activeDot={{ r: 3, fill: lineColor }} />

            {activeOverlays.includes('bb_upper') && (
              <Line type="monotone" dataKey="bb_upper" stroke="#64748b" strokeWidth={1}
                dot={false} strokeDasharray="4 2" />
            )}
            {activeOverlays.includes('bb_lower') && (
              <Line type="monotone" dataKey="bb_lower" stroke="#64748b" strokeWidth={1}
                dot={false} strokeDasharray="4 2" />
            )}
            {activeOverlays.includes('sma_20') && (
              <Line type="monotone" dataKey="sma_20" stroke="#f59e0b" strokeWidth={1.5}
                dot={false} />
            )}
            {activeOverlays.includes('sma_50') && (
              <Line type="monotone" dataKey="sma_50" stroke="#8b5cf6" strokeWidth={1.5}
                dot={false} />
            )}
            {activeOverlays.includes('sma_200') && (
              <Line type="monotone" dataKey="sma_200" stroke="#ef4444" strokeWidth={1.5}
                dot={false} />
            )}

            {showVolume && (
              <Bar dataKey="volume" yAxisId="vol" fill="#334155" opacity={0.4}
                maxBarSize={4} />
            )}
          </ComposedChart>
        </ResponsiveContainer>

        {/* RSI sub-chart */}
        {showRSI && (
          <div className="mt-1">
            <p className="text-xs text-slate-500 mb-1 px-1">RSI (14)</p>
            <ResponsiveContainer width="100%" height={90}>
              <ComposedChart data={data} margin={{ top: 0, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="date" tickFormatter={formatXAxis} tick={{ fill: '#64748b', fontSize: 9 }}
                  axisLine={false} tickLine={false} minTickGap={40} />
                <YAxis domain={[0, 100]} tick={{ fill: '#64748b', fontSize: 9 }} axisLine={false}
                  tickLine={false} width={32} ticks={[30, 50, 70]} />
                <Tooltip formatter={(v) => [v?.toFixed(1), 'RSI']} />
                <ReferenceLine y={70} stroke="#ef4444" strokeDasharray="3 3" strokeWidth={1} />
                <ReferenceLine y={30} stroke="#22c55e" strokeDasharray="3 3" strokeWidth={1} />
                <Line type="monotone" dataKey="rsi" stroke="#38bdf8" strokeWidth={1.5}
                  dot={false} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  );
}
