import { TrendingUp, TrendingDown, Minus, AlertCircle } from 'lucide-react';
import SignalBadge from '../common/SignalBadge';

const strengthIcons = {
  STRONG: { icon: AlertCircle, class: 'text-sky-400' },
  MODERATE: { icon: TrendingUp, class: 'text-amber-400' },
  NEUTRAL: { icon: Minus, class: 'text-slate-400' },
};

const signalColors = {
  BUY: 'bg-emerald-500/10 border-emerald-500/30',
  SELL: 'bg-red-500/10 border-red-500/30',
  HOLD: 'bg-amber-500/10 border-amber-500/30',
};

export default function SignalAnalysis({ data }) {
  if (!data) return null;

  const scorePercent = Math.min(Math.max((data.score + 100) / 2, 0), 100);

  return (
    <div className="space-y-4">
      {/* Overall Signal */}
      <div className="bg-slate-800 rounded-2xl p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-slate-200">Overall Signal</h3>
          <SignalBadge signal={data.overall_signal} size="lg" />
        </div>

        {/* Score bar */}
        <div className="mb-1 flex items-center justify-between text-xs text-slate-500">
          <span>Bearish</span>
          <span>Neutral</span>
          <span>Bullish</span>
        </div>
        <div className="h-3 bg-slate-700 rounded-full overflow-hidden relative">
          <div className="absolute inset-0 flex">
            <div className="w-1/2 bg-gradient-to-r from-red-500/30 to-transparent" />
            <div className="w-1/2 bg-gradient-to-l from-emerald-500/30 to-transparent" />
          </div>
          <div
            className="h-full w-1 bg-white rounded-full absolute transition-all duration-700"
            style={{ left: `calc(${scorePercent}% - 2px)` }}
          />
        </div>
        <p className="text-xs text-slate-500 text-center mt-1">Score: {data.score > 0 ? '+' : ''}{data.score}</p>
      </div>

      {/* Key Levels */}
      {data.key_levels && (
        <div className="bg-slate-800 rounded-2xl p-5">
          <h3 className="font-semibold text-slate-200 mb-3">Key Price Levels</h3>
          <div className="grid grid-cols-2 gap-2">
            {[
              { label: 'Resistance', value: data.key_levels.resistance, color: 'text-red-400' },
              { label: 'Support', value: data.key_levels.support, color: 'text-emerald-400' },
              { label: 'SMA 20', value: data.key_levels.sma_20, color: 'text-amber-400' },
              { label: 'SMA 50', value: data.key_levels.sma_50, color: 'text-violet-400' },
              { label: 'SMA 200', value: data.key_levels.sma_200, color: 'text-red-400' },
              { label: 'BB Upper', value: data.key_levels.bb_upper, color: 'text-slate-400' },
              { label: 'BB Lower', value: data.key_levels.bb_lower, color: 'text-slate-400' },
            ].filter(l => l.value != null).map(l => (
              <div key={l.label} className="flex justify-between items-center bg-slate-700/50 rounded-lg px-3 py-2">
                <span className="text-xs text-slate-400">{l.label}</span>
                <span className={`text-sm font-semibold font-mono ${l.color}`}>${l.value?.toFixed(2)}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Individual Signals */}
      <div className="space-y-2">
        <h3 className="font-semibold text-slate-200 px-1">Signal Breakdown</h3>
        {(data.signals || []).map((s, i) => {
          const { icon: Icon, class: iconClass } = strengthIcons[s.strength] || strengthIcons.NEUTRAL;
          return (
            <div key={i} className={`rounded-xl border p-3 ${signalColors[s.signal] || signalColors.HOLD}`}>
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Icon className={`h-4 w-4 flex-shrink-0 mt-0.5 ${iconClass}`} />
                  <div>
                    <p className="text-sm font-medium text-slate-200">{s.indicator}</p>
                    <p className="text-xs text-slate-400 mt-0.5">{s.detail}</p>
                  </div>
                </div>
                <SignalBadge signal={s.signal} size="sm" />
              </div>
            </div>
          );
        })}
      </div>

      {/* Indicators */}
      {data.indicators && (
        <div className="bg-slate-800 rounded-2xl p-5">
          <h3 className="font-semibold text-slate-200 mb-3">Indicator Values</h3>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <p className="text-xs text-slate-500 mb-1">RSI (14)</p>
              <div className="flex items-center gap-2">
                <div className="flex-1 h-2 bg-slate-700 rounded-full overflow-hidden">
                  <div className="h-full rounded-full"
                    style={{
                      width: `${data.indicators.rsi}%`,
                      backgroundColor: data.indicators.rsi < 30 ? '#22c55e' : data.indicators.rsi > 70 ? '#ef4444' : '#eab308'
                    }} />
                </div>
                <span className="text-sm font-mono text-slate-300 w-10">{data.indicators.rsi?.toFixed(1)}</span>
              </div>
            </div>
            <div>
              <p className="text-xs text-slate-500 mb-1">BB Position</p>
              <div className="flex items-center gap-2">
                <div className="flex-1 h-2 bg-slate-700 rounded-full overflow-hidden">
                  <div className="h-full bg-sky-500 rounded-full"
                    style={{ width: `${(data.indicators.bb_position || 0) * 100}%` }} />
                </div>
                <span className="text-sm font-mono text-slate-300 w-10">
                  {((data.indicators.bb_position || 0) * 100).toFixed(0)}%
                </span>
              </div>
            </div>
            <div className="col-span-2">
              <p className="text-xs text-slate-500 mb-1">Volume Ratio (vs 20-day avg)</p>
              <div className="flex items-center gap-2">
                <div className="flex-1 h-2 bg-slate-700 rounded-full overflow-hidden">
                  <div className="h-full rounded-full"
                    style={{
                      width: `${Math.min((data.indicators.volume_ratio || 1) / 3 * 100, 100)}%`,
                      backgroundColor: data.indicators.volume_ratio > 1.5 ? '#8b5cf6' : '#64748b'
                    }} />
                </div>
                <span className="text-sm font-mono text-slate-300 w-14">
                  {data.indicators.volume_ratio?.toFixed(2)}x
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
