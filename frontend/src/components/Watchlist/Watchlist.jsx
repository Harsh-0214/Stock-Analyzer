import { useEffect, useState } from 'react';
import { Plus, Trash2, Edit3, Eye, Target, DollarSign, StickyNote, RefreshCw } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { watchlistAPI } from '../../services/api';
import PriceChange from '../common/PriceChange';
import LoadingSpinner from '../common/LoadingSpinner';
import StockSearch from '../common/StockSearch';

function formatMC(mc) {
  if (!mc) return '—';
  if (mc >= 1e12) return `$${(mc / 1e12).toFixed(1)}T`;
  if (mc >= 1e9) return `$${(mc / 1e9).toFixed(1)}B`;
  return `$${(mc / 1e6).toFixed(0)}M`;
}

function AddStockModal({ onClose }) {
  const { addToWatchlist } = useApp();
  const [symbol, setSymbol] = useState('');
  const [notes, setNotes] = useState('');
  const [buyPrice, setBuyPrice] = useState('');
  const [targetPrice, setTargetPrice] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!symbol) return;
    setSubmitting(true);
    await addToWatchlist(symbol, notes, targetPrice ? parseFloat(targetPrice) : null, buyPrice ? parseFloat(buyPrice) : null);
    setSubmitting(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-slate-900 rounded-2xl border border-slate-700 w-full max-w-md p-6">
        <h2 className="text-lg font-bold text-slate-100 mb-4">Add to Watchlist</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs text-slate-400 mb-1.5 block">Stock Symbol</label>
            <StockSearch onSelect={setSymbol} placeholder="Search or type symbol..." />
            {symbol && <p className="text-sm text-sky-400 mt-1">Selected: <strong>{symbol}</strong></p>}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-slate-400 mb-1.5 block flex items-center gap-1">
                <DollarSign className="h-3 w-3" /> Buy Price
              </label>
              <input value={buyPrice} onChange={e => setBuyPrice(e.target.value)} type="number" step="0.01"
                placeholder="0.00" className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-sky-500" />
            </div>
            <div>
              <label className="text-xs text-slate-400 mb-1.5 block flex items-center gap-1">
                <Target className="h-3 w-3" /> Target Price
              </label>
              <input value={targetPrice} onChange={e => setTargetPrice(e.target.value)} type="number" step="0.01"
                placeholder="0.00" className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-sky-500" />
            </div>
          </div>
          <div>
            <label className="text-xs text-slate-400 mb-1.5 block flex items-center gap-1">
              <StickyNote className="h-3 w-3" /> Notes
            </label>
            <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={2}
              placeholder="Why are you watching this stock?"
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-sky-500 resize-none" />
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose}
              className="flex-1 px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-xl text-sm text-slate-300 transition-colors">
              Cancel
            </button>
            <button type="submit" disabled={!symbol || submitting}
              className="flex-1 px-4 py-2 bg-sky-600 hover:bg-sky-500 disabled:opacity-50 rounded-xl text-sm text-white font-medium transition-colors">
              {submitting ? 'Adding...' : 'Add to Watchlist'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function EditModal({ item, onClose, onSave }) {
  const [notes, setNotes] = useState(item.notes || '');
  const [buyPrice, setBuyPrice] = useState(item.buy_price || '');
  const [targetPrice, setTargetPrice] = useState(item.target_price || '');

  const handleSave = async () => {
    await watchlistAPI.update(item.symbol, {
      notes,
      buy_price: buyPrice ? parseFloat(buyPrice) : null,
      target_price: targetPrice ? parseFloat(targetPrice) : null,
    });
    onSave();
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-slate-900 rounded-2xl border border-slate-700 w-full max-w-md p-6">
        <h2 className="text-lg font-bold text-slate-100 mb-4">Edit {item.symbol}</h2>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-slate-400 mb-1.5 block">Buy Price</label>
              <input value={buyPrice} onChange={e => setBuyPrice(e.target.value)} type="number" step="0.01"
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-sky-500" />
            </div>
            <div>
              <label className="text-xs text-slate-400 mb-1.5 block">Target Price</label>
              <input value={targetPrice} onChange={e => setTargetPrice(e.target.value)} type="number" step="0.01"
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-sky-500" />
            </div>
          </div>
          <div>
            <label className="text-xs text-slate-400 mb-1.5 block">Notes</label>
            <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={3}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-sky-500 resize-none" />
          </div>
          <div className="flex gap-3">
            <button onClick={onClose} className="flex-1 px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-xl text-sm text-slate-300">Cancel</button>
            <button onClick={handleSave} className="flex-1 px-4 py-2 bg-sky-600 hover:bg-sky-500 rounded-xl text-sm text-white font-medium">Save</button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Watchlist() {
  const { watchlist, watchlistLoading, loadWatchlist, removeFromWatchlist, navigateToStock } = useApp();
  const [showAdd, setShowAdd] = useState(false);
  const [editItem, setEditItem] = useState(null);

  useEffect(() => { loadWatchlist(); }, [loadWatchlist]);

  
  const gainers = watchlist.filter(w => (w.price_change_pct || 0) > 0).length;
  const losers = watchlist.filter(w => (w.price_change_pct || 0) < 0).length;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-slate-100">My Watchlist</h1>
          <p className="text-slate-400 text-sm mt-0.5">{watchlist.length} stocks tracked</p>
        </div>
        <div className="flex gap-2">
          <button onClick={loadWatchlist} disabled={watchlistLoading}
            className="p-2 rounded-xl hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors">
            <RefreshCw className={`h-4 w-4 ${watchlistLoading ? 'animate-spin' : ''}`} />
          </button>
          <button onClick={() => setShowAdd(true)}
            className="flex items-center gap-2 px-4 py-2 bg-sky-600 hover:bg-sky-500 rounded-xl text-sm font-medium text-white transition-colors">
            <Plus className="h-4 w-4" /> Add Stock
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      {watchlist.length > 0 && (
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 text-center">
            <p className="text-2xl font-bold text-slate-100">{watchlist.length}</p>
            <p className="text-xs text-slate-400 mt-1">Total Stocks</p>
          </div>
          <div className="bg-slate-900 border border-emerald-500/20 rounded-2xl p-4 text-center">
            <p className="text-2xl font-bold text-emerald-400">{gainers}</p>
            <p className="text-xs text-slate-400 mt-1">Gainers Today</p>
          </div>
          <div className="bg-slate-900 border border-red-500/20 rounded-2xl p-4 text-center">
            <p className="text-2xl font-bold text-red-400">{losers}</p>
            <p className="text-xs text-slate-400 mt-1">Losers Today</p>
          </div>
        </div>
      )}

      {/* Watchlist Table */}
      {watchlistLoading ? (
        <div className="flex items-center justify-center py-20">
          <LoadingSpinner text="Loading watchlist..." />
        </div>
      ) : watchlist.length === 0 ? (
        <div className="bg-slate-900 rounded-2xl border border-slate-800 p-16 text-center">
          <div className="text-5xl mb-4">📋</div>
          <h3 className="text-lg font-semibold text-slate-300">Your watchlist is empty</h3>
          <p className="text-slate-500 mt-2 mb-6">Add stocks to track their performance, set price targets, and never miss a move.</p>
          <button onClick={() => setShowAdd(true)}
            className="px-6 py-2.5 bg-sky-600 hover:bg-sky-500 rounded-xl text-sm font-medium text-white transition-colors">
            Add Your First Stock
          </button>
        </div>
      ) : (
        <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-800">
                  <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-5 py-3">Symbol</th>
                  <th className="text-right text-xs font-semibold text-slate-500 uppercase tracking-wider px-4 py-3">Price</th>
                  <th className="text-right text-xs font-semibold text-slate-500 uppercase tracking-wider px-4 py-3">Change</th>
                  <th className="text-right text-xs font-semibold text-slate-500 uppercase tracking-wider px-4 py-3 hidden sm:table-cell">Mkt Cap</th>
                  <th className="text-right text-xs font-semibold text-slate-500 uppercase tracking-wider px-4 py-3 hidden md:table-cell">P/E</th>
                  <th className="text-right text-xs font-semibold text-slate-500 uppercase tracking-wider px-4 py-3 hidden lg:table-cell">Buy Price</th>
                  <th className="text-right text-xs font-semibold text-slate-500 uppercase tracking-wider px-4 py-3 hidden lg:table-cell">Target</th>
                  <th className="text-right text-xs font-semibold text-slate-500 uppercase tracking-wider px-4 py-3 hidden xl:table-cell">P&L</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50">
                {watchlist.map(item => (
                  <tr key={item.symbol} className="hover:bg-slate-800/30 group transition-colors">
                    <td className="px-5 py-4">
                      <button onClick={() => navigateToStock(item.symbol)} className="text-left">
                        <p className="font-bold text-sky-400 hover:text-sky-300">{item.symbol}</p>
                        <p className="text-xs text-slate-500 truncate max-w-[140px]">{item.company_name}</p>
                        {item.notes && (
                          <p className="text-xs text-slate-600 italic truncate max-w-[140px] mt-0.5">{item.notes}</p>
                        )}
                      </button>
                    </td>
                    <td className="px-4 py-4 text-right">
                      <p className="font-semibold text-slate-100">${item.current_price?.toLocaleString() || '—'}</p>
                    </td>
                    <td className="px-4 py-4 text-right">
                      <PriceChange value={item.price_change_pct} showIcon={false} className="text-sm" />
                    </td>
                    <td className="px-4 py-4 text-right hidden sm:table-cell">
                      <p className="text-sm text-slate-300">{formatMC(item.market_cap)}</p>
                    </td>
                    <td className="px-4 py-4 text-right hidden md:table-cell">
                      <p className="text-sm text-slate-300">{item.pe_ratio?.toFixed(1) || '—'}</p>
                    </td>
                    <td className="px-4 py-4 text-right hidden lg:table-cell">
                      <p className="text-sm text-slate-300">{item.buy_price ? `$${item.buy_price}` : '—'}</p>
                    </td>
                    <td className="px-4 py-4 text-right hidden lg:table-cell">
                      {item.target_price ? (
                        <div>
                          <p className="text-sm text-slate-300">${item.target_price}</p>
                          {item.upside_pct != null && (
                            <p className={`text-xs ${item.upside_pct >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                              {item.upside_pct > 0 ? '+' : ''}{item.upside_pct?.toFixed(1)}% upside
                            </p>
                          )}
                        </div>
                      ) : '—'}
                    </td>
                    <td className="px-4 py-4 text-right hidden xl:table-cell">
                      {item.pnl_pct != null ? (
                        <span className={`text-sm font-semibold ${item.pnl_pct >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                          {item.pnl_pct > 0 ? '+' : ''}{item.pnl_pct?.toFixed(2)}%
                        </span>
                      ) : '—'}
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => navigateToStock(item.symbol)}
                          className="p-1.5 rounded-lg hover:bg-slate-700 text-slate-400 hover:text-sky-400">
                          <Eye className="h-4 w-4" />
                        </button>
                        <button onClick={() => setEditItem(item)}
                          className="p-1.5 rounded-lg hover:bg-slate-700 text-slate-400 hover:text-amber-400">
                          <Edit3 className="h-4 w-4" />
                        </button>
                        <button onClick={() => removeFromWatchlist(item.symbol)}
                          className="p-1.5 rounded-lg hover:bg-slate-700 text-slate-400 hover:text-red-400">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {showAdd && <AddStockModal onClose={() => setShowAdd(false)} />}
      {editItem && <EditModal item={editItem} onClose={() => setEditItem(null)} onSave={loadWatchlist} />}
    </div>
  );
}
