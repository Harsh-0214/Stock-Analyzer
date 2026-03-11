export default function SignalBadge({ signal, size = 'sm' }) {
  const config = {
    'STRONG BUY':  { bg: 'bg-emerald-500/20 border-emerald-500/50', text: 'text-emerald-400', dot: 'bg-emerald-400' },
    'BUY':         { bg: 'bg-green-500/20 border-green-500/50',     text: 'text-green-400',   dot: 'bg-green-400'   },
    'HOLD':        { bg: 'bg-amber-500/20 border-amber-500/50',     text: 'text-amber-400',   dot: 'bg-amber-400'   },
    'SELL':        { bg: 'bg-orange-500/20 border-orange-500/50',   text: 'text-orange-400',  dot: 'bg-orange-400'  },
    'STRONG SELL': { bg: 'bg-red-500/20 border-red-500/50',         text: 'text-red-400',     dot: 'bg-red-400'     },
  };
  const c = config[signal] || config['HOLD'];
  const sizes = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-3 py-1',
    lg: 'text-base px-4 py-1.5 font-semibold',
  };
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border ${c.bg} ${c.text} ${sizes[size]} font-medium`}>
      <span className={`w-1.5 h-1.5 rounded-full ${c.dot}`} />
      {signal}
    </span>
  );
}
