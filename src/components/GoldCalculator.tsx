import React, { useState, useEffect } from 'react';
import { Camera, Plus, Eye, EyeOff, Scale, Settings, Check, Image, FileText, ChevronDown } from 'lucide-react';
import { RatesData, GoldItem } from '../types';

interface GoldCalculatorProps {
  rates: RatesData | null;
  defaultMarginPercent: number;
  onAddItem: (item: GoldItem) => void;
  onOpenOcrCamera: () => void;
  scannedWeight: number | null;
  clearScannedWeight: () => void;
  onOpenSettings?: () => void;
  cartCount?: number;
}

// Strictly 9, 14, 18, 24 Karats - NO purity text displayed per user specification
const ALLOWED_KARATS = [
  { label: '9K', karat: 9, purity: 0.375 },
  { label: '14K', karat: 14, purity: 0.585 },
  { label: '18K', karat: 18, purity: 0.750 },
  { label: '24K', karat: 24, purity: 0.999 },
];

const ITEM_TYPES = [
  'שרשרת',
  'צמיד',
  'טבעת',
  'עגילים',
  'מטבע',
  'מטיל/שילב',
  'זהב שבור/פסולת',
  'אחר',
];

export const GoldCalculator: React.FC<GoldCalculatorProps> = ({
  rates,
  defaultMarginPercent,
  onAddItem,
  onOpenOcrCamera,
  scannedWeight,
  clearScannedWeight,
  onOpenSettings,
  cartCount = 0,
}) => {
  const [selectedKarat, setSelectedKarat] = useState<number>(14);
  const [selectedType, setSelectedType] = useState<string>('שרשרת');
  const [itemName, setItemName] = useState('שרשרת 14K');
  const [itemNotes, setItemNotes] = useState('');
  const [weightInput, setWeightInput] = useState<string>('0');
  const [marginPercent, setMarginPercent] = useState<number>(defaultMarginPercent);
  const [isDiscountEnabled, setIsDiscountEnabled] = useState<boolean>(true);
  const [showDealerPrivate, setShowDealerPrivate] = useState<boolean>(true);
  const [itemPhotoUrl, setItemPhotoUrl] = useState<string>('');
  const [addedSuccessAnim, setAddedSuccessAnim] = useState<boolean>(false);

  // Sync margin when default changes
  useEffect(() => {
    setMarginPercent(defaultMarginPercent);
  }, [defaultMarginPercent]);

  // Sync scanned weight from OCR Camera
  useEffect(() => {
    if (scannedWeight !== null && scannedWeight > 0) {
      setWeightInput(scannedWeight.toString());
      clearScannedWeight();
    }
  }, [scannedWeight, clearScannedWeight]);

  const handleSelectType = (typeStr: string) => {
    setSelectedType(typeStr);
    setItemName(`${typeStr} ${selectedKarat}K`);
  };

  const handleKaratChange = (karatVal: number) => {
    setSelectedKarat(karatVal);
    setItemName(`${selectedType} ${karatVal}K`);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setItemPhotoUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const weightGrams = parseFloat(weightInput) || 0;
  const currentKaratObj = ALLOWED_KARATS.find((k) => k.karat === selectedKarat) || {
    label: `${selectedKarat}K`,
    karat: selectedKarat,
    purity: selectedKarat / 24,
  };
  const currentPurity = currentKaratObj.purity;

  // Pricing formula
  const xauUsd = rates?.xauUsd || 3310.50;
  const usdIls = rates?.usdIls || 3.65;
  const gramPureIls = (xauUsd / 31.1034768) * usdIls;

  const rawMarketValueIls = weightGrams * currentPurity * gramPureIls;
  const effectiveMarginPercent = isDiscountEnabled ? marginPercent : 0;
  const marginRatio = (100 - effectiveMarginPercent) / 100;
  const clientOfferPriceIls = rawMarketValueIls * marginRatio;
  const dealerProfitIls = rawMarketValueIls - clientOfferPriceIls;

  const scrollToCalcTop = () => {
    document.getElementById('calculator-top')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const handleAddToCart = () => {
    if (weightGrams <= 0) return;

    const newItem: GoldItem = {
      id: 'item_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
      name: itemName || `${selectedType} ${selectedKarat}K`,
      itemType: selectedType,
      weightGrams: Number(weightGrams.toFixed(2)),
      karat: selectedKarat,
      purityPercent: Number(currentPurity.toFixed(3)),
      marginPercent: Number(effectiveMarginPercent.toFixed(1)),
      rawValueIls: Number(rawMarketValueIls.toFixed(2)),
      offerPriceIls: Number(clientOfferPriceIls.toFixed(2)),
      profitIls: Number(dealerProfitIls.toFixed(2)),
      itemPhotoUrl: itemPhotoUrl || undefined,
      notes: itemNotes || undefined,
    };

    onAddItem(newItem);
    setAddedSuccessAnim(true);
    setTimeout(() => setAddedSuccessAnim(false), 1500);

    setWeightInput('0');
    setItemNotes('');
    setItemPhotoUrl('');
    scrollToCalcTop();
  };

  // Weight increment helper (supports 1g, 0.5g, 0.1g, 0.01g, 0.25g, etc.)
  const addWeight = (delta: number) => {
    const current = parseFloat(weightInput) || 0;
    const updated = Math.max(0, current + delta);
    // Format appropriately: integers or decimals
    if (delta >= 1 && updated % 1 === 0) {
      setWeightInput(updated.toString());
    } else {
      setWeightInput(updated.toFixed(2));
    }
  };

  return (
    <div id="calculator-top" className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 sm:p-6 shadow-xl text-slate-100 dir-rtl scroll-mt-20">
      {/* Minimal Header */}
      <div className="flex items-center justify-between border-b border-slate-800/80 pb-3 mb-4 flex-wrap gap-2">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <Scale className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-100">הזנת פרטי פריט זהב</h3>
            <p className="text-[11px] text-slate-400">בחר קראט, הזן משקל וסוג הפריט</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {onOpenSettings && (
            <button
              onClick={onOpenSettings}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-medium bg-slate-800/80 hover:bg-slate-800 border border-slate-700 text-slate-300 transition-all"
            >
              <Settings className="w-3.5 h-3.5 text-amber-400" />
              <span>עמלה: <strong className="text-amber-400">{marginPercent}%</strong></span>
            </button>
          )}

          <button
            onClick={() => setShowDealerPrivate(!showDealerPrivate)}
            className={`flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
              showDealerPrivate
                ? 'bg-amber-500/10 border-amber-500/30 text-amber-300'
                : 'bg-slate-800 border-slate-700 text-slate-400'
            }`}
            title="הצג/הסתר תצוגת רווח"
          >
            {showDealerPrivate ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
            <span className="hidden sm:inline">{showDealerPrivate ? 'רווח סוחר' : 'חסוי'}</span>
          </button>
        </div>
      </div>

      <div className="space-y-4">
        {/* Karat Selection (ONLY 9, 14, 18, 24) - NO Purity Text */}
        <div>
          <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block mb-2">
            סוג קראט:
          </label>
          <div className="grid grid-cols-4 gap-2">
            {ALLOWED_KARATS.map((k) => {
              const isSelected = selectedKarat === k.karat;
              return (
                <button
                  key={k.karat}
                  type="button"
                  onClick={() => handleKaratChange(k.karat)}
                  className={`py-2.5 rounded-xl text-center font-black text-sm transition-all border ${
                    isSelected
                      ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-md shadow-amber-500/20 scale-[1.02]'
                      : 'bg-slate-950 border-slate-800 text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  {k.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Item Type & Custom Title */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-bold text-slate-300 block mb-1.5">סוג הפריט:</label>
            <div className="relative">
              <select
                value={selectedType}
                onChange={(e) => handleSelectType(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 text-slate-100 font-bold text-xs py-2.5 px-3 rounded-xl appearance-none focus:outline-none focus:border-amber-500 cursor-pointer"
              >
                {ITEM_TYPES.map((t) => (
                  <option key={t} value={t} className="bg-slate-900 text-slate-100">
                    {t}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-300 block mb-1.5">כותרת הפריט:</label>
            <input
              type="text"
              value={itemName}
              onChange={(e) => setItemName(e.target.value)}
              placeholder="שם הפריט..."
              className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl py-2 px-3 text-xs text-slate-100 focus:outline-none"
            />
          </div>
        </div>

        {/* Weight Section (Manual Entry + Increments for 1g, 0.5g, 0.1g, 0.01g & small fractions) */}
        <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-3.5 space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-amber-400 uppercase tracking-wider">
              משקל בגרמים:
            </label>
            <span className="text-[10px] text-slate-400">הקלד או השתמש בלחצני הוספה</span>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <input
                type="number"
                step="0.01"
                min="0"
                value={weightInput}
                onChange={(e) => setWeightInput(e.target.value)}
                placeholder="0.00"
                className="w-full bg-slate-900 border-2 border-slate-700 focus:border-amber-400 rounded-xl py-2 px-3.5 text-2xl font-black text-amber-300 font-mono focus:outline-none pl-12"
              />
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                גרם
              </span>
            </div>

            {/* OCR Camera Trigger */}
            <button
              type="button"
              onClick={onOpenOcrCamera}
              className="bg-slate-800 hover:bg-slate-700 border border-slate-700 text-amber-300 font-bold px-3 py-2.5 rounded-xl text-xs flex items-center gap-1.5 transition-all shrink-0"
              title="סרוק משקל ממאזניים"
            >
              <Camera className="w-4 h-4 text-amber-400" />
              <span className="hidden sm:inline">סרוק</span>
            </button>
          </div>

          {/* Direct Weight Increment Buttons: 1g, 0.5g, 0.1g, 0.01g & Small Fraction Additions */}
          <div className="space-y-1.5 pt-1">
            <span className="text-[10px] font-bold text-slate-400 block">לחצני הוספת משקל מהירה:</span>
            
            {/* Main Primary Additions (+1g, +0.5g, +0.1g, +0.01g) */}
            <div className="grid grid-cols-4 gap-1.5">
              <button
                type="button"
                onClick={() => addWeight(1)}
                className="py-1.5 px-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 rounded-lg text-xs font-bold transition-all text-center"
              >
                +1.0 גרם
              </button>
              <button
                type="button"
                onClick={() => addWeight(0.5)}
                className="py-1.5 px-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-amber-300 rounded-lg text-xs font-bold transition-all text-center"
              >
                +0.5 גרם
              </button>
              <button
                type="button"
                onClick={() => addWeight(0.1)}
                className="py-1.5 px-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-amber-400 rounded-lg text-xs font-bold transition-all text-center"
              >
                +0.1 גרם
              </button>
              <button
                type="button"
                onClick={() => addWeight(0.01)}
                className="py-1.5 px-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-emerald-400 rounded-lg text-xs font-bold transition-all text-center font-mono"
              >
                +0.01 גרם
              </button>
            </div>

            {/* Small Fraction Additions (חלקים קטנים) */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 pt-1 no-scrollbar text-slate-300">
              <span className="text-[10px] text-slate-400 shrink-0">חלקים זעירים:</span>
              {[0.25, 0.05, 0.02, 5, 10].map((val) => (
                <button
                  key={val}
                  type="button"
                  onClick={() => addWeight(val)}
                  className="px-2 py-1 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 rounded text-[11px] font-mono transition-all shrink-0"
                >
                  +{val}g
                </button>
              ))}
              <button
                type="button"
                onClick={() => setWeightInput('')}
                className="px-2 py-1 bg-red-950/40 hover:bg-red-900/60 text-red-400 rounded text-[11px] border border-red-800/30 mr-auto shrink-0"
              >
                איפוס
              </button>
            </div>
          </div>
        </div>

        {/* Optional Notes & Photo Attachment */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="text-[11px] text-slate-400 block mb-1">הערה לפריט (אופציונלי):</label>
            <input
              type="text"
              value={itemNotes}
              onChange={(e) => setItemNotes(e.target.value)}
              placeholder="למשל: אבנים הופחתו..."
              className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl py-1.5 px-2.5 text-xs text-slate-100 focus:outline-none"
            />
          </div>

          <div className="flex items-end">
            <label className="w-full cursor-pointer flex items-center justify-center gap-1.5 text-xs text-amber-400 hover:text-amber-300 bg-slate-950 border border-slate-800 py-2 px-3 rounded-xl transition-all">
              <Image className="w-3.5 h-3.5" />
              <span>{itemPhotoUrl ? 'שנה תמונת פריט' : 'צופף תמונת פריט'}</span>
              <input
                type="file"
                accept="image/*"
                capture="environment"
                onChange={handleImageUpload}
                className="hidden"
              />
            </label>
          </div>
        </div>

        {/* Calculated Output Display */}
        <div className="bg-slate-950 border border-amber-500/30 rounded-xl p-3.5 shadow-inner">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span>מחיר מוצע לפריט במזומן:</span>
            <span className="font-mono text-slate-300">{weightGrams > 0 ? `${weightGrams}g × ${selectedKarat}K` : 'ללא משקל'}</span>
          </div>

          <div className="flex items-baseline justify-between flex-wrap gap-1">
            <span className="text-2xl sm:text-3xl font-black text-amber-400 font-mono">
              ₪{clientOfferPriceIls.toLocaleString('he-IL', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>

            {showDealerPrivate && (
              <span className="text-xs text-emerald-400 font-mono font-bold">
                רווח סוחר: +₪{dealerProfitIls.toFixed(0)}
              </span>
            )}
          </div>
        </div>

        {/* Add Item / Add Another Item Buttons */}
        <div className="space-y-2">
          <button
            type="button"
            onClick={handleAddToCart}
            disabled={weightGrams <= 0}
            className={`w-full py-3.5 px-4 rounded-xl font-black text-xs sm:text-sm flex items-center justify-center gap-2 transition-all shadow-md ${
              addedSuccessAnim
                ? 'bg-emerald-500 text-slate-950 scale-[1.01]'
                : weightGrams > 0
                ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-amber-500/20 active:scale-[0.99]'
                : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
            }`}
          >
            {addedSuccessAnim ? (
              <>
                <Check className="w-5 h-5 stroke-[3]" />
                <span>הפריט נוסף בהצלחה!</span>
              </>
            ) : (
              <>
                <Plus className="w-5 h-5 stroke-[3]" />
                <span>
                  {cartCount > 0
                    ? `הוסף פריט נוסף (${cartCount + 1}) - ₪${clientOfferPriceIls.toFixed(0)}`
                    : `הוסף פריט לסיכום העסקה (₪${clientOfferPriceIls.toFixed(0)})`}
                </span>
              </>
            )}
          </button>

          {cartCount > 0 && (
            <div className="flex items-center justify-between bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/80 text-xs text-slate-300">
              <span className="flex items-center gap-1.5 text-amber-400 font-bold">
                <Check className="w-4 h-4 text-emerald-400" />
                <span>קיימים {cartCount} פריטים בסל</span>
              </span>
              <button
                type="button"
                onClick={() => {
                  setWeightInput('0');
                  setItemNotes('');
                  setItemPhotoUrl('');
                }}
                className="text-[11px] font-bold text-amber-300 hover:text-amber-200 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 px-2.5 py-1 rounded-lg transition-all"
              >
                + איפוס להזנת פריט נוסף
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
