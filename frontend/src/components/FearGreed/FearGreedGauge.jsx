import { useState, useEffect } from 'react';
import { RefreshCw } from 'lucide-react';
import { marketAPI } from '../../services/api';
import LoadingSpinner from '../common/LoadingSpinner';

function GaugeArc({ score }) {
  const size = 220;
  const cx = size / 2;
  const cy = size / 2 + 20;
  const r = 85;
  const startAngle = -180;
  const endAngle = 0;
  const totalAngle = endAngle - startAngle;
  const angle = startAngle + (score / 100) * totalAngle;
  const toRad = (deg) => (deg * Math.PI) / 180;

  const arcPath = (start, end, radius) => {
    const x1 = cx + radius * Math.cos(toRad(start));
    const y1 = cy + radius * Math.sin(toRad(start));
    const x2 = cx + radius * Math.cos(toRad(end));
    const y2 = cy + radius * Math.sin(toRad(end));
    return `M ${x1} ${y1} A ${radius} ${radius} 0 0 1 ${x2} ${y2}`;
  };

  const zones = [
    { start: -180, end: -144, color: '#ef4444', label: 'Extreme Fear' },
    { start: -144, end: -108, color: '#f97316', label: 'Fear' },
    { start: -108, end: -72, color: '#eab308', label: 'Neutral' },
    { start: -72, end: -36, color: '#84cc16', label: 'Greed' },
    { start: -36, end: 0, color: '#22c55e', label: 'Extreme Greed' },
  ];

  const needleX = cx + (r - 10) * Math.cos(toRad(angle));
  const needleY = cy + (r - 10) * Math.sin(toRad(angle));

  const getColor = (s) => {
    if (s < 25) return '#ef4444';
    if (s < 45) return '#f97316';
    if (s < 55) return '#eab308';
    if (s < 75) return '#84cc16';
    return '#22c55e';
  };

  return (
    <svg viewBox={`0 0 ${size} ${size}`} className="w-full max-w-xs mx-auto">
      {/* Background track */}
      <path d={arcPath(-180, 0, r)} fill="none" stroke="#1e293b" strokeWidth="16" strokeLinecap="round" />

      {/* Colored zones */}
      {zones.map((z, i) => (
        <path key={i} d={arcPath(z.start, z.end, r)} fill="none" stroke={z.color} strokeWidth="14"
          strokeLinecap={i === 0 ? 'round' : i === zones.length - 1 ? 'round' : 'butt'} opacity="0.7" />
      ))}

      {/* Active zone highlight */}
      <path d={arcPath(-180, angle, r)} fill="none" stroke={getColor(score)} strokeWidth="14"
        strokeLinecap="round" opacity="0.95" />

      {/* Needle */}
      <circle cx={cx} cy={cy} r="8" fill="#1e293b" stroke={getColor(score)} strokeWidth="2" />
      <line x1={cx} y1={cy} x2={needleX} y2={needleY}
        stroke={getColor(score)} strokeWidth="3" strokeLinecap="round" />
      <circle cx={cx} cy={cy} r="4" fill={getColor(score)} />

      {/* Score text */}
      <text x={cx} y={cy - 30} textAnchor="middle" fill={getColor(score)}
        fontSize="36" fontWeight="800" fontFamily="Inter, sans-serif">{Math.round(score)}</text>

      {/* Labels */}
      <text x={cx - r - 5} y={cy + 20} textAnchor="middle" fill="#ef4444" fontSize="9" fontFamily="Inter">Fear</text>
      <text x={cx + r + 5} y={cy + 20} textAnchor="middle" fill="#22c55e" fontSize="9" fontFamily="Inter">Greed</text>
    </svg>
  );
}

export default function FearGreedGauge({ compact = false }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    marketAPI.getFearGreed()
      .then(r => setData(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const getLabelColor = (label) => {
    const m = { 'Extreme Fear': 'text-red-400', 'Fear': 'text-orange-400', 'Neutral': 'text-amber-400',
      'Greed': 'text-lime-400', 'Extreme Greed': 'text-emerald-400' };
    return m[label] || 'text-slate-400';
  };

  if (loading) return (
    <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6 flex items-center justify-center h-64">
      <LoadingSpinner text="Calculating..." />
    </div>
  );

  if (!data) return null;

  if (compact) return (
    <div className="bg-slate-900 rounded-2xl border border-slate-800 p-5">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">Fear & Greed</h3>
        <button onClick={load} className="p-1 hover:bg-slate-700 rounded text-slate-400">
          <RefreshCw className="h-3.5 w-3.5" />
        </button>
      </div>
      <GaugeArc score={data.score} />
      <div className="text-center mt-1">
        <p className={`text-lg font-bold ${getLabelColor(data.label)}`}>{data.label}</p>
        <div className="flex justify-center gap-4 mt-2 text-xs text-slate-500">
          <span>1W ago: {data.previous_week}</span>
          <span>1M ago: {data.previous_month}</span>
        </div>
      </div>
    </div>
  );

  return (
    <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden">
      <div className="flex items-center justify-between px-6 pt-6 pb-4">
        <div>
          <h2 className="text-xl font-bold text-slate-100">Fear & Greed Index</h2>
          <p className="text-sm text-slate-400 mt-0.5">Market sentiment indicator</p>
        </div>
        <button onClick={load} disabled={loading} className="p-2 rounded-lg hover:bg-slate-700 text-slate-400 hover:text-slate-200">
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      <div className="px-6 pb-6 grid lg:grid-cols-2 gap-8">
        <div>
          <GaugeArc score={data.score} />
          <div className="text-center mt-2">
            <p className={`text-2xl font-bold ${getLabelColor(data.label)}`}>{data.label}</p>
            <p className="text-sm text-slate-400 mt-1">{data.description}</p>
            <div className="flex justify-center gap-6 mt-3 text-xs text-slate-500">
              <div className="text-center">
                <p className="font-medium text-slate-300">{data.previous_week}</p>
                <p>Last Week</p>
              </div>
              <div className="text-center">
                <p className="font-medium text-slate-300">{data.previous_month}</p>
                <p>Last Month</p>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">Components</h3>
          {(data.components || []).map(c => (
            <div key={c.name} className="bg-slate-800 rounded-xl p-3">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-sm font-medium text-slate-300">{c.name}</span>
                <span className={`text-sm font-bold ${getLabelColor(c.interpretation)}`}>{c.score}</span>
              </div>
              <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden">
                <div className="h-full rounded-full transition-all duration-700"
                  style={{
                    width: `${c.score}%`,
                    background: `hsl(${c.score * 1.2}, 80%, 55%)`
                  }} />
              </div>
              <p className="text-xs text-slate-500 mt-1">{c.value}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
