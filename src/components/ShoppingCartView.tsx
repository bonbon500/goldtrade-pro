import React, { useState } from 'react';
import { ShoppingBag, Trash2, FileText, Send, Save, User, Phone, Edit2, ShieldAlert, CheckCircle2, ChevronDown, ChevronUp, Gem, Coins } from 'lucide-react';
import { TradeItem, CartTotals, RatesData, DiamondItem } from '../types';

interface ShoppingCartViewProps {
  cart: TradeItem[];
  totals: CartTotals;
  rates: RatesData | null;
  onRemoveItem: (id: string) => void;
  onClearCart: () => void;
  onOpenPdfReceipt: (clientName: string, clientPhone: string, notes: string) => void;
  onSendWhatsApp: (clientName: string, clientPhone: string, notes: string) => void;
  onSaveDealToHistory: (clientName: string, clientPhone: string, notes: string) => void;
  clientInfo?: { name: string; phone: string; notes: string };
  onUpdateClientInfo?: (info: { name: string; phone: string; notes: string }) => void;
}

export const ShoppingCartView: React.FC<ShoppingCartViewProps> = ({
  cart,
  totals,
  rates,
  onRemoveItem,
  onClearCart,
  onOpenPdfReceipt,
  onSendWhatsApp,
  onSaveDealToHistory,
  clientInfo,
  onUpdateClientInfo,
}) => {
  const [internalName, setInternalName] = useState('');
  const [internalPhone, setInternalPhone] = useState('');
  const [internalNotes, setInternalNotes] = useState('');

  const clientName = clientInfo ? clientInfo.name : internalName;
  const clientPhone = clientInfo ? clientInfo.phone : internalPhone;
  const clientNotes = clientInfo ? clientInfo.notes : internalNotes;

  const setClientName = (val: string) => {
    if (onUpdateClientInfo && clientInfo) {
      onUpdateClientInfo({ ...clientInfo, name: val });
    } else {
      setInternalName(val);
    }
  };

  const setClientPhone = (val: string) => {
    if (onUpdateClientInfo && clientInfo) {
      onUpdateClientInfo({ ...clientInfo, phone: val });
    } else {
      setInternalPhone(val);
    }
  };

  const setClientNotes = (val: string) => {
    if (onUpdateClientInfo && clientInfo) {
      onUpdateClientInfo({ ...clientInfo, notes: val });
    } else {
      setInternalNotes(val);
    }
  };
  const [showDealerMarginDetails, setShowDealerMarginDetails] = useState(false);
  const [savedSuccessMsg, setSavedSuccessMsg] = useState(false);

  const handleSaveDeal = () => {
    onSaveDealToHistory(clientName, clientPhone, clientNotes);
    setSavedSuccessMsg(true);
    setTimeout(() => setSavedSuccessMsg(false), 2500);
  };

  return (
    <div className="bg-slate-900 border border-amber-500/30 rounded-2xl p-4 sm:p-6 shadow-2xl text-slate-100 relative">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <ShoppingBag className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
              סל פריטי העסקה ({cart.length})
            </h3>
            <p className="text-xs text-slate-400">ריכוז כל הפריטים שהתווספו להצעה הנוכחית</p>
          </div>
        </div>

        {cart.length > 0 && (
          <button
            onClick={onClearCart}
            id="btn-clear-cart"
            className="text-xs text-red-400 hover:text-red-300 flex items-center gap-1 bg-red-950/40 border border-red-900/40 px-2.5 py-1.5 rounded-lg transition-all"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>רוקן סל</span>
          </button>
        )}
      </div>

      {/* Cart Items List */}
      {cart.length === 0 ? (
        <div className="border-2 border-dashed border-slate-800 rounded-xl p-8 text-center text-slate-500 my-4">
          <ShoppingBag className="w-10 h-10 mx-auto mb-2 text-slate-600" />
          <p className="text-sm font-semibold text-slate-400">סל העסקה ריק כעת</p>
          <p className="text-xs text-slate-500 mt-1">
            השתמש במחשבון לעיל כדי להוסיף פריטים (14K, 18K, 21K, 24K)
          </p>
        </div>
      ) : (
        <div className="space-y-2.5 my-4 max-h-[320px] overflow-y-auto pr-1">
          {cart.map((item, idx) => {
            const isDiamond = item.category === 'diamond';
            const diamond = isDiamond ? (item as DiamondItem) : null;

            return (
              <div
                key={item.id}
                className={`bg-slate-950 border rounded-xl p-3 flex items-center justify-between gap-3 transition-all ${
                  isDiamond ? 'border-cyan-500/40 hover:border-cyan-400' : 'border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center gap-3">
                  {item.itemPhotoUrl ? (
                    <img
                      src={item.itemPhotoUrl}
                      alt={item.name}
                      className={`w-10 h-10 rounded-lg object-cover border shrink-0 ${
                        isDiamond ? 'border-cyan-500/60' : 'border-amber-500/40'
                      }`}
                    />
                  ) : isDiamond ? (
                    <div className="w-9 h-9 rounded-lg bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 flex items-center justify-center font-black text-xs shrink-0">
                      <Gem className="w-5 h-5 text-cyan-300" />
                    </div>
                  ) : (
                    <div className="w-8 h-8 rounded-lg bg-amber-500/20 border border-amber-500/30 text-amber-300 flex items-center justify-center font-black text-xs font-mono shrink-0">
                      {item.karat ? `${item.karat}K` : 'זהב'}
                    </div>
                  )}

                  <div>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <h4 className="text-xs sm:text-sm font-bold text-slate-200">
                        {idx + 1}. {item.name}
                      </h4>
                      {isDiamond ? (
                        <span className="text-[10px] bg-cyan-950 text-cyan-300 border border-cyan-800 px-1.5 py-0.5 rounded font-bold">
                          יהלום Rap: -{diamond?.dealerDiscountPercent}%
                        </span>
                      ) : (
                        item.itemType && (
                          <span className="text-[10px] bg-slate-800 text-amber-300 px-1.5 py-0.5 rounded border border-slate-700">
                            {item.itemType}
                          </span>
                        )
                      )}
                    </div>

                    {/* Specifications */}
                    {isDiamond && diamond ? (
                      <div className="text-[11px] text-slate-400 flex items-center gap-2 mt-0.5 flex-wrap font-mono">
                        <span>משקל: <strong className="text-cyan-300 font-bold">{diamond.caratWeight.toFixed(2)} ct</strong></span>
                        <span>&bull;</span>
                        <span>צבע/ניקיון: <strong className="text-white">{diamond.color}/{diamond.clarity}</strong></span>
                        <span>&bull;</span>
                        <span>מעבדה: {diamond.lab} {diamond.certNumber ? `(#${diamond.certNumber})` : ''}</span>
                        <span>&bull;</span>
                        <span>מחיר: ${diamond.pricePerCaratUsd.toFixed(0)}/ct</span>
                      </div>
                    ) : (
                      <div className="text-[11px] text-slate-400 flex items-center gap-2 mt-0.5 flex-wrap">
                        <span>קראט: <strong className="text-amber-300 font-mono">{item.karat}K</strong></span>
                        <span>&bull;</span>
                        <span>משקל: <strong className="text-white font-mono">{item.weightGrams} גרם</strong></span>
                        <span>&bull;</span>
                        <span>טוהר: {((item.purityPercent || 0) * 100).toFixed(1)}%</span>
                      </div>
                    )}

                    {item.notes && (
                      <p className="text-[11px] text-amber-200/80 italic mt-0.5">
                        הערה: {item.notes}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-left">
                    <span className="text-sm sm:text-base font-black text-amber-400 font-mono block">
                      ₪{item.offerPriceIls.toLocaleString('he-IL', { minimumFractionDigits: 2 })}
                    </span>
                    <span className="text-[10px] text-slate-500 block">
                      {isDiamond && diamond
                        ? `$${diamond.totalPriceUsd.toLocaleString('en-US')}`
                        : `₪${(item.offerPriceIls / (item.weightGrams || 1)).toFixed(1)}/גרם`}
                    </span>
                  </div>

                  <button
                    onClick={() => onRemoveItem(item.id)}
                    id={`btn-remove-item-${item.id}`}
                    className="p-1.5 text-slate-500 hover:text-red-400 hover:bg-red-950/30 rounded-lg transition-all"
                    title="מחק פריט"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Aggregate Totals Summary Panel */}
      {cart.length > 0 && (
        <div className="bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 border-2 border-amber-500/40 rounded-xl p-4 my-4">
          <div className="grid grid-cols-2 gap-3 pb-3 border-b border-slate-800 text-xs text-slate-300">
            <div>
              <span className="text-slate-400 block text-[11px]">סה"כ פריטים בסל:</span>
              <span className="text-base font-bold text-white">{totals.totalItems} פריטים</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[11px]">סה"כ משקל זהב מצטבר:</span>
              <span className="text-base font-bold text-amber-300 font-mono">
                {totals.totalWeightGrams.toFixed(2)} גרם
              </span>
            </div>
          </div>

          {/* Big Total Customer Payout */}
          <div className="pt-3 flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                סה"כ לתשלום ללקוח:
              </span>
              <span className="text-2xl sm:text-3xl font-black text-amber-400 font-mono">
                ₪{totals.totalOfferPriceIls.toLocaleString('he-IL', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>

            <button
              onClick={() => setShowDealerMarginDetails(!showDealerMarginDetails)}
              className="text-xs text-slate-400 hover:text-slate-200 flex items-center gap-1 bg-slate-800/80 px-2.5 py-1 rounded-lg border border-slate-700"
            >
              <span>{showDealerMarginDetails ? 'הסתר רווח סוחר' : 'מאזן סוחר'}</span>
              {showDealerMarginDetails ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>
          </div>

          {/* Private Dealer Margin Details */}
          {showDealerMarginDetails && (
            <div className="mt-3 pt-3 border-t border-slate-800/80 text-xs grid grid-cols-2 gap-3 bg-amber-500/10 p-3 rounded-lg border border-amber-500/20">
              <div>
                <span className="text-slate-400 block text-[11px]">שווי שוק גולמי מלא (100%):</span>
                <span className="font-bold text-slate-200 font-mono">
                  ₪{totals.totalRawValueIls.toLocaleString('he-IL', { minimumFractionDigits: 2 })}
                </span>
              </div>
              <div>
                <span className="text-emerald-400 font-bold block text-[11px]">רווח סוחר מצטבר:</span>
                <span className="font-black text-emerald-400 font-mono">
                  +₪{totals.totalDealerProfitIls.toLocaleString('he-IL', { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Customer Information Form Inputs */}
      <div className="space-y-3 pt-2 border-t border-slate-800">
        <span className="text-xs font-bold text-amber-300 uppercase tracking-wider block">
          פרטי לקוח ותיעוד העסקה:
        </span>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          <div className="relative">
            <User className="w-4 h-4 text-slate-500 absolute right-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={clientName}
              onChange={(e) => setClientName(e.target.value)}
              placeholder="שם הלקוח / מזהה..."
              id="input-client-name"
              className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl py-2.5 pr-9 pl-3 text-xs text-slate-100 placeholder-slate-500 focus:outline-none"
            />
          </div>

          <div className="relative">
            <Phone className="w-4 h-4 text-slate-500 absolute right-3 top-1/2 -translate-y-1/2" />
            <input
              type="tel"
              value={clientPhone}
              onChange={(e) => setClientPhone(e.target.value)}
              placeholder="מספר טלפון (לוואטסאפ)..."
              id="input-client-phone"
              className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl py-2.5 pr-9 pl-3 text-xs text-slate-100 placeholder-slate-500 focus:outline-none text-left dir-ltr"
            />
          </div>
        </div>

        <input
          type="text"
          value={clientNotes}
          onChange={(e) => setClientNotes(e.target.value)}
          placeholder="הערות לעסקה / תעודת זהות / פרטי תשלום במזומן..."
          id="input-client-notes"
          className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl py-2 pr-3 pl-3 text-xs text-slate-100 placeholder-slate-500 focus:outline-none"
        />
      </div>

      {/* Primary Deal Action Buttons */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mt-5">
        {/* PDF Receipt Trigger */}
        <button
          type="button"
          onClick={() => onOpenPdfReceipt(clientName, clientPhone, clientNotes)}
          disabled={cart.length === 0}
          id="btn-generate-pdf-receipt"
          className="flex items-center justify-center gap-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold py-3 px-3 rounded-xl text-xs shadow-lg shadow-amber-500/20 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <FileText className="w-4 h-4 text-slate-950" />
          <span>הפק מסמך PDF</span>
        </button>

        {/* WhatsApp Send */}
        <button
          type="button"
          onClick={() => onSendWhatsApp(clientName, clientPhone, clientNotes)}
          disabled={cart.length === 0}
          id="btn-whatsapp-send"
          className="flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 px-3 rounded-xl text-xs shadow-lg shadow-emerald-600/20 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Send className="w-4 h-4" />
          <span>שלח בוואטסאפ (ועתק)</span>
        </button>

        {/* Save Deal to Local History */}
        <button
          type="button"
          onClick={handleSaveDeal}
          disabled={cart.length === 0}
          id="btn-save-deal"
          className="flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold py-3 px-3 rounded-xl text-xs transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {savedSuccessMsg ? (
            <>
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span className="text-emerald-400">הנשמר בהיסטוריה!</span>
            </>
          ) : (
            <>
              <Save className="w-4 h-4 text-amber-400" />
              <span>שמור עסקה</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
