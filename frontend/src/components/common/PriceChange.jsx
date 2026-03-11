import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

export default function PriceChange({ value, showIcon = true, className = '' }) {
  if (value == null) return <span className="text-slate-500">—</span>;
  const isPos = value > 0;
  const isNeg = value < 0;
  const color = isPos ? 'text-emerald-400' : isNeg ? 'text-red-400' : 'text-slate-400';
  const Icon = isPos ? TrendingUp : isNeg ? TrendingDown : Minus;
  return (
    <span className={`inline-flex items-center gap-1 ${color} ${className}`}>
      {showIcon && <Icon className="h-3.5 w-3.5" />}
      {isPos ? '+' : ''}{value.toFixed(2)}%
    </span>
  );
}
