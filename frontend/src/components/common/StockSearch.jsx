import { useState, useRef, useEffect } from 'react';
import { Search, X, TrendingUp } from 'lucide-react';
import { stockAPI } from '../../services/api';
import { useApp } from '../../context/AppContext';

const POPULAR = ['AAPL', 'MSFT', 'NVDA', 'TSLA', 'GOOGL', 'AMZN', 'META', 'AMD', 'PLTR', 'SPY'];

export default function StockSearch({ onSelect, placeholder = 'Search stocks...' }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const inputRef = useRef(null);
  const containerRef = useRef(null);
  const { navigateToStock } = useApp();

  useEffect(() => {
    const handler = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  useEffect(() => {
    if (!query.trim()) { setResults([]); return; }
    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const { data } = await stockAPI.search(query.toUpperCase());
        setResults(data.results || []);
      } catch { setResults([]); }
      finally { setLoading(false); }
    }, 300);
    return () => clearTimeout(timer);
  }, [query]);

  const handleSelect = (symbol) => {
    setQuery('');
    setOpen(false);
    if (onSelect) onSelect(symbol);
    else navigateToStock(symbol);
  };

  return (
    <div ref={containerRef} className="relative w-full max-w-md">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
        <input
          ref={inputRef}
          value={query}
          onChange={e => { setQuery(e.target.value); setOpen(true); }}
          onFocus={() => setOpen(true)}
          placeholder={placeholder}
          className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-9 pr-9 py-2.5 text-sm text-slate-100 placeholder-slate-400 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500/50 transition-all"
        />
        {query && (
          <button onClick={() => { setQuery(''); setResults([]); }} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200">
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {open && (
        <div className="absolute top-full mt-2 w-full bg-slate-800 border border-slate-700 rounded-xl shadow-xl z-50 overflow-hidden">
          {loading && (
            <div className="px-4 py-3 text-slate-400 text-sm">Searching...</div>
          )}
          {!loading && results.length > 0 && (
            <ul>
              {results.map(r => (
                <li key={r.symbol}>
                  <button
                    onClick={() => handleSelect(r.symbol)}
                    className="w-full flex items-center justify-between px-4 py-3 hover:bg-slate-700 transition-colors text-left"
                  >
                    <div>
                      <span className="font-semibold text-sky-400">{r.symbol}</span>
                      <span className="ml-2 text-slate-300 text-sm">{r.name}</span>
                    </div>
                    <span className="text-slate-500 text-xs">{r.exchange}</span>
                  </button>
                </li>
              ))}
            </ul>
          )}
          {!loading && query && results.length === 0 && (
            <div className="px-4 py-3">
              <button
                onClick={() => handleSelect(query.toUpperCase())}
                className="w-full text-left text-sm text-slate-300 hover:text-sky-400"
              >
                Search for <span className="font-bold text-sky-400">{query.toUpperCase()}</span>
              </button>
            </div>
          )}
          {!query && (
            <div className="p-3">
              <p className="text-xs text-slate-500 px-1 mb-2 flex items-center gap-1">
                <TrendingUp className="h-3 w-3" /> Popular
              </p>
              <div className="flex flex-wrap gap-2">
                {POPULAR.map(sym => (
                  <button
                    key={sym}
                    onClick={() => handleSelect(sym)}
                    className="px-2.5 py-1 bg-slate-700 hover:bg-sky-600 rounded-lg text-xs font-medium text-slate-300 hover:text-white transition-colors"
                  >
                    {sym}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
