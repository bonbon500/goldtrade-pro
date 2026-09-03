import React, { useState } from 'react';
import { X, Search, Trash2, ExternalLink, Calendar, User, Phone, Coins, FileText, Send } from 'lucide-react';
import { TradeDeal } from '../types';

interface TradeHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  history: TradeDeal[];
  onDeleteDeal: (id: string) => void;
  onSelectDeal: (deal: TradeDeal) => void;
}

export const TradeHistoryModal: React.FC<TradeHistoryModalProps> = ({
  isOpen,
  onClose,
  history,
  onDeleteDeal,
  onSelectDeal,
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  if (!isOpen) return null;

  const filtered = history.filter((deal) => {
    const term = searchTerm.toLowerCase();
    return (
      deal.clientName.toLowerCase().includes(term) ||
      deal.clientPhone.includes(term) ||
      deal.id.toLowerCase().includes(term)
    );
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
      <div className="bg-slate-900 border border-amber-500/40 rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
              היסטוריית עסקאות שטח שנשמרו ({history.length})
            </h3>
            <p className="text-xs text-slate-400">תיעוד עסקאות קודמות, פתיחת קבלות ושליחה חוזרת</p>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-200 rounded-lg bg-slate-800 hover:bg-slate-700 transition-all"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Search Input */}
        <div className="p-4 border-b border-slate-800">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-500 absolute right-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="חפש לפי שם לקוח, טלפון או מזהה עסקה..."
              className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl py-2 pr-9 pl-3 text-xs text-slate-100 placeholder-slate-500 focus:outline-none"
            />
          </div>
        </div>

        {/* List Body */}
        <div className="p-4 overflow-y-auto space-y-3 text-xs text-slate-200 max-h-[60vh]">
          {filtered.length === 0 ? (
            <div className="text-center py-10 text-slate-500">
              <Coins className="w-8 h-8 mx-auto mb-2 text-slate-600" />
              <p className="font-semibold text-slate-400">לא נמצאו עסקאות בהיסטוריה</p>
              <p className="text-[11px] text-slate-500 mt-1">
                עסקאות שתשמור בסל יופיעו כאן אוטומטית למעקב עתידי
              </p>
            </div>
          ) : (
            filtered.map((deal) => (
              <div
                key={deal.id}
                className="bg-slate-950 border border-slate-800 hover:border-slate-700 rounded-xl p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-all"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-amber-300 text-sm">{deal.clientName || 'לקוח מזומן'}</span>
                    <span className="bg-amber-500/10 text-amber-400 border border-amber-500/20 text-[10px] px-2 py-0.5 rounded font-mono">
                      {deal.id}
                    </span>
                  </div>

                  <div className="text-[11px] text-slate-400 flex items-center gap-3">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-slate-500" />
                      {deal.date}
                    </span>
                    {deal.clientPhone && (
                      <span className="flex items-center gap-1 font-mono">
                        <Phone className="w-3 h-3 text-slate-500" />
                        {deal.clientPhone}
                      </span>
                    )}
                  </div>

                  <div className="text-[11px] text-slate-300">
                    {deal.items.length} פריטים &bull; משקל כולל: <strong className="text-amber-400">{deal.totals.totalWeightGrams.toFixed(2)}g</strong>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-800">
                  <div className="text-left">
                    <span className="text-sm sm:text-base font-black text-amber-400 font-mono block">
                      ₪{deal.totals.totalOfferPriceIls.toLocaleString('he-IL', { minimumFractionDigits: 2 })}
                    </span>
                    <span className="text-[10px] text-slate-500">תשלום במזומן</span>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => onSelectDeal(deal)}
                      className="p-2 bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 rounded-lg border border-amber-500/20 text-xs font-semibold flex items-center gap-1 transition-all"
                      title="טען עסקה לסל"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>הצג קבלה</span>
                    </button>

                    <button
                      onClick={() => onDeleteDeal(deal.id)}
                      className="p-2 text-slate-500 hover:text-red-400 hover:bg-red-950/30 rounded-lg transition-all"
                      title="מחק מההיסטוריה"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
