import React, { useState } from 'react';
import { Coins, Gem, ArrowLeft, ExternalLink } from 'lucide-react';
import { RatesData, BusinessSettings } from '../types';

interface DealerDashboardProps {
  settings: BusinessSettings;
  rates: RatesData | null;
  onStartNewDeal: (category: 'gold' | 'diamond') => void;
  onOpenRatesModal: () => void;
  onOpenSettings: () => void;
}

export const DealerDashboard: React.FC<DealerDashboardProps> = ({
  settings,
  rates,
  onStartNewDeal,
  onOpenRatesModal,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<'gold' | 'diamond'>('gold');

  const gold24k = rates?.gold24kPerGramIls || 315.2;

  return (
    <div className="space-y-4 dir-rtl max-w-2xl mx-auto pb-10">
      {/* 1. Top Row with Live Rates */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl space-y-3">
        <div className="flex items-center justify-between border-b border-slate-800/80 pb-2.5">
          <div className="flex items-center gap-2">
            <Coins className="w-4 h-4 text-amber-400" />
            <span className="text-xs font-bold text-slate-200">שערי זהב ודולר לייב</span>
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping mr-1"></span>
          </div>
          <div className="flex items-center gap-2">
            <a
              href="https://il.investing.com/currencies/usd-ils"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[11px] text-slate-400 hover:text-amber-300 font-medium bg-slate-950 border border-slate-800 hover:border-amber-500/40 px-2.5 py-1 rounded-lg transition-all flex items-center gap-1.5"
              title="צפה בשערי דולר וזהב באתר Investing.com"
            >
              <span>Investing.com</span>
              <ExternalLink className="w-3 h-3 text-amber-400" />
            </a>
            <button
              type="button"
              onClick={onOpenRatesModal}
              className="text-[11px] text-amber-400 hover:text-amber-300 font-bold bg-amber-500/10 border border-amber-500/20 px-2.5 py-1 rounded-lg transition-all"
            >
              ערוך שערים
            </button>
          </div>
        </div>

        {/* Live Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-6 gap-2 text-center text-xs">
          <a
            href="https://il.investing.com/currencies/xau-usd"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-slate-950 hover:bg-slate-900 p-2.5 rounded-xl border border-slate-800 hover:border-amber-500/60 transition-all cursor-pointer group block shadow-inner"
            title="ספוט זהב עולמי (XAU/USD)"
          >
            <span className="text-[10px] text-slate-400 group-hover:text-amber-300 flex items-center justify-center gap-1">
              <span>XAU/USD (זהב)</span>
              <ExternalLink className="w-2.5 h-2.5 opacity-60" />
            </span>
            <strong className="text-amber-300 font-mono text-sm block my-0.5">${rates?.xauUsd?.toFixed(2) || '---'}</strong>
            <span className="text-[9px] text-amber-500/80 block">Investing.com ↗</span>
          </a>

          <a
            href="https://il.investing.com/currencies/usd-ils"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-slate-950 hover:bg-slate-900 p-2.5 rounded-xl border border-slate-800 hover:border-amber-500/60 transition-all cursor-pointer group block shadow-inner"
            title="שער דולר/שקל רציף (USD/ILS)"
          >
            <span className="text-[10px] text-slate-400 group-hover:text-amber-300 flex items-center justify-center gap-1">
              <span>USD/ILS (דולר)</span>
              <ExternalLink className="w-2.5 h-2.5 opacity-60" />
            </span>
            <strong className="text-slate-200 font-mono text-sm block my-0.5">₪{rates?.usdIls?.toFixed(3) || '---'}</strong>
            <span className="text-[9px] text-amber-500/80 block">Investing.com ↗</span>
          </a>

          <div className="bg-slate-950 p-2.5 rounded-xl border border-amber-500/30 shadow-inner">
            <span className="text-[10px] text-amber-400 block font-bold">24K (גרם)</span>
            <strong className="text-amber-300 font-mono text-sm">₪{gold24k.toFixed(2)}</strong>
          </div>

          <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800 shadow-inner">
            <span className="text-[10px] text-slate-400 block">18K (גרם)</span>
            <strong className="text-slate-200 font-mono text-sm">₪{(gold24k * 0.75).toFixed(2)}</strong>
          </div>

          <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800 shadow-inner">
            <span className="text-[10px] text-slate-400 block">14K (גרם)</span>
            <strong className="text-slate-200 font-mono text-sm">₪{(gold24k * 0.585).toFixed(2)}</strong>
          </div>

          <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800 shadow-inner">
            <span className="text-[10px] text-slate-400 block">9K (גרם)</span>
            <strong className="text-slate-200 font-mono text-sm">₪{(gold24k * 0.375).toFixed(2)}</strong>
          </div>
        </div>
      </div>

      {/* 2. Compact Deal Selection - Single Row / Dropdown Window */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-3 sm:p-4 shadow-xl space-y-2.5">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
            <span>בחר סוג עסקה:</span>
          </span>
          <span className="text-[11px] text-slate-400">
            {selectedCategory === 'gold' ? '24K, 18K, 14K, 9K (ספוט בלייב)' : 'B2B סוחרים / אדם פרטי'}
          </span>
        </div>

        {/* Single Row: Selection Dropdown & Start Button */}
        <div className="flex items-center gap-2">
          <div className="flex-1 relative bg-slate-950 border border-slate-800 hover:border-slate-700 rounded-xl transition-all">
            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-base">
              {selectedCategory === 'gold' ? '🪙' : '💎'}
            </div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value as 'gold' | 'diamond')}
              aria-label="בחר סוג עסקה"
              className="w-full bg-transparent text-white font-black text-xs sm:text-sm py-2.5 pr-9 pl-4 appearance-none focus:outline-none cursor-pointer"
            >
              <option value="gold" className="bg-slate-900 text-amber-300 font-bold">
                🪙 עסקת זהב (קראט וספוט חי)
              </option>
              <option value="diamond" className="bg-slate-900 text-cyan-300 font-bold">
                💎 עסקת יהלומים ותכשיטים (B2B / פרטי)
              </option>
            </select>
          </div>

          <button
            type="button"
            onClick={() => onStartNewDeal(selectedCategory)}
            className={`py-2.5 px-4 sm:px-6 rounded-xl font-black text-xs sm:text-sm flex items-center justify-center gap-2 transition-all shadow-lg active:scale-[0.98] shrink-0 ${
              selectedCategory === 'gold'
                ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-amber-500/20'
                : 'bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow-cyan-500/20'
            }`}
          >
            <span>התחל עסקה</span>
            <ArrowLeft className="w-4 h-4 stroke-[3]" />
          </button>
        </div>
      </div>
    </div>
  );
};

