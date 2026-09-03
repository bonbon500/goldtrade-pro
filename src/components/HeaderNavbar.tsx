import React from 'react';
import { Smartphone, Code, RefreshCw, Settings, History, ShieldCheck, Palette, Home } from 'lucide-react';
import { RatesData, BusinessSettings } from '../types';

interface HeaderNavbarProps {
  mode: 'app' | 'flutterflow';
  setMode: (mode: 'app' | 'flutterflow') => void;
  rates: RatesData | null;
  loadingRates: boolean;
  onRefreshRates: () => void;
  onOpenRatesModal: () => void;
  onOpenSettings: () => void;
  onOpenHistory: () => void;
  onGoToDashboard?: () => void;
  settings: BusinessSettings;
  cartCount: number;
}

export const HeaderNavbar: React.FC<HeaderNavbarProps> = ({
  mode,
  setMode,
  rates,
  loadingRates,
  onRefreshRates,
  onOpenRatesModal,
  onOpenSettings,
  onOpenHistory,
  onGoToDashboard,
  settings,
  cartCount,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-slate-900 border-b border-amber-500/20 shadow-xl backdrop-blur-md bg-slate-900/95 text-slate-100">
      {/* Top Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Business Name */}
          <div
            onClick={onGoToDashboard}
            className="flex items-center gap-3 cursor-pointer group"
            title="חזור לדשבורד הראשי"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 via-amber-500 to-yellow-600 flex items-center justify-center shadow-lg shadow-amber-500/20 border border-amber-300/30 group-hover:scale-105 transition-transform">
              <span className="text-xl font-black text-slate-950 tracking-tighter">Au</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-bold text-amber-300 tracking-tight leading-none group-hover:text-amber-200 transition-colors">
                  {settings.businessName || 'GoldTrade Pro'}
                </h1>
                <span className="bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] px-1.5 py-0.5 rounded-full font-medium">
                  FIELD VER. 2.5
                </span>
              </div>
              <p className="text-xs text-slate-400 font-normal">
                מערכת זהב בשטח &bull; {settings.dealerName || 'סוחר מורשה'}
              </p>
            </div>
          </div>

          {/* Mode Switcher Tabs */}
          <div className="hidden md:flex items-center p-1 bg-slate-800/80 rounded-xl border border-slate-700">
            <button
              onClick={() => setMode('app')}
              id="tab-app-mode"
              className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${
                mode === 'app'
                  ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-bold shadow-md'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              <Smartphone className="w-4 h-4" />
              <span>אפליקציית שטח</span>
              {cartCount > 0 && (
                <span className="bg-slate-950 text-amber-400 text-xs px-2 py-0.5 rounded-full font-bold">
                  {cartCount}
                </span>
              )}
            </button>
            <button
              onClick={() => setMode('flutterflow')}
              id="tab-flutterflow-mode"
              className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${
                mode === 'flutterflow'
                  ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-bold shadow-md'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              <Code className="w-4 h-4" />
              <span>מפרט FlutterFlow</span>
            </button>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            {onGoToDashboard && (
              <button
                type="button"
                onClick={onGoToDashboard}
                id="btn-go-home"
                className="flex items-center gap-1.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black px-3 py-1.5 rounded-xl text-xs transition-all active:scale-95 shadow-md shadow-amber-500/20"
                title="דף הבית - חזור לדשבורד"
              >
                <Home className="w-4 h-4 stroke-[2.5]" />
                <span className="hidden sm:inline">דף הבית</span>
              </button>
            )}

            <button
              onClick={onOpenRatesModal}
              id="btn-open-rates-modal"
              className="flex items-center gap-1.5 bg-gradient-to-r from-amber-500/20 via-amber-500/10 to-transparent hover:bg-amber-500/20 border border-amber-500/40 text-amber-300 px-3 py-1.5 rounded-xl text-xs font-bold transition-all active:scale-95"
              title="פתח לוח שערי זהב ודולר בלייב"
            >
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span>שערי לייב</span>
            </button>

            <button
              onClick={onRefreshRates}
              disabled={loadingRates}
              id="btn-refresh-rates"
              className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-amber-400 p-2 sm:px-3 sm:py-1.5 rounded-xl text-xs font-semibold transition-all active:scale-95 disabled:opacity-50"
              title="רענן שערי זהב ודולר"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loadingRates ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">רענן</span>
            </button>

            <button
              onClick={onOpenHistory}
              id="btn-open-history"
              className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all active:scale-95"
              title="היסטוריית עסקאות"
            >
              <History className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden sm:inline">עסקאות</span>
            </button>

            <button
              onClick={onOpenSettings}
              id="btn-open-design-theme"
              className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 border border-amber-500/30 text-amber-300 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all active:scale-95"
              title="בחר סגנון עיצוב וערכת נושא"
            >
              <Palette className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden sm:inline">סגנון עיצוב</span>
            </button>

            <button
              onClick={onOpenSettings}
              id="btn-open-settings"
              className="flex items-center justify-center w-9 h-9 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 rounded-xl transition-all active:scale-95"
              title="הגדרות סוחר ו-API"
            >
              <Settings className="w-4 h-4 text-slate-300" />
            </button>
          </div>
        </div>

        {/* Mobile View Mode Switcher */}
        <div className="flex md:hidden items-center justify-center p-1 my-2 bg-slate-800/90 rounded-xl border border-slate-700/80">
          <button
            onClick={() => setMode('app')}
            className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
              mode === 'app'
                ? 'bg-amber-500 text-slate-950 shadow-sm'
                : 'text-slate-300'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>אפליקציית שטח</span>
            {cartCount > 0 && (
              <span className="bg-slate-950 text-amber-400 text-[10px] px-1.5 py-0.2 rounded-full">
                {cartCount}
              </span>
            )}
          </button>
          <button
            onClick={() => setMode('flutterflow')}
            className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
              mode === 'flutterflow'
                ? 'bg-amber-500 text-slate-950 shadow-sm'
                : 'text-slate-300'
            }`}
          >
            <Code className="w-3.5 h-3.5" />
            <span>מפרט FlutterFlow</span>
          </button>
        </div>

        {/* Live Exchange Ticker Strip */}
        <div
          onClick={onOpenRatesModal}
          className="py-2 border-t border-slate-800/80 text-xs flex items-center justify-between overflow-x-auto gap-4 no-scrollbar text-slate-300 cursor-pointer hover:bg-slate-800/50 transition-all px-1"
          title="לחץ לפתיחת הלוח המלא של השערים"
        >
          <div className="flex items-center gap-4 min-w-max">
            <a
              href="https://il.investing.com/currencies/xau-usd"
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="flex items-center gap-1.5 font-medium text-emerald-400 hover:text-emerald-300 hover:underline cursor-pointer"
              title="לחץ לצפייה בספוט זהב חי ב-Investing.com"
            >
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              XAU/USD: <strong className="text-white font-bold">${rates?.xauUsd?.toFixed(2) || '---'}</strong>
            </a>
            <span className="text-slate-600">|</span>
            <a
              href="https://il.investing.com/currencies/usd-ils"
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="font-medium text-amber-300 hover:text-amber-200 hover:underline cursor-pointer"
              title="לחץ לצפייה בשער דולר/שקל רציף ב-Investing.com"
            >
              USD/ILS: <strong className="text-white font-bold">₪{rates?.usdIls?.toFixed(3) || '---'}</strong>
            </a>
            <span className="text-slate-600">|</span>
            <span className="font-medium text-amber-400">
              זהב 24K: <strong className="text-amber-300 font-bold">₪{rates?.gold24kPerGramIls?.toFixed(2) || '315.20'}/גרם</strong>
            </span>
            <span className="text-slate-600">|</span>
            <span className="text-slate-400 text-[11px]">
              זהב 18K: <span className="text-slate-200 font-semibold">₪{rates?.purityRatesIls?.['18K']?.toFixed(2) || '236.40'}</span>
            </span>
            <span className="text-slate-600">|</span>
            <span className="text-slate-400 text-[11px]">
              זהב 14K: <span className="text-slate-200 font-semibold">₪{rates?.purityRatesIls?.['14K']?.toFixed(2) || '183.87'}</span>
            </span>
          </div>

          <div className="text-[11px] text-slate-400 flex items-center gap-1 min-w-max">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 inline" />
            <span>מקור: {rates?.sources?.gold || 'בזמן אמת'}</span>
          </div>
        </div>
      </div>
    </header>
  );
};
