import React, { useState } from 'react';
import { RatesData, TradeItem, ItemCategory } from '../types';
import { GoldCalculator } from './GoldCalculator';
import { DiamondCalculator } from './DiamondCalculator';
import { X, Plus, Coins, Gem, Sparkles } from 'lucide-react';

interface AddItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  rates: RatesData;
  defaultMarginPercent: number;
  onAddItem: (item: TradeItem) => void;
  cartCount: number;
}

export const AddItemModal: React.FC<AddItemModalProps> = ({
  isOpen,
  onClose,
  rates,
  defaultMarginPercent,
  onAddItem,
  cartCount,
}) => {
  const [activeCategory, setActiveCategory] = useState<ItemCategory>('gold');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-start sm:items-center justify-center p-2 sm:p-4 overflow-y-auto dir-rtl">
      <div className="w-full max-w-2xl bg-slate-900 border border-amber-500/40 rounded-3xl shadow-2xl overflow-hidden my-4 animate-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-amber-500/20 via-slate-800 to-amber-500/20 border-b border-slate-800 p-4 sm:p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-amber-500/15 text-amber-400 border border-amber-500/30">
              <Plus className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-black text-slate-100">
                  חלון הזנת פריט חדש לעסקה
                </h3>
                <span className="text-[10px] bg-amber-500/20 text-amber-300 font-bold px-2 py-0.5 rounded-full border border-amber-500/30">
                  פריט #{cartCount + 1}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                בחר סוג, הזן משקל וקבל תמחור מדויק בזמן אמת
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-2xl hover:bg-slate-800 transition-all"
            title="סגור חלון"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 space-y-5 max-h-[80vh] overflow-y-auto">
          {/* Quick Category Switcher */}
          <div className="bg-slate-950 p-1.5 rounded-2xl border border-slate-800 flex items-center gap-2">
            <button
              type="button"
              onClick={() => setActiveCategory('gold')}
              className={`flex-1 py-2.5 px-3 rounded-xl text-xs sm:text-sm font-black transition-all flex items-center justify-center gap-2 ${
                activeCategory === 'gold'
                  ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Coins className="w-4 h-4" />
              <span>🪙 פריט זהב</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveCategory('diamond')}
              className={`flex-1 py-2.5 px-3 rounded-xl text-xs sm:text-sm font-black transition-all flex items-center justify-center gap-2 ${
                activeCategory === 'diamond'
                  ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Gem className="w-4 h-4" />
              <span>💎 יהלום / שיבוץ</span>
            </button>
          </div>

          {/* Render Calculator */}
          {activeCategory === 'gold' ? (
            <GoldCalculator
              rates={rates}
              defaultMarginPercent={defaultMarginPercent}
              onAddItem={(item) => {
                onAddItem(item);
                onClose();
              }}
              cartCount={cartCount}
            />
          ) : (
            <DiamondCalculator
              rates={rates}
              onAddItem={(item) => {
                onAddItem(item);
                onClose();
              }}
            />
          )}
        </div>
      </div>
    </div>
  );
};
