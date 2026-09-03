import React, { useState, useEffect } from 'react';
import { X, RefreshCw, Clock, DollarSign, Coins, Edit2, Check, Zap, TrendingUp, ExternalLink } from 'lucide-react';
import { RatesData } from '../types';

interface LiveRatesModalProps {
  isOpen: boolean;
  onClose: () => void;
  rates: RatesData | null;
  loading: boolean;
  onRefresh: () => void;
  customUsdIls?: number | null;
  onUpdateCustomUsdIls?: (rate: number | null) => void;
  customXauUsd?: number | null;
  onUpdateCustomXauUsd?: (rate: number | null) => void;
}

export const LiveRatesModal: React.FC<LiveRatesModalProps> = ({
  isOpen,
  onClose,
  rates,
  loading,
  onRefresh,
  customUsdIls,
  onUpdateCustomUsdIls,
  customXauUsd,
  onUpdateCustomXauUsd,
}) => {
  const [isEditingFx, setIsEditingFx] = useState(false);
  const [fxInput, setFxInput] = useState('');

  const [isEditingGold, setIsEditingGold] = useState(false);
  const [goldInput, setGoldInput] = useState('');

  const [secondsAgo, setSecondsAgo] = useState(0);

  useEffect(() => {
    setSecondsAgo(0);
    const interval = setInterval(() => {
      setSecondsAgo((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [rates?.timestamp]);

  if (!isOpen) return null;

  const effectiveUsdIls = customUsdIls ?? (rates?.usdIls || 3.65);
  const xauUsd = customXauUsd ?? (rates?.xauUsd || 3310.5);
  const effectiveGold24kGramIls = (xauUsd / 31.1034768) * effectiveUsdIls;

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

  const handleSaveCustomGold = () => {
    const val = parseFloat(goldInput);
    if (!isNaN(val) && val > 0 && onUpdateCustomXauUsd) {
      onUpdateCustomXauUsd(val);
    }
    setIsEditingGold(false);
  };

  const handleResetGold = () => {
    if (onUpdateCustomXauUsd) {
      onUpdateCustomXauUsd(null);
    }
    setIsEditingGold(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
      <div className="bg-slate-900 border border-amber-500/40 rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden flex flex-col dir-rtl">
        {/* Header */}
        <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <Coins className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                שערי מתכות ודולר בזמן אמת (לייב)
                <span className="flex items-center gap-1 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[11px] font-mono font-bold px-2 py-0.5 rounded-full">
                  <span className="flex h-2 w-2 relative">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                  </span>
                  ציטוט רציף
                </span>
              </h3>
              <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                <Clock className="w-3.5 h-3.5 text-slate-500" />
                עדכון רציף לפני {secondsAgo} שניות &bull; מתרענן אוטומטית
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onRefresh}
              disabled={loading}
              className="flex items-center gap-1 text-xs bg-slate-800 hover:bg-slate-700 text-amber-400 px-2.5 py-1.5 rounded-xl border border-slate-700 font-medium transition-all"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">רענן</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-200 rounded-lg bg-slate-800 hover:bg-slate-700 transition-all"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4 text-xs text-slate-200">
          {/* Main Key Rates Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Spot Gold XAU/USD */}
            <div className="bg-slate-950 border border-slate-800 rounded-xl p-3 relative">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-slate-400 font-medium flex items-center gap-1">
                  <TrendingUp className="w-3.5 h-3.5 text-amber-400" />
                  זהב בעולם (XAU/USD)
                </span>
                {onUpdateCustomXauUsd && (
                  <button
                    onClick={() => {
                      setGoldInput(xauUsd.toString());
                      setIsEditingGold(!isEditingGold);
                    }}
                    className="text-[10px] text-amber-400 hover:underline flex items-center gap-0.5"
                  >
                    <Edit2 className="w-3 h-3" />
                    <span>{customXauUsd ? 'מותאם' : 'ערוך'}</span>
                  </button>
                )}
              </div>

              {isEditingGold ? (
                <div className="flex items-center gap-1 my-1">
                  <input
                    type="number"
                    step="1"
                    value={goldInput}
                    onChange={(e) => setGoldInput(e.target.value)}
                    className="w-24 bg-slate-900 border border-amber-500 rounded text-xs p-1 text-slate-100 font-mono"
                    placeholder="מחיר אונקיה"
                  />
                  <button
                    onClick={handleSaveCustomGold}
                    className="p-1 bg-amber-500 text-slate-950 rounded hover:bg-amber-400"
                  >
                    <Check className="w-3 h-3" />
                  </button>
                  {customXauUsd && (
                    <button
                      onClick={handleResetGold}
                      className="text-[10px] text-red-400 hover:underline px-1"
                    >
                      אפס
                    </button>
                  )}
                </div>
              ) : (
                <span className="text-lg font-black text-amber-400 font-mono block">
                  ${xauUsd.toFixed(2)}
                </span>
              )}
              <div className="flex items-center justify-between text-[10px] text-slate-500 mt-1">
                <span>{customXauUsd ? 'אונקיה (שער מותאם אישית)' : 'אונקיית זהב טהור בלייב'}</span>
                <a
                  href="https://il.investing.com/commodities/gold"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-amber-400/90 hover:text-amber-300 flex items-center gap-0.5 hover:underline"
                  title="שער זהב בלייב באתר Investing.com"
                >
                  <span>Investing</span>
                  <ExternalLink className="w-2.5 h-2.5" />
                </a>
              </div>
            </div>

            {/* USD/ILS FX */}
            <div className="bg-slate-950 border border-slate-800 rounded-xl p-3 relative">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-slate-400 font-medium flex items-center gap-1">
                  <DollarSign className="w-3.5 h-3.5 text-amber-400" />
                  שער דולר רציף
                </span>
                {onUpdateCustomUsdIls && (
                  <button
                    onClick={() => {
                      setFxInput(effectiveUsdIls.toString());
                      setIsEditingFx(!isEditingFx);
                    }}
                    className="text-[10px] text-amber-400 hover:underline flex items-center gap-0.5"
                  >
                    <Edit2 className="w-3 h-3" />
                    <span>{customUsdIls ? 'מותאם' : 'ערוך'}</span>
                  </button>
                )}
              </div>

              {isEditingFx ? (
                <div className="flex items-center gap-1 my-1">
                  <input
                    type="number"
                    step="0.001"
                    value={fxInput}
                    onChange={(e) => setFxInput(e.target.value)}
                    className="w-20 bg-slate-900 border border-amber-500 rounded text-xs p-1 text-slate-100 font-mono"
                  />
                  <button
                    onClick={handleSaveCustomFx}
                    className="p-1 bg-amber-500 text-slate-950 rounded hover:bg-amber-400"
                  >
                    <Check className="w-3 h-3" />
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
                <div className="text-lg font-black text-slate-100 font-mono flex items-center gap-1">
                  ₪{effectiveUsdIls.toFixed(3)}
                  <Zap className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
                </div>
              )}
              <div className="flex items-center justify-between text-[10px] text-slate-500 mt-1">
                <span>{customUsdIls ? 'שער מותאם אישית' : 'שער רציף בזמן אמת'}</span>
                <a
                  href="https://il.investing.com/currencies/usd-ils"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-amber-400/90 hover:text-amber-300 flex items-center gap-0.5 hover:underline font-medium"
                  title="שער דולר/שקל בלייב באתר Investing.com"
                >
                  <span>Investing</span>
                  <ExternalLink className="w-2.5 h-2.5" />
                </a>
              </div>
            </div>

            {/* 24K Gold Per Gram */}
            <div className="bg-slate-950 border border-slate-800 rounded-xl p-3">
              <span className="text-xs text-slate-400 font-medium block mb-1">
                זהב 24K בש"ח לגרם
              </span>
              <span className="text-lg font-black text-amber-300 font-mono block">
                ₪{effectiveGold24kGramIls.toFixed(2)}
              </span>
              <span className="text-[10px] text-amber-400/80">טוהר 99.9%</span>
            </div>
          </div>

          {/* Detailed Purity Matrix */}
          <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-3.5 space-y-2">
            <span className="text-xs font-bold text-amber-300 block">
              מחירי שוק גולמיים לגרם בש"ח לפי דרגות הקראט (24K, 18K, 14K, 9K):
            </span>

            <div className="grid grid-cols-4 gap-2 text-center">
              <div className="bg-slate-900 border border-slate-800 p-2 rounded-lg">
                <span className="text-[10px] text-amber-400 font-bold block">24K (99.9%)</span>
                <span className="text-sm font-bold text-white font-mono">
                  ₪{effectiveGold24kGramIls.toFixed(1)}
                </span>
              </div>

              <div className="bg-slate-900 border border-slate-800 p-2 rounded-lg">
                <span className="text-[10px] text-amber-400 font-bold block">18K (75.0%)</span>
                <span className="text-sm font-bold text-white font-mono">
                  ₪{(effectiveGold24kGramIls * 0.75).toFixed(1)}
                </span>
              </div>

              <div className="bg-slate-900 border border-slate-800 p-2 rounded-lg">
                <span className="text-[10px] text-amber-400 font-bold block">14K (58.5%)</span>
                <span className="text-sm font-bold text-white font-mono">
                  ₪{(effectiveGold24kGramIls * (14 / 24)).toFixed(1)}
                </span>
              </div>

              <div className="bg-slate-900 border border-amber-500/30 bg-amber-500/5 p-2 rounded-lg">
                <span className="text-[10px] text-amber-400 font-bold block">9K (37.5%)</span>
                <span className="text-sm font-bold text-amber-300 font-mono">
                  ₪{(effectiveGold24kGramIls * (9 / 24)).toFixed(1)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
