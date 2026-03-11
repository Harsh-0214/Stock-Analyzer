import React, { createContext, useContext, useState, useCallback } from 'react';
import { stockAPI } from '../services/api';

const AppContext = createContext(null);
const STORAGE_KEY = 'stock_watchlist';

function getStoredItems() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
  } catch {
    return [];
  }
}

function saveItems(items) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

export function AppProvider({ children }) {
  const [watchlist, setWatchlist] = useState([]);
  const [watchlistLoading, setWatchlistLoading] = useState(false);
  const [selectedStock, setSelectedStock] = useState(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [notifications, setNotifications] = useState([]);

  const addNotification = useCallback((message, type = 'success') => {
    const id = Date.now();
    setNotifications(prev => [...prev, { id, message, type }]);
    setTimeout(() => setNotifications(prev => prev.filter(n => n.id !== id)), 4000);
  }, []);

  const loadWatchlist = useCallback(async () => {
    setWatchlistLoading(true);
    try {
      const stored = getStoredItems();
      if (stored.length === 0) {
        setWatchlist([]);
        return;
      }
      const results = await Promise.all(
        stored.map(async (item) => {
          try {
            const { data } = await stockAPI.getInfo(item.symbol);
            const currentPrice = data.current_price;
            const pnl_pct = item.buy_price && currentPrice
              ? ((currentPrice - item.buy_price) / item.buy_price) * 100
              : null;
            const upside_pct = item.target_price && currentPrice
              ? ((item.target_price - currentPrice) / currentPrice) * 100
              : null;
            return {
              ...item,
              company_name: data.company_name || item.company_name,
              current_price: currentPrice,
              price_change_pct: data.price_change_pct,
              market_cap: data.market_cap,
              pe_ratio: data.pe_ratio,
              pnl_pct,
              upside_pct,
            };
          } catch {
            return { ...item, current_price: null };
          }
        })
      );
      setWatchlist(results);
    } catch (e) {
      addNotification('Failed to load watchlist', 'error');
    } finally {
      setWatchlistLoading(false);
    }
  }, [addNotification]);

  const addToWatchlist = useCallback(async (symbol, notes = '', targetPrice = null, buyPrice = null) => {
    const upper = symbol.toUpperCase();
    const stored = getStoredItems();
    if (stored.some(i => i.symbol === upper)) {
      addNotification(`${upper} is already in your watchlist`, 'error');
      return;
    }
    try {
      const { data } = await stockAPI.getInfo(upper);
      const newItem = {
        symbol: upper,
        company_name: data.company_name || upper,
        added_at: new Date().toISOString(),
        notes,
        target_price: targetPrice,
        buy_price: buyPrice,
      };
      saveItems([...stored, newItem]);
      addNotification(`${upper} added to watchlist`);
      await loadWatchlist();
    } catch (e) {
      addNotification(`Failed to add ${upper}: stock not found`, 'error');
    }
  }, [addNotification, loadWatchlist]);

  const removeFromWatchlist = useCallback((symbol) => {
    const stored = getStoredItems();
    saveItems(stored.filter(i => i.symbol !== symbol));
    setWatchlist(prev => prev.filter(w => w.symbol !== symbol));
    addNotification(`${symbol} removed from watchlist`);
  }, [addNotification]);

  const updateWatchlistItem = useCallback(async (symbol, { notes, buy_price, target_price }) => {
    const stored = getStoredItems();
    const updated = stored.map(i =>
      i.symbol === symbol ? { ...i, notes, buy_price, target_price } : i
    );
    saveItems(updated);
    addNotification(`${symbol} updated`);
    await loadWatchlist();
  }, [addNotification, loadWatchlist]);

  const isInWatchlist = useCallback((symbol) => {
    return watchlist.some(w => w.symbol === symbol?.toUpperCase());
  }, [watchlist]);

  const navigateToStock = useCallback((symbol) => {
    setSelectedStock(symbol);
    setActiveTab('stock');
  }, []);

  return (
    <AppContext.Provider value={{
      watchlist, watchlistLoading,
      loadWatchlist, addToWatchlist, removeFromWatchlist, updateWatchlistItem, isInWatchlist,
      selectedStock, setSelectedStock,
      activeTab, setActiveTab,
      notifications,
      navigateToStock,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export const useApp = () => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
};
