import { useState, useEffect } from 'react';
import { ExternalLink, TrendingUp, TrendingDown, Minus, Newspaper } from 'lucide-react';
import { stockAPI } from '../../services/api';
import LoadingSpinner from '../common/LoadingSpinner';

const SENTIMENT_CONFIG = {
  Bullish: {
    icon: TrendingUp,
    classes: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
    dot: 'bg-emerald-400',
    border: 'border-l-emerald-500',
  },
  Bearish: {
    icon: TrendingDown,
    classes: 'bg-red-500/15 text-red-400 border-red-500/30',
    dot: 'bg-red-400',
    border: 'border-l-red-500',
  },
  Neutral: {
    icon: Minus,
    classes: 'bg-slate-600/40 text-slate-400 border-slate-500/30',
    dot: 'bg-slate-400',
    border: 'border-l-slate-500',
  },
};

const IMPACT_AREA_COLORS = {
  'Earnings & Revenue': 'bg-violet-500/15 text-violet-400',
  'Regulatory & Product': 'bg-blue-500/15 text-blue-400',
  'Leadership': 'bg-amber-500/15 text-amber-400',
  'M&A / Deals': 'bg-sky-500/15 text-sky-400',
  'Legal & Regulatory': 'bg-orange-500/15 text-orange-400',
  'Shareholder Returns': 'bg-teal-500/15 text-teal-400',
  'Analyst Opinion': 'bg-indigo-500/15 text-indigo-400',
  'Product & Innovation': 'bg-cyan-500/15 text-cyan-400',
  'Macro / Market': 'bg-pink-500/15 text-pink-400',
  'General': 'bg-slate-600/40 text-slate-400',
};

function NewsCard({ article }) {
  const sentiment = SENTIMENT_CONFIG[article.sentiment] || SENTIMENT_CONFIG.Neutral;
  const SentimentIcon = sentiment.icon;
  const impactColor = IMPACT_AREA_COLORS[article.impact_area] || IMPACT_AREA_COLORS.General;

  return (
    <div className={`bg-slate-800/60 rounded-xl p-4 border border-slate-700/50 border-l-4 ${sentiment.border} hover:bg-slate-800 transition-colors`}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          {/* Title row */}
          <div className="flex items-start gap-2">
            <a
              href={article.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm font-semibold text-slate-100 hover:text-sky-400 transition-colors leading-snug line-clamp-2 flex-1"
            >
              {article.title}
            </a>
            {article.url && (
              <a
                href={article.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-shrink-0 text-slate-500 hover:text-sky-400 mt-0.5"
              >
                <ExternalLink className="h-3.5 w-3.5" />
              </a>
            )}
          </div>

          {/* Meta row */}
          <div className="flex items-center gap-2 mt-1.5 flex-wrap">
            {article.publisher && (
              <span className="text-xs text-slate-500">{article.publisher}</span>
            )}
            {article.publisher && article.published_at && (
              <span className="text-slate-700 text-xs">·</span>
            )}
            {article.published_at && (
              <span className="text-xs text-slate-500">{article.published_at}</span>
            )}
          </div>

          {/* Summary */}
          {article.summary && (
            <p className="text-xs text-slate-400 mt-2 leading-relaxed line-clamp-2">{article.summary}</p>
          )}

          {/* Impact explanation */}
          <div className="mt-3 flex items-start gap-2 bg-slate-900/60 rounded-lg p-2.5">
            <div className={`flex-shrink-0 mt-0.5 h-2 w-2 rounded-full ${sentiment.dot}`} />
            <p className="text-xs text-slate-300 leading-relaxed">{article.impact_explanation}</p>
          </div>
        </div>
      </div>

      {/* Badges */}
      <div className="flex items-center gap-2 mt-3 flex-wrap">
        <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full border ${sentiment.classes}`}>
          <SentimentIcon className="h-3 w-3" />
          {article.sentiment}
        </span>
        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${impactColor}`}>
          {article.impact_area}
        </span>
      </div>
    </div>
  );
}

export default function StockNews({ symbol }) {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!symbol) return;
    setLoading(true);
    setError(null);
    stockAPI.getNews(symbol)
      .then(r => setNews(r.data?.news || []))
      .catch(() => setError('Could not load news.'))
      .finally(() => setLoading(false));
  }, [symbol]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner size="md" text="Loading news..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-10 text-slate-400 text-sm">{error}</div>
    );
  }

  if (!news.length) {
    return (
      <div className="flex flex-col items-center justify-center py-12 gap-3 text-slate-500">
        <Newspaper className="h-8 w-8 opacity-40" />
        <p className="text-sm">No recent news found for {symbol}.</p>
      </div>
    );
  }

  const bullish = news.filter(n => n.sentiment === 'Bullish').length;
  const bearish = news.filter(n => n.sentiment === 'Bearish').length;
  const neutral = news.filter(n => n.sentiment === 'Neutral').length;

  return (
    <div className="space-y-4">
      {/* Sentiment summary bar */}
      <div className="flex items-center gap-4 px-1">
        <span className="text-xs text-slate-500 font-medium">Sentiment breakdown:</span>
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1 text-xs text-emerald-400">
            <TrendingUp className="h-3 w-3" /> {bullish} Bullish
          </span>
          <span className="flex items-center gap-1 text-xs text-red-400">
            <TrendingDown className="h-3 w-3" /> {bearish} Bearish
          </span>
          <span className="flex items-center gap-1 text-xs text-slate-400">
            <Minus className="h-3 w-3" /> {neutral} Neutral
          </span>
        </div>
      </div>

      {/* News cards */}
      <div className="space-y-3">
        {news.map((article, idx) => (
          <NewsCard key={idx} article={article} />
        ))}
      </div>
    </div>
  );
}
