import React, { useState } from 'react';
import { Coins, Gem, ArrowLeft, ExternalLink, Check } from 'lucide-react';
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

      {/* 2. Deal Selection in a Scroll Window */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xl space-y-3">
        <div className="border-b border-slate-800/80 pb-2">
          <h3 className="text-xs sm:text-sm font-bold text-slate-200">בחר סוג עסקה חדשה:</h3>
          <p className="text-[11px] text-slate-400">גלול ובחר את סוג הפריטים בעסקה</p>
        </div>

        {/* Scrollable Deal Type Picker Window */}
        <div className="max-h-56 overflow-y-auto space-y-2.5 p-1 no-scrollbar">
          {/* Option A: Gold Deal */}
          <div
            onClick={() => setSelectedCategory('gold')}
            className={`p-3.5 rounded-2xl border cursor-pointer transition-all flex items-center justify-between ${
              selectedCategory === 'gold'
                ? 'bg-amber-500/15 border-amber-500/60 shadow-lg shadow-amber-500/10'
                : 'bg-slate-950/70 border-slate-800 hover:border-slate-700'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className={`p-2.5 rounded-xl border ${
                selectedCategory === 'gold'
                  ? 'bg-amber-500 text-slate-950 border-amber-400 font-bold'
                  : 'bg-slate-900 text-amber-400 border-slate-800'
              }`}>
                <Coins className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className={`text-sm font-black ${selectedCategory === 'gold' ? 'text-amber-300' : 'text-white'}`}>
                    🪙 עסקת זהב
                  </span>
                  <span className="text-[10px] bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded-full font-bold">
                    24K / 18K / 14K / 9K
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">
                  שקילת זהב לפי קראט, חישוב ספוט בלייב וקיזוז עמלת סוחר.
                </p>
              </div>
            </div>

            <div className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 ${
              selectedCategory === 'gold'
                ? 'border-amber-400 bg-amber-500 text-slate-950'
                : 'border-slate-700 bg-slate-900'
            }`}>
              {selectedCategory === 'gold' && <Check className="w-3.5 h-3.5 stroke-[3]" />}
            </div>
          </div>

          {/* Option B: Diamond Deal */}
          <div
            onClick={() => setSelectedCategory('diamond')}
            className={`p-3.5 rounded-2xl border cursor-pointer transition-all flex items-center justify-between ${
              selectedCategory === 'diamond'
                ? 'bg-cyan-500/15 border-cyan-500/60 shadow-lg shadow-cyan-500/10'
                : 'bg-slate-950/70 border-slate-800 hover:border-slate-700'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className={`p-2.5 rounded-xl border ${
                selectedCategory === 'diamond'
                  ? 'bg-cyan-500 text-slate-950 border-cyan-400 font-bold'
                  : 'bg-slate-900 text-cyan-400 border-slate-800'
              }`}>
                <Gem className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className={`text-sm font-black ${selectedCategory === 'diamond' ? 'text-cyan-300' : 'text-white'}`}>
                    💎 עסקת יהלומים ותכשיטים
                  </span>
                  <span className="text-[10px] bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 px-2 py-0.5 rounded-full font-bold">
                    B2B &bull; אדם פרטי
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">
                  תמחור רפפורט לסוחרים, קנייה מאדם פרטי או חבילות (פאקע).
                </p>
              </div>
            </div>

            <div className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 ${
              selectedCategory === 'diamond'
                ? 'border-cyan-400 bg-cyan-500 text-slate-950'
                : 'border-slate-700 bg-slate-900'
            }`}>
              {selectedCategory === 'diamond' && <Check className="w-3.5 h-3.5 stroke-[3]" />}
            </div>
          </div>
        </div>

        {/* Primary Action Button: Start Deal */}
        <button
          type="button"
          onClick={() => onStartNewDeal(selectedCategory)}
          className={`w-full py-4 px-5 rounded-2xl font-black text-sm sm:text-base flex items-center justify-center gap-2.5 transition-all shadow-xl active:scale-[0.98] ${
            selectedCategory === 'gold'
              ? 'bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 hover:from-amber-400 hover:to-amber-300 text-slate-950 shadow-amber-500/25 border border-amber-300/40'
              : 'bg-gradient-to-r from-cyan-500 via-blue-600 to-amber-500 hover:from-cyan-400 hover:to-amber-400 text-slate-950 shadow-cyan-500/25 border border-cyan-300/40'
          }`}
        >
          <span>התחל {selectedCategory === 'gold' ? 'עסקת זהב' : 'עסקת יהלומים'}</span>
          <ArrowLeft className="w-5 h-5 stroke-[3]" />
        </button>
      </div>
    </div>
  );
};

