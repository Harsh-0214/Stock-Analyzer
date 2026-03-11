import { TrendingUp, Minus, AlertCircle, Target, ShieldAlert, ArrowDownCircle, ArrowUpCircle } from 'lucide-react';
import SignalBadge from '../common/SignalBadge';

const strengthIcons = {
  STRONG:   { icon: AlertCircle, class: 'text-sky-400' },
  MODERATE: { icon: TrendingUp,  class: 'text-amber-400' },
  NEUTRAL:  { icon: Minus,       class: 'text-slate-400' },
};

const signalColors = {
  BUY:  'bg-emerald-500/10 border-emerald-500/30',
  SELL: 'bg-red-500/10 border-red-500/30',
  HOLD: 'bg-amber-500/10 border-amber-500/30',
};

function fmtPrice(v) {
  if (v == null) return '—';
  return `$${Number(v).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function IndicatorBar({ label, value, min = 0, max = 100, lowGood = false, color }) {
  const pct = Math.min(Math.max(((value - min) / (max - min)) * 100, 0), 100);
  const barColor = color || (lowGood
    ? value <= 30 ? '#22c55e' : value >= 70 ? '#ef4444' : '#eab308'
    : value >= 70 ? '#22c55e' : value <= 30 ? '#ef4444' : '#eab308');
  return (
    <div>
      <div className="flex justify-between items-center mb-1">
        <p className="text-xs text-slate-500">{label}</p>
        <span className="text-xs font-mono text-slate-300">{typeof value === 'number' ? value.toFixed(1) : value}</span>
      </div>
      <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden">
        <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, backgroundColor: barColor }} />
      </div>
    </div>
  );
}

function PriceTargets({ pt, currentPrice }) {
  if (!pt) return null;
  const isBuy  = pt.action === 'BUY';
  const isSell = pt.action === 'SELL';
  const isHold = pt.action === 'HOLD';

  const headerColor = isBuy ? 'text-emerald-400' : isSell ? 'text-red-400' : 'text-amber-400';
  const headerBg    = isBuy ? 'bg-emerald-500/10 border-emerald-500/30' : isSell ? 'bg-red-500/10 border-red-500/30' : 'bg-amber-500/10 border-amber-500/30';

  return (
    <div className={`rounded-2xl border p-5 ${headerBg}`}>
      <div className="flex items-center gap-2 mb-4">
        <Target className={`h-4 w-4 ${headerColor}`} />
        <h3 className="font-semibold text-slate-200">Price Targets</h3>
        <span className={`ml-auto text-xs font-bold px-2 py-0.5 rounded-full ${isBuy ? 'bg-emerald-900/60 text-emerald-300' : isSell ? 'bg-red-900/60 text-red-300' : 'bg-amber-900/60 text-amber-300'}`}>
          {pt.action}
        </span>
      </div>

      {isHold && (
        <div className="space-y-2">
          <Row label="Watch Buy At" value={fmtPrice(pt.watch_buy_at)} color="text-emerald-400" icon={<ArrowDownCircle className="h-3.5 w-3.5 text-emerald-400" />} />
          <Row label="Watch Sell At" value={fmtPrice(pt.watch_sell_at)} color="text-red-400" icon={<ArrowUpCircle className="h-3.5 w-3.5 text-red-400" />} />
          <p className="text-xs text-slate-500 mt-2 leading-relaxed">{pt.basis}</p>
        </div>
      )}

      {isBuy && (
        <div className="space-y-2">
          <Row label="Buy Zone" value={`${fmtPrice(pt.buy_zone_low)} – ${fmtPrice(pt.buy_zone_high)}`} color="text-emerald-400" icon={<ArrowDownCircle className="h-3.5 w-3.5 text-emerald-400" />} />
          <Row label="Stop Loss" value={fmtPrice(pt.stop_loss)} color="text-red-400" icon={<ShieldAlert className="h-3.5 w-3.5 text-red-400" />} />
          <div className="border-t border-slate-700/50 my-2" />
          <Row label="Target 1" value={fmtPrice(pt.target_1)} color="text-sky-400" icon={<Target className="h-3.5 w-3.5 text-sky-400" />} />
          <Row label="Target 2" value={fmtPrice(pt.target_2)} color="text-violet-400" icon={<Target className="h-3.5 w-3.5 text-violet-400" />} />
          <div className="flex items-center justify-between mt-3 bg-slate-800/60 rounded-lg px-3 py-2">
            <span className="text-xs text-slate-400">Risk / Reward</span>
            <span className="text-sm font-bold text-emerald-400">{pt.risk_reward}</span>
          </div>
          <p className="text-xs text-slate-500 mt-1 leading-relaxed">{pt.basis}</p>
        </div>
      )}

      {isSell && (
        <div className="space-y-2">
          <Row label="Sell At" value={fmtPrice(pt.sell_price)} color="text-red-400" icon={<ArrowUpCircle className="h-3.5 w-3.5 text-red-400" />} />
          <Row label="Stop Loss" value={fmtPrice(pt.stop_loss)} color="text-amber-400" icon={<ShieldAlert className="h-3.5 w-3.5 text-amber-400" />} />
          <div className="border-t border-slate-700/50 my-2" />
          <Row label="Target 1 (Cover)" value={fmtPrice(pt.target_1)} color="text-sky-400" icon={<Target className="h-3.5 w-3.5 text-sky-400" />} />
          <Row label="Target 2 (Cover)" value={fmtPrice(pt.target_2)} color="text-violet-400" icon={<Target className="h-3.5 w-3.5 text-violet-400" />} />
          <div className="flex items-center justify-between mt-3 bg-slate-800/60 rounded-lg px-3 py-2">
            <span className="text-xs text-slate-400">Risk / Reward</span>
            <span className="text-sm font-bold text-red-400">{pt.risk_reward}</span>
          </div>
          <p className="text-xs text-slate-500 mt-1 leading-relaxed">{pt.basis}</p>
        </div>
      )}
    </div>
  );
}

function Row({ label, value, color, icon }) {
  return (
    <div className="flex items-center justify-between bg-slate-800/50 rounded-lg px-3 py-2">
      <div className="flex items-center gap-1.5">
        {icon}
        <span className="text-xs text-slate-400">{label}</span>
      </div>
      <span className={`text-sm font-semibold font-mono ${color}`}>{value}</span>
    </div>
  );
}

export default function SignalAnalysis({ data }) {
  if (!data) return null;

  const scorePercent = Math.min(Math.max((data.score + 100) / 2, 0), 100);
  const ind = data.indicators || {};

  return (
    <div className="space-y-4">
      {/* Overall Signal */}
      <div className="bg-slate-800 rounded-2xl p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-slate-200">Overall Signal</h3>
          <SignalBadge signal={data.overall_signal} size="lg" />
        </div>
        <div className="mb-1 flex items-center justify-between text-xs text-slate-500">
          <span>Bearish</span><span>Neutral</span><span>Bullish</span>
        </div>
        <div className="h-3 bg-slate-700 rounded-full overflow-hidden relative">
          <div className="absolute inset-0 flex">
            <div className="w-1/2 bg-gradient-to-r from-red-500/30 to-transparent" />
            <div className="w-1/2 bg-gradient-to-l from-emerald-500/30 to-transparent" />
          </div>
          <div className="h-full w-1 bg-white rounded-full absolute transition-all duration-700"
            style={{ left: `calc(${scorePercent}% - 2px)` }} />
        </div>
        <p className="text-xs text-slate-500 text-center mt-1">
          Score: {data.score > 0 ? '+' : ''}{data.score} &nbsp;·&nbsp; {data.signals?.length || 0} indicators analysed
        </p>
      </div>

      {/* Price Targets — shown before signal breakdown */}
      <PriceTargets pt={data.price_targets} currentPrice={data.current_price} />

      {/* Key Levels */}
      {data.key_levels && (
        <div className="bg-slate-800 rounded-2xl p-5">
          <h3 className="font-semibold text-slate-200 mb-3">Key Price Levels</h3>
          <div className="grid grid-cols-2 gap-2">
            {[
              { label: 'Resistance', value: data.key_levels.resistance, color: 'text-red-400' },
              { label: 'Support',    value: data.key_levels.support,    color: 'text-emerald-400' },
              { label: 'SMA 20',     value: data.key_levels.sma_20,     color: 'text-amber-400' },
              { label: 'SMA 50',     value: data.key_levels.sma_50,     color: 'text-violet-400' },
              { label: 'SMA 200',    value: data.key_levels.sma_200,    color: 'text-red-400' },
              { label: 'BB Upper',   value: data.key_levels.bb_upper,   color: 'text-slate-400' },
              { label: 'BB Lower',   value: data.key_levels.bb_lower,   color: 'text-slate-400' },
              { label: 'ATR (14)',   value: data.key_levels.atr,        color: 'text-sky-400' },
            ].filter(l => l.value != null).map(l => (
              <div key={l.label} className="flex justify-between items-center bg-slate-700/50 rounded-lg px-3 py-2">
                <span className="text-xs text-slate-400">{l.label}</span>
                <span className={`text-sm font-semibold font-mono ${l.color}`}>{fmtPrice(l.value)}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Signal Breakdown */}
      <div className="space-y-2">
        <h3 className="font-semibold text-slate-200 px-1">Signal Breakdown ({data.signals?.length || 0})</h3>
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

      {/* Indicator Gauges */}
      {Object.keys(ind).length > 0 && (
        <div className="bg-slate-800 rounded-2xl p-5">
          <h3 className="font-semibold text-slate-200 mb-4">Indicator Values</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <IndicatorBar label="RSI (14)"           value={ind.rsi}         min={0}    max={100}  />
            <IndicatorBar label="Stochastic %K"      value={ind.stoch_k}     min={0}    max={100}  />
            <IndicatorBar label="Williams %R"        value={ind.williams_r + 100} min={0} max={100} lowGood={false} color={ind.williams_r < -80 ? '#22c55e' : ind.williams_r > -20 ? '#ef4444' : '#eab308'} />
            <IndicatorBar label="CCI (20)"           value={ind.cci}         min={-200} max={200}  color={ind.cci < -100 ? '#22c55e' : ind.cci > 100 ? '#ef4444' : '#eab308'} />
            <IndicatorBar label="ADX (Trend Strength)" value={ind.adx}       min={0}    max={60}   color={ind.adx > 40 ? '#8b5cf6' : ind.adx > 25 ? '#eab308' : '#64748b'} />
            <IndicatorBar label="BB Position"        value={(ind.bb_position || 0) * 100} min={0} max={100} color={ind.bb_position < 0.1 ? '#22c55e' : ind.bb_position > 0.9 ? '#ef4444' : '#64748b'} />
            <IndicatorBar label="ROC 10-day (%)"     value={ind.roc + 20}    min={0}    max={40}   color={ind.roc > 5 ? '#22c55e' : ind.roc < -5 ? '#ef4444' : '#eab308'} />
            <IndicatorBar label="Volume Ratio"       value={Math.min((ind.volume_ratio || 1) / 4 * 100, 100)} min={0} max={100} color={ind.volume_ratio > 1.5 ? '#8b5cf6' : '#64748b'} />
          </div>
          {/* MACD values as text */}
          <div className="grid grid-cols-2 gap-2 mt-4 pt-4 border-t border-slate-700/50">
            <div className="bg-slate-700/50 rounded-lg px-3 py-2">
              <p className="text-xs text-slate-500">MACD Line</p>
              <p className={`text-sm font-mono font-semibold ${ind.macd >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>{ind.macd?.toFixed(4)}</p>
            </div>
            <div className="bg-slate-700/50 rounded-lg px-3 py-2">
              <p className="text-xs text-slate-500">MACD Signal</p>
              <p className="text-sm font-mono font-semibold text-slate-300">{ind.macd_signal?.toFixed(4)}</p>
            </div>
          </div>
        </div>
      )}

      <p className="text-xs text-slate-600 text-center pb-2">
        ⚠ For educational purposes only. Not financial advice.
      </p>
    </div>
  );
}
