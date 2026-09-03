import React, { useState, useEffect } from 'react';
import { RefreshCw, TrendingUp, Clock, DollarSign, Coins, Edit2, Check, Zap, ExternalLink } from 'lucide-react';
import { RatesData } from '../types';

interface LiveRatesCardProps {
  rates: RatesData | null;
  loading: boolean;
  onRefresh: () => void;
  customUsdIls?: number | null;
  onUpdateCustomUsdIls?: (rate: number | null) => void;
}

export const LiveRatesCard: React.FC<LiveRatesCardProps> = ({
  rates,
  loading,
  onRefresh,
  customUsdIls,
  onUpdateCustomUsdIls,
}) => {
  const [isEditingFx, setIsEditingFx] = useState(false);
  const [fxInput, setFxInput] = useState('');
  const [secondsAgo, setSecondsAgo] = useState(0);

  // Timer for "updated X seconds ago" ticker
  useEffect(() => {
    setSecondsAgo(0);
    const interval = setInterval(() => {
      setSecondsAgo((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [rates?.timestamp]);

  if (!rates) {
    return (
      <div className="bg-slate-900/80 border border-amber-500/30 rounded-2xl p-5 text-center text-slate-300">
        <div className="animate-spin w-6 h-6 border-2 border-amber-500 border-t-transparent rounded-full mx-auto mb-2"></div>
        <p className="text-sm">טוען שערי זהב ודולר רציפים בלייב...</p>
      </div>
    );
  }

  const effectiveUsdIls = customUsdIls ?? rates.usdIls;
  const effectiveGold24kGramIls = (rates.xauUsd / 31.1034768) * effectiveUsdIls;

  const handleSaveCustomFx = () => {
    const val = parseFloat(fxInput);
    if (!isNaN(val) && val > 0 && onUpdateCustomUsdIls) {
      onUpdateCustomUsdIls(val);
    }
    setIsEditingFx(false);
  };

  const handleResetFx = () => {
    if (onUpdateCustomUsdIls) {
      onUpdateCustomUsdIls(null);
    }
    setIsEditingFx(false);
  };

  return (
    <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 border border-amber-500/30 rounded-2xl p-4 sm:p-5 shadow-xl text-slate-100 relative overflow-hidden">
      {/* Background Accent Glow */}
      <div className="absolute top-0 right-0 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl pointer-events-none"></div>

      {/* Header & Live Stream Status Indicator */}
      <div className="flex items-center justify-between mb-4 border-b border-slate-800 pb-3 flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <Coins className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
              שערי זהב ודולר רציפים (Live Stream)
              <span className="flex items-center gap-1 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[11px] font-mono font-bold px-2 py-0.5 rounded-full">
                <span className="flex h-2 w-2 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                רציף
              </span>
            </h2>
            <p className="text-xs text-slate-400 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-slate-500" />
              עדכון רציף לפני {secondsAgo} שניות &bull; מתרענן אוטומטית
            </p>
          </div>
        </div>

        <button
          onClick={onRefresh}
          disabled={loading}
          id="btn-card-refresh-rates"
          className="flex items-center gap-1.5 text-xs bg-slate-800 hover:bg-slate-700 text-amber-400 px-3 py-1.5 rounded-xl border border-slate-700 font-medium transition-all active:scale-95 disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>רענן בלייב</span>
        </button>
      </div>

      {/* Primary Rates Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-4">
        {/* XAU/USD Spot */}
        <a
          href="https://il.investing.com/currencies/xau-usd"
          target="_blank"
          rel="noopener noreferrer"
          className="bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 hover:border-amber-500/60 rounded-xl p-3 flex flex-col justify-between transition-all group cursor-pointer"
          title="לחץ לצפייה בספוט זהב חי (XAU/USD) באתר Investing.com"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 group-hover:text-amber-300 font-medium flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
              ספוט זהב (XAU/USD)
            </span>
            <ExternalLink className="w-3 h-3 text-amber-400/70 group-hover:text-amber-400" />
          </div>
          <div className="mt-1">
            <span className="text-lg sm:text-xl font-black text-amber-300 font-mono tracking-tight">
              ${rates.xauUsd.toFixed(2)}
            </span>
            <div className="flex items-center justify-between text-[10px] text-slate-400 mt-0.5">
              <span>31.1035 גרם</span>
              <span className="text-amber-400/80 group-hover:underline">Investing.com ↗</span>
            </div>
          </div>
        </a>

        {/* Continuous USD/ILS FX */}
        <div className="bg-slate-800/60 border border-slate-700/60 rounded-xl p-3 flex flex-col justify-between relative">
          <div className="flex items-center justify-between">
            <a
              href="https://il.investing.com/currencies/usd-ils"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-slate-400 hover:text-amber-300 font-medium flex items-center gap-1 group/fx"
              title="לחץ לצפייה בשער דולר/שקל רציף (USD/ILS) באתר Investing.com"
            >
              <DollarSign className="w-3.5 h-3.5 text-amber-400" />
              <span>שער דולר רציף</span>
              <ExternalLink className="w-2.5 h-2.5 opacity-60 group-hover/fx:opacity-100" />
            </a>
            {onUpdateCustomUsdIls && (
              <button
                onClick={() => {
                  setFxInput(effectiveUsdIls.toString());
                  setIsEditingFx(!isEditingFx);
                }}
                className="text-[10px] text-amber-400 hover:underline flex items-center gap-0.5"
                title="שינוי/קיבוע שער דולר ידני"
              >
                <Edit2 className="w-3 h-3" />
                <span>{customUsdIls ? 'מותאם' : 'ערוך'}</span>
              </button>
            )}
          </div>

          {isEditingFx ? (
            <div className="mt-1 flex items-center gap-1">
              <input
                type="number"
                step="0.001"
                value={fxInput}
                onChange={(e) => setFxInput(e.target.value)}
                className="w-20 bg-slate-950 border border-amber-500 rounded text-xs p-1 text-slate-100 font-mono"
                placeholder="3.650"
              />
              <button
                onClick={handleSaveCustomFx}
                className="p-1 bg-amber-500 text-slate-950 rounded hover:bg-amber-400 transition-colors"
                title="שמור שער מותאם"
              >
                <Check className="w-3.5 h-3.5" />
              </button>
              {customUsdIls && (
                <button
                  onClick={handleResetFx}
                  className="text-[10px] text-red-400 hover:underline px-1"
                >
                  אפס
                </button>
              )}
            </div>
          ) : (
            <div className="mt-1">
              <div className="flex items-center gap-1.5">
                <span className="text-lg sm:text-xl font-black text-slate-100 font-mono tracking-tight">
                  ₪{effectiveUsdIls.toFixed(3)}
                </span>
                <Zap className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
              </div>
              <div className="flex items-center justify-between text-[10px] text-slate-400 mt-0.5">
                <span>{customUsdIls ? 'מותאם אישית' : 'שער רציף'}</span>
                <a
                  href="https://il.investing.com/currencies/usd-ils"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-amber-400/80 hover:underline"
                  title="צפה באתר Investing.com"
                >
                  Investing.com ↗
                </a>
              </div>
            </div>
          )}
        </div>

        {/* 24K Gold Per Gram */}
        <div className="col-span-2 sm:col-span-1 bg-gradient-to-br from-amber-500/20 to-yellow-600/10 border border-amber-500/40 rounded-xl p-3 flex flex-col justify-between">
          <span className="text-xs text-amber-300 font-semibold flex items-center gap-1">
            <Coins className="w-3.5 h-3.5 text-amber-400" />
            זהב 24K (גרם טהור)
          </span>
          <div className="mt-1">
            <span className="text-xl sm:text-2xl font-black text-amber-400 font-mono tracking-tight">
              ₪{effectiveGold24kGramIls.toFixed(2)}
            </span>
            <span className="text-[11px] text-amber-300/80 block font-medium">לגרם 99.9%</span>
          </div>
        </div>
      </div>

      {/* Purity Rate Matrix Pills - Focus strictly on 24K, 18K, 14K, 9K */}
      <div>
        <span className="text-xs font-medium text-slate-400 block mb-2">
          מחירי שוק גולמי לגרם בש"ח לפי דרגות הקראט (24K, 18K, 14K, 9K):
        </span>
        <div className="grid grid-cols-4 gap-2">
          <div className="bg-slate-800/80 border border-slate-700 text-center py-2 px-1 rounded-xl">
            <span className="text-[10px] text-amber-400 font-bold block">24K (99.9%)</span>
            <span className="text-xs sm:text-sm font-bold text-white font-mono">
              ₪{effectiveGold24kGramIls.toFixed(1)}
            </span>
          </div>

          <div className="bg-slate-800/80 border border-slate-700 text-center py-2 px-1 rounded-xl">
            <span className="text-[10px] text-amber-400 font-bold block">18K (75.0%)</span>
            <span className="text-xs sm:text-sm font-bold text-white font-mono">
              ₪{(effectiveGold24kGramIls * 0.75).toFixed(1)}
            </span>
          </div>

          <div className="bg-slate-800/80 border border-slate-700 text-center py-2 px-1 rounded-xl">
            <span className="text-[10px] text-amber-400 font-bold block">14K (58.5%)</span>
            <span className="text-xs sm:text-sm font-bold text-white font-mono">
              ₪{(effectiveGold24kGramIls * (14 / 24)).toFixed(1)}
            </span>
          </div>

          <div className="bg-slate-800/80 border border-amber-500/30 bg-amber-500/5 text-center py-2 px-1 rounded-xl">
            <span className="text-[10px] text-amber-400 font-bold block">9K (37.5%)</span>
            <span className="text-xs sm:text-sm font-bold text-amber-300 font-mono">
              ₪{(effectiveGold24kGramIls * (9 / 24)).toFixed(1)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
