import React from 'react';
import { TradeItem, DiamondItem } from '../types';
import { CheckCircle2, ArrowLeft, Plus, ShoppingBag, X, Coins, Gem, Sparkles } from 'lucide-react';

interface PostItemChoiceModalProps {
  isOpen: boolean;
  lastItem: TradeItem | null;
  cartCount: number;
  totalCartOfferIls: number;
  onAddAnotherItem: () => void;
  onProceedToSummary: () => void;
  onClose: () => void;
}

export const PostItemChoiceModal: React.FC<PostItemChoiceModalProps> = ({
  isOpen,
  lastItem,
  cartCount,
  totalCartOfferIls,
  onAddAnotherItem,
  onProceedToSummary,
  onClose,
}) => {
  if (!isOpen || !lastItem) return null;

  const isDiamond = lastItem.category === 'diamond';
  const diamondItem = isDiamond ? (lastItem as DiamondItem) : null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-end sm:items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200 dir-rtl">
      <div className="w-full max-w-md bg-slate-900 border border-amber-500/40 rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Modal Top Header */}
        <div className="bg-gradient-to-r from-amber-500/20 via-emerald-500/15 to-amber-500/20 border-b border-slate-800 p-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center shadow-inner">
              <CheckCircle2 className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-black text-slate-100 flex items-center gap-1.5">
                <span>הפריט נוסף בהצלחה לסל!</span>
                <Sparkles className="w-4 h-4 text-amber-400" />
              </h3>
              <p className="text-[11px] text-slate-400">עסקה פעילה &bull; פריט #{cartCount}</p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-all"
            title="סגור חלון"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Added Item Summary Card */}
        <div className="p-4 sm:p-5 space-y-4">
          <div className="bg-slate-950/90 border border-slate-800 rounded-2xl p-3.5 flex items-center justify-between gap-3 shadow-inner">
            <div className="flex items-center gap-3">
              {isDiamond ? (
                <div className="w-10 h-10 rounded-xl bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 flex items-center justify-center shrink-0">
                  <Gem className="w-5 h-5" />
                </div>
              ) : (
                <div className="w-10 h-10 rounded-xl bg-amber-500/15 text-amber-400 border border-amber-500/30 flex items-center justify-center font-black text-xs font-mono shrink-0">
                  {lastItem.karat ? `${lastItem.karat}K` : <Coins className="w-5 h-5" />}
                </div>
              )}
              <div>
                <h4 className="text-xs sm:text-sm font-bold text-slate-100 line-clamp-1">
                  {lastItem.name}
                </h4>
                <p className="text-[11px] text-slate-400 font-mono mt-0.5">
                  {isDiamond && diamondItem
                    ? `${diamondItem.caratWeight.toFixed(2)} קראט (${diamondItem.color}/${diamondItem.clarity})`
                    : `${lastItem.weightGrams} גרם`}
                </p>
              </div>
            </div>

            <div className="text-left shrink-0">
              <span className="text-[10px] text-slate-400 block">מחיר מוצע:</span>
              <span className="text-sm sm:text-base font-black text-amber-400 font-mono">
                ₪{lastItem.offerPriceIls.toLocaleString('he-IL', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}
              </span>
            </div>
          </div>

          {/* Cart Aggregate Banner */}
          <div className="bg-slate-800/60 border border-slate-700/60 rounded-xl px-3.5 py-2 flex items-center justify-between text-xs">
            <span className="text-slate-300 flex items-center gap-1.5">
              <ShoppingBag className="w-3.5 h-3.5 text-amber-400" />
              <span>סה"כ בסל: <strong>{cartCount} פריטים</strong></span>
            </span>
            <span className="text-slate-300">
              לתשלום: <strong className="text-amber-300 font-mono">₪{totalCartOfferIls.toLocaleString('he-IL', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}</strong>
            </span>
          </div>

          {/* Question / Prompt */}
          <div className="text-center pt-1">
            <span className="text-xs font-bold text-slate-300">
              מה תרצה לעשות עכשיו?
            </span>
          </div>

          {/* Action Buttons */}
          <div className="space-y-2.5 pt-1">
            {/* Primary Option: Proceed directly to Step 3 (Deal Summary) */}
            <button
              type="button"
              onClick={onProceedToSummary}
              className="w-full py-3.5 px-4 bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 hover:from-amber-400 hover:to-amber-300 text-slate-950 font-black text-sm sm:text-base rounded-2xl flex items-center justify-center gap-2 shadow-xl shadow-amber-500/20 transition-all active:scale-[0.98]"
            >
              <span>המשך לסיכום העסקה והפקת קבלה</span>
              <ArrowLeft className="w-5 h-5 stroke-[3]" />
            </button>

            {/* Secondary Option: Add another item -> opens dedicated new item window */}
            <button
              type="button"
              onClick={onAddAnotherItem}
              className="w-full py-3 px-4 bg-slate-800/90 hover:bg-slate-800 text-amber-300 border border-amber-500/40 hover:border-amber-400 font-black text-xs sm:text-sm rounded-2xl flex items-center justify-center gap-2 transition-all active:scale-[0.98] shadow-md"
            >
              <Plus className="w-4 h-4 text-amber-400 stroke-[3]" />
              <span>הוסף פריט נוסף (פתח חלון חדש)</span>
            </button>
          </div>

          {/* Tertiary Subtle Option: Stay on page / view items */}
          <div className="text-center pt-1 pb-1">
            <button
              type="button"
              onClick={onClose}
              className="text-xs text-slate-400 hover:text-slate-200 underline transition-all"
            >
              סגור וצפה בסל הפריטים המלא
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
