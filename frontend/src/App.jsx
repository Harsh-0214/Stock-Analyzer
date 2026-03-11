import { useEffect } from 'react';
import { BarChart2, BookOpen, Eye, Activity, TrendingUp, CheckCircle, AlertCircle, Bitcoin } from 'lucide-react';
import { AppProvider, useApp } from './context/AppContext';
import Dashboard from './components/Dashboard/Dashboard';
import StockDetail from './components/StockDetail/StockDetail';
import Watchlist from './components/Watchlist/Watchlist';
import Education from './components/Education/Education';
import FearGreedGauge from './components/FearGreed/FearGreedGauge';
import CryptoDashboard from './components/Crypto/CryptoDashboard';
import StockSearch from './components/common/StockSearch';

const navItems = [
  { id: 'dashboard', label: 'Dashboard', icon: BarChart2 },
  { id: 'crypto',    label: 'Crypto',     icon: Bitcoin },
  { id: 'feargreed', label: 'Fear & Greed', icon: Activity },
  { id: 'watchlist', label: 'Watchlist', icon: Eye },
  { id: 'education', label: 'Education', icon: BookOpen },
];

function NotificationToast({ notification }) {
  const isError = notification.type === 'error';
  return (
    <div className={`flex items-center gap-3 px-4 py-3 rounded-xl border shadow-xl text-sm font-medium max-w-xs ${
      isError
        ? 'bg-red-950 border-red-700/50 text-red-200'
        : 'bg-emerald-950 border-emerald-700/50 text-emerald-200'
    }`}>
      {isError
        ? <AlertCircle className="h-4 w-4 text-red-400 flex-shrink-0" />
        : <CheckCircle className="h-4 w-4 text-emerald-400 flex-shrink-0" />
      }
      {notification.message}
    </div>
  );
}

function AppContent() {
  const { activeTab, setActiveTab, selectedStock, notifications, loadWatchlist } = useApp();

  useEffect(() => { loadWatchlist(); }, [loadWatchlist]);

  const renderContent = () => {
    if (activeTab === 'stock' && selectedStock) {
      return <StockDetail symbol={selectedStock} />;
    }
    switch (activeTab) {
      case 'dashboard':  return <Dashboard />;
      case 'crypto':     return <CryptoDashboard />;
      case 'feargreed':  return <FearGreedGauge />;
      case 'watchlist':  return <Watchlist />;
      case 'education':  return <Education />;
      default:           return <Dashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col">
      {/* Top Nav */}
      <header className="bg-slate-900/95 backdrop-blur-sm border-b border-slate-800 sticky top-0 z-40">
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6">
          <div className="flex items-center h-16 gap-6">
            {/* Logo */}
            <button onClick={() => setActiveTab('dashboard')} className="flex items-center gap-2.5 flex-shrink-0">
              <div className="w-8 h-8 bg-gradient-to-br from-sky-400 to-violet-500 rounded-lg flex items-center justify-center">
                <TrendingUp className="h-4.5 w-4.5 text-white" />
              </div>
              <span className="font-black text-lg text-slate-100">StockIQ</span>
            </button>

            {/* Desktop Nav */}
            <nav className="hidden md:flex items-center gap-1">
              {navItems.map(item => (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    activeTab === item.id
                      ? 'bg-sky-600/20 text-sky-400'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                  }`}
                >
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </button>
              ))}
            </nav>

            {/* Search */}
            <div className="flex-1 max-w-sm ml-auto">
              <StockSearch placeholder="Search..." />
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 max-w-screen-2xl mx-auto w-full px-4 sm:px-6 py-6">
        {renderContent()}
      </main>

      {/* Bottom mobile nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-slate-900/95 backdrop-blur-sm border-t border-slate-800 z-40">
        <div className="flex">
          {navItems.map(item => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex-1 flex flex-col items-center py-3 gap-1 text-xs font-medium transition-colors ${
                activeTab === item.id ? 'text-sky-400' : 'text-slate-500'
              }`}
            >
              <item.icon className="h-5 w-5" />
              {item.label}
            </button>
          ))}
        </div>
      </nav>

      {/* Notification toasts */}
      <div className="fixed bottom-20 md:bottom-6 right-6 z-50 flex flex-col gap-2">
        {notifications.map(n => (
          <NotificationToast key={n.id} notification={n} />
        ))}
      </div>
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
