import React from 'react';
import { Plus, Coins, BookUser, History, FileText, ChevronLeft, Gem, ShoppingBag, Layers, ExternalLink } from 'lucide-react';
import { TradeDeal, RatesData, BusinessSettings } from '../types';

interface DealerDashboardProps {
  settings: BusinessSettings;
  rates: RatesData | null;
  history: TradeDeal[];
  onStartNewDeal: (category?: 'gold' | 'diamond') => void;
  onOpenHistory: () => void;
  onOpenSettings: () => void;
  onOpenRatesModal: () => void;
  onOpenContactPicker: () => void;
  onViewDealReceipt?: (deal: TradeDeal) => void;
}

export const DealerDashboard: React.FC<DealerDashboardProps> = ({
  settings,
  rates,
  history,
  onStartNewDeal,
  onOpenHistory,
  onOpenRatesModal,
  onOpenContactPicker,
  onViewDealReceipt,
}) => {
  const totalDealsCount = history.length;
  const totalWeightGrams = history.reduce((sum, d) => sum + (d.totals?.totalWeightGrams || 0), 0);
  
  // Calculate total diamond carats across deals
  const totalDiamondCarats = history.reduce((sum, deal) => {
    const diamondItems = (deal.items || []).filter((i) => i.category === 'diamond');
    return sum + diamondItems.reduce((dSum, dItem: any) => dSum + (dItem.caratWeight || 0), 0);
  }, 0);

  const totalPaidIls = history.reduce((sum, d) => sum + (d.totals?.totalOfferPriceIls || 0), 0);
  const recentDeals = history.slice(0, 4);

  const gold24k = rates?.gold24kPerGramIls || 315.2;

  return (
    <div className="space-y-5 dir-rtl max-w-4xl mx-auto">
      {/* Top Main Action Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2">
            שלום, <span className="text-amber-400">{settings.dealerName || 'סוחר זהב ויהלומים'}</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            מערכת ניהול ותמכור עסקאות זהב ויהלומים בין סוחרים (B2B)
          </p>
        </div>

        {/* Dual New Deal Buttons: Gold vs Diamond */}
        <div className="flex items-center gap-2.5 w-full md:w-auto">
          <button
            type="button"
            onClick={() => onStartNewDeal('gold')}
            className="flex-1 md:flex-none bg-amber-500 hover:bg-amber-400 active:scale-95 text-slate-950 font-black text-xs sm:text-sm px-4 py-3 rounded-xl shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 transition-all border border-amber-300/30"
          >
            <Coins className="w-4 h-4 text-slate-950" />
            <span>עסקת זהב +</span>
          </button>

          <button
            type="button"
            onClick={() => onStartNewDeal('diamond')}
            className="flex-1 md:flex-none bg-gradient-to-r from-cyan-500 via-blue-600 to-amber-500 hover:from-cyan-400 hover:to-amber-400 active:scale-95 text-slate-950 font-black text-xs sm:text-sm px-4 py-3 rounded-xl shadow-lg shadow-cyan-500/20 flex items-center justify-center gap-2 transition-all border border-cyan-300/30"
          >
            <Gem className="w-4 h-4 text-slate-950" />
            <span>עסקת יהלומים (B2B / אדם פרטי) +</span>
          </button>
        </div>
      </div>

      {/* Quick Trade Mode Launcher Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* Gold Calculator Shortcut */}
        <div
          onClick={() => onStartNewDeal('gold')}
          className="bg-slate-900 hover:bg-slate-850 border border-slate-800 hover:border-amber-500/40 p-4 rounded-2xl cursor-pointer transition-all group flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <div className="p-3 bg-amber-500/10 text-amber-400 rounded-xl border border-amber-500/20 group-hover:scale-105 transition-transform">
              <Coins className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-white group-hover:text-amber-300 transition-colors">
                  מחשבון עסקאות זהב
                </h3>
                <span className="text-[10px] bg-amber-500/10 text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded-full font-bold">
                  24K / 18K / 14K
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                שקילת זהב לפי קראט בקיזוז מרווח סוחר.
              </p>
            </div>
          </div>
          <ChevronLeft className="w-5 h-5 text-slate-500 group-hover:text-amber-400 transform group-hover:-translate-x-1 transition-all" />
        </div>

        {/* Diamond Calculator Shortcut */}
        <div
          onClick={() => onStartNewDeal('diamond')}
          className="bg-slate-900 hover:bg-slate-850 border border-slate-800 hover:border-cyan-500/40 p-4 rounded-2xl cursor-pointer transition-all group flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <div className="p-3 bg-cyan-500/10 text-cyan-400 rounded-xl border border-cyan-500/20 group-hover:scale-105 transition-transform">
              <Gem className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-white group-hover:text-cyan-300 transition-colors">
                  מחשבון יהלומים (B2B / אדם פרטי)
                </h3>
                <span className="text-[10px] bg-cyan-950 text-cyan-300 border border-cyan-800 px-2 py-0.5 rounded-full font-bold">
                  סוחרים &bull; אדם פרטי
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                תמחור רפפורט לסוחרים, קנייה/מכירה מפרטי ותכשיטים.
              </p>
            </div>
          </div>
          <ChevronLeft className="w-5 h-5 text-slate-500 group-hover:text-cyan-400 transform group-hover:-translate-x-1 transition-all" />
        </div>
      </div>

      {/* Live Market Gold Rates Row */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-lg space-y-3">
        <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
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

        <div className="grid grid-cols-2 sm:grid-cols-6 gap-2 text-center text-xs">
          <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
            <span className="text-[10px] text-slate-400 block">XAU/USD (אונקיה)</span>
            <strong className="text-amber-300 font-mono text-sm">${rates?.xauUsd?.toFixed(2) || '---'}</strong>
          </div>
          <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
            <span className="text-[10px] text-slate-400 block">USD/ILS (דולר)</span>
            <strong className="text-slate-200 font-mono text-sm">₪{rates?.usdIls?.toFixed(3) || '---'}</strong>
          </div>
          <div className="bg-slate-950 p-2.5 rounded-xl border border-amber-500/30">
            <span className="text-[10px] text-amber-400 block font-bold">24K (גרם)</span>
            <strong className="text-amber-300 font-mono text-sm">₪{gold24k.toFixed(2)}</strong>
          </div>
          <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
            <span className="text-[10px] text-slate-400 block">18K (גרם)</span>
            <strong className="text-slate-200 font-mono text-sm">₪{(gold24k * 0.75).toFixed(2)}</strong>
          </div>
          <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
            <span className="text-[10px] text-slate-400 block">14K (גרם)</span>
            <strong className="text-slate-200 font-mono text-sm">₪{(gold24k * 0.585).toFixed(2)}</strong>
          </div>
          <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
            <span className="text-[10px] text-slate-400 block">9K (גרם)</span>
            <strong className="text-slate-200 font-mono text-sm">₪{(gold24k * 0.375).toFixed(2)}</strong>
          </div>
        </div>
      </div>

      {/* Quick Contact Picker Bar & Dealer Cumulative Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* Contact Picker Shortcut */}
        <button
          type="button"
          onClick={onOpenContactPicker}
          className="bg-slate-900 hover:bg-slate-850 border border-slate-800 hover:border-amber-500/30 p-4 rounded-2xl flex items-center justify-between text-right transition-all group"
        >
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-amber-500/10 text-amber-400 rounded-xl border border-amber-500/20 group-hover:scale-105 transition-transform">
              <BookUser className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs font-bold text-white block group-hover:text-amber-300 transition-colors">
                בחירת לקוח מאנשי הקשר
              </span>
              <span className="text-[11px] text-slate-400 block">
                טען שם וטלפון לקבלה ישירות מהנייד
              </span>
            </div>
          </div>
          <ChevronLeft className="w-4 h-4 text-slate-500 group-hover:text-amber-400 transform group-hover:-translate-x-1 transition-all" />
        </button>

        {/* Total Deals Summary */}
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl flex items-center justify-around text-center">
          <div>
            <span className="text-[10px] text-slate-400 block">עסקאות במערכת</span>
            <strong className="text-lg font-black text-amber-400 font-mono">{totalDealsCount}</strong>
          </div>
          <div className="w-px h-8 bg-slate-800"></div>
          <div>
            <span className="text-[10px] text-slate-400 block">זהב מצטבר</span>
            <strong className="text-base font-black text-white font-mono">{totalWeightGrams.toFixed(1)}g</strong>
          </div>
          <div className="w-px h-8 bg-slate-800"></div>
          <div>
            <span className="text-[10px] text-slate-400 block">יהלומים B2B</span>
            <strong className="text-base font-black text-cyan-300 font-mono">{totalDiamondCarats.toFixed(2)}ct</strong>
          </div>
        </div>
      </div>

      {/* Recent Deals */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-lg space-y-3">
        <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
          <div className="flex items-center gap-2">
            <History className="w-4 h-4 text-amber-400" />
            <span className="text-xs font-bold text-slate-200">עסקאות אחרונות</span>
          </div>
          {history.length > 0 && (
            <button
              type="button"
              onClick={onOpenHistory}
              className="text-[11px] text-amber-400 hover:text-amber-300 font-bold"
            >
              הצג הכל ({history.length}) &larr;
            </button>
          )}
        </div>

        {recentDeals.length === 0 ? (
          <div className="text-center py-6 space-y-2 bg-slate-950/40 rounded-xl border border-slate-800/60 p-4">
            <p className="text-slate-400 text-xs font-bold">עדיין לא הוקלטו עסקאות במכשיר זה</p>

            <div className="flex items-center justify-center gap-2 pt-1">
              <button
                type="button"
                onClick={() => onStartNewDeal('gold')}
                className="inline-flex items-center gap-1 text-xs text-amber-300 hover:text-amber-200 font-bold bg-amber-500/10 border border-amber-500/20 px-3 py-1.5 rounded-xl transition-all"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>עסקת זהב</span>
              </button>
              <button
                type="button"
                onClick={() => onStartNewDeal('diamond')}
                className="inline-flex items-center gap-1 text-xs text-cyan-300 hover:text-cyan-200 font-bold bg-cyan-500/10 border border-cyan-500/20 px-3 py-1.5 rounded-xl transition-all"
              >
                <Gem className="w-3.5 h-3.5" />
                <span>עסקת יהלומים</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            {recentDeals.map((deal) => (
              <div
                key={deal.id}
                className="bg-slate-950 border border-slate-800/80 rounded-xl p-3 flex items-center justify-between gap-3 text-xs"
              >
                <div>
                  <strong className="text-white block font-bold">
                    {deal.clientName || 'לקוח מזומן / סוחר'}
                  </strong>
                  <span className="text-[10px] text-slate-400 font-mono">
                    {new Date(deal.date).toLocaleDateString('he-IL')} &bull; {deal.items?.length || 0} פריטים &bull; {deal.totals?.totalWeightGrams?.toFixed(1)}g
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-amber-400 text-sm">
                    ₪{deal.totals?.totalOfferPriceIls?.toLocaleString('he-IL')}
                  </span>
                  {onViewDealReceipt && (
                    <button
                      type="button"
                      onClick={() => onViewDealReceipt(deal)}
                      className="p-1.5 bg-slate-800 hover:bg-slate-700 text-amber-400 border border-slate-700 rounded-lg transition-all"
                      title="צפה בקבלה"
                    >
                      <FileText className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

