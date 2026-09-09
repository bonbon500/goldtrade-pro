import React from 'react';
import { Smartphone, Code, RefreshCw, Settings, History, ShieldCheck, Home } from 'lucide-react';
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
  onForceUpdateApp?: () => void;
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
  onForceUpdateApp,
  settings,
  cartCount,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-slate-900 border-b border-amber-500/20 shadow-xl backdrop-blur-md bg-slate-900/95 text-slate-100">
      {/* Top Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14 sm:h-16">
          {/* Logo & Business Name */}
          <div
            onClick={onGoToDashboard}
            className="flex items-center gap-2.5 cursor-pointer group"
            title="חזור לדשבורד הראשי"
          >
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-amber-400 via-amber-500 to-yellow-600 flex items-center justify-center shadow-lg shadow-amber-500/20 border border-amber-300/30 group-hover:scale-105 transition-transform shrink-0">
              <span className="text-lg sm:text-xl font-black text-slate-950 tracking-tighter">Au</span>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h1 className="text-sm sm:text-lg font-bold text-amber-300 tracking-tight leading-none group-hover:text-amber-200 transition-colors truncate max-w-[140px] sm:max-w-xs">
                  {settings.businessName || 'GoldTrade Pro'}
                </h1>
                <span className="bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[9px] sm:text-[10px] px-1.5 py-0.2 rounded-full font-bold">
                  v2.6
                </span>
              </div>
              <p className="text-[10px] sm:text-xs text-slate-400 font-normal truncate max-w-[140px] sm:max-w-xs">
                {settings.dealerName || 'סוחר מורשה'}
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* Force Update / Refresh Button for Mobile Cache Clearing */}
            {onForceUpdateApp && (
              <button
                type="button"
                onClick={onForceUpdateApp}
                id="btn-force-update"
                className="flex items-center gap-1 bg-slate-800 hover:bg-slate-700 border border-amber-500/30 text-amber-300 px-2 sm:px-2.5 py-1.5 rounded-xl text-xs font-semibold transition-all active:scale-95"
                title="נקה זיכרון מטמון ורענן לגרסה העדכנית ביותר מהשרת"
              >
                <RefreshCw className="w-3.5 h-3.5 text-amber-400" />
                <span className="text-[11px]">רענן גרסה</span>
              </button>
            )}

            {/* Live Rates Badge Button */}
            <button
              onClick={onOpenRatesModal}
              id="btn-open-rates-modal"
              className="flex items-center gap-1.5 bg-gradient-to-r from-amber-500/20 via-amber-500/10 to-transparent hover:bg-amber-500/20 border border-amber-500/40 text-amber-300 px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all active:scale-95"
              title="פתח לוח שערי זהב ודולר בלייב"
            >
              <span className="flex h-2 w-2 relative shrink-0">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="hidden sm:inline">שערי לייב</span>
            </button>

            {/* Desktop Only Buttons */}
            {onGoToDashboard && (
              <button
                type="button"
                onClick={onGoToDashboard}
                id="btn-go-home"
                className="hidden md:flex items-center gap-1.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black px-3 py-1.5 rounded-xl text-xs transition-all active:scale-95 shadow-md shadow-amber-500/20"
                title="דף הבית - חזור לדשבורד"
              >
                <Home className="w-4 h-4 stroke-[2.5]" />
                <span>דף הבית</span>
              </button>
            )}

            <button
              onClick={onOpenHistory}
              id="btn-open-history"
              className="hidden md:flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all active:scale-95"
              title="היסטוריית עסקאות"
            >
              <History className="w-3.5 h-3.5 text-amber-400" />
              <span>עסקאות</span>
            </button>

            <button
              onClick={onOpenSettings}
              id="btn-open-settings"
              className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-750 border border-slate-700 hover:border-amber-500/40 text-slate-200 px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-semibold transition-all active:scale-95 shadow-sm"
              title="הגדרות סוחר ופרטי עסק"
            >
              <Settings className="w-4 h-4 text-amber-400" />
              <span className="text-[11px] sm:text-xs">הגדרות</span>
            </button>
          </div>
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
