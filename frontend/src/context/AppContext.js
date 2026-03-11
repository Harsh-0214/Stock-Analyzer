import React, { createContext, useContext, useState, useCallback } from 'react';
import { watchlistAPI } from '../services/api';

const AppContext = createContext(null);

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
      const { data } = await watchlistAPI.getAll();
      setWatchlist(data);
    } catch (e) {
      addNotification('Failed to load watchlist', 'error');
    } finally {
      setWatchlistLoading(false);
    }
  }, [addNotification]);

  const addToWatchlist = useCallback(async (symbol, notes = '', targetPrice = null, buyPrice = null) => {
    try {
      await watchlistAPI.add({ symbol, notes, target_price: targetPrice, buy_price: buyPrice });
      addNotification(`${symbol} added to watchlist`);
      await loadWatchlist();
    } catch (e) {
      addNotification(e.response?.data?.detail || `Failed to add ${symbol}`, 'error');
    }
  }, [addNotification, loadWatchlist]);

  const removeFromWatchlist = useCallback(async (symbol) => {
    try {
      await watchlistAPI.remove(symbol);
      addNotification(`${symbol} removed from watchlist`);
      setWatchlist(prev => prev.filter(w => w.symbol !== symbol));
    } catch (e) {
      addNotification(`Failed to remove ${symbol}`, 'error');
    }
  }, [addNotification]);

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
      loadWatchlist, addToWatchlist, removeFromWatchlist, isInWatchlist,
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
