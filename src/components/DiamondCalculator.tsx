import React, { useState, useEffect } from 'react';
import { Gem, Plus, DollarSign, Calculator, FileCheck, Layers, Sparkles, Check, RefreshCw, Upload, Image as ImageIcon } from 'lucide-react';
import { DiamondItem, DiamondShape, DiamondColor, DiamondClarity, DiamondLab, RatesData } from '../types';

interface DiamondCalculatorProps {
  rates: RatesData | null;
  onAddItem: (item: DiamondItem) => void;
  defaultUsdIlsRate?: number;
}

const SHAPES: { key: DiamondShape; labelHe: string; icon: string }[] = [
  { key: 'Round', labelHe: 'עגול', icon: '🔴' },
  { key: 'Princess', labelHe: 'פרינסס', icon: '⬛' },
  { key: 'Oval', labelHe: 'אובל', icon: '🥚' },
  { key: 'Emerald', labelHe: 'אמרלד', icon: '🟩' },
  { key: 'Pear', labelHe: 'טיפה', icon: '💧' },
  { key: 'Marquise', labelHe: 'מרקיזה', icon: '🍃' },
  { key: 'Radiant', labelHe: 'רדיאנט', icon: '❇️' },
  { key: 'Cushion', labelHe: 'קושון', icon: '⏹️' },
  { key: 'Heart', labelHe: 'לב', icon: '🤍' },
  { key: 'Asscher', labelHe: 'אשר', icon: '🔲' },
];

const COLORS: DiamondColor[] = ['D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'Fancy'];

const CLARITIES: DiamondClarity[] = ['FL', 'IF', 'VVS1', 'VVS2', 'VS1', 'VS2', 'SI1', 'SI2', 'SI3', 'I1', 'I2', 'I3'];

const LABS: DiamondLab[] = ['GIA', 'IGI', 'HRD', 'EGL', 'ללא תעודה'];

export const DiamondCalculator: React.FC<DiamondCalculatorProps> = ({
  rates,
  onAddItem,
  defaultUsdIlsRate = 3.65,
}) => {
  const usdIlsRate = rates?.usdIls || defaultUsdIlsRate;

  // Client Type: B2B vs Private Individual
  const [clientType, setClientType] = useState<'b2b' | 'private'>('b2b');
  const [privateDealType, setPrivateDealType] = useState<'buy_from_private' | 'sell_to_private'>('buy_from_private');
  const [settingDetails, setSettingDetails] = useState<string>(''); // e.g. 'טבעת זהב 18K'

  // Type: single stone or parcel (פאקע)
  const [dealType, setDealType] = useState<'single' | 'parcel'>('single');
  const [shape, setShape] = useState<DiamondShape>('Round');
  const [carat, setCarat] = useState<number>(1.0);
  const [piecesCount, setPiecesCount] = useState<number>(1);
  const [color, setColor] = useState<DiamondColor>('G');
  const [clarity, setClarity] = useState<DiamondClarity>('VS1');
  const [cutGrade, setCutGrade] = useState<string>('Excellent');
  const [fluorescence, setFluorescence] = useState<string>('None');
  const [lab, setLab] = useState<DiamondLab>('GIA');
  const [certNumber, setCertNumber] = useState<string>('');

  // Rapaport & Pricing B2B / Private
  const [rapListPriceUsd, setRapListPriceUsd] = useState<number>(4500); // $/ct list
  const [discountPercent, setDiscountPercent] = useState<number>(30); // % Off Rap
  const [overrideTotalPriceUsd, setOverrideTotalPriceUsd] = useState<string>(''); // manual total $ override
  const [overrideTotalPriceIls, setOverrideTotalPriceIls] = useState<string>(''); // manual total ₪ override for private client
  const [notes, setNotes] = useState<string>('');
  const [photoUrl, setPhotoUrl] = useState<string>('');
  const [addedSuccessAnim, setAddedSuccessAnim] = useState<boolean>(false);

  // Switch default discounts when toggling client type
  const handleClientTypeChange = (newType: 'b2b' | 'private') => {
    setClientType(newType);
    setOverrideTotalPriceUsd('');
    setOverrideTotalPriceIls('');
    if (newType === 'private') {
      setDiscountPercent(50); // Default 50% off for buying from private
    } else {
      setDiscountPercent(30); // Default 30% off for B2B
    }
  };

  // Computed values
  const effectivePricePerCaratUsd = rapListPriceUsd * (1 - discountPercent / 100);
  const calculatedTotalPriceUsd = effectivePricePerCaratUsd * carat;
  
  // Calculate final total USD & ILS taking into account overrides
  let finalTotalPriceUsd = calculatedTotalPriceUsd;
  if (overrideTotalPriceIls !== '' && !isNaN(Number(overrideTotalPriceIls))) {
    finalTotalPriceUsd = Number(overrideTotalPriceIls) / (usdIlsRate || 3.65);
  } else if (overrideTotalPriceUsd !== '' && !isNaN(Number(overrideTotalPriceUsd))) {
    finalTotalPriceUsd = Number(overrideTotalPriceUsd);
  }

  const finalTotalPriceIls = finalTotalPriceUsd * usdIlsRate;
  const rawRapValueUsd = rapListPriceUsd * carat;
  const rawRapValueIls = rawRapValueUsd * usdIlsRate;

  // Quick carat adjustment buttons
  const setQuickCarat = (val: number) => {
    setCarat(Math.max(0.01, Number(val.toFixed(2))));
    setOverrideTotalPriceUsd('');
    setOverrideTotalPriceIls('');
  };

  const handleAddToCart = () => {
    if (carat <= 0) return;

    let titleName = '';
    const shapeLabel = SHAPES.find((s) => s.key === shape)?.labelHe || shape;
    const clientSuffix = clientType === 'private'
      ? (privateDealType === 'buy_from_private' ? ' [קנייה מאדם פרטי]' : ' [מכירה לאדם פרטי]')
      : ' [B2B סוחר]';

    if (dealType === 'single') {
      titleName = `יהלום ${shapeLabel} ${carat.toFixed(2)} ct (${color}/${clarity}${lab !== 'ללא תעודה' ? ' - ' + lab : ''})${clientSuffix}`;
    } else {
      titleName = `חבילת יהלומים (פאקע) ${carat.toFixed(2)} ct (${piecesCount} אבנים)${clientSuffix}`;
    }

    if (settingDetails) {
      titleName += ` (${settingDetails})`;
    }

    const newItem: DiamondItem = {
      id: 'diamond_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
      category: 'diamond',
      name: titleName,
      itemType: dealType,
      shape,
      caratWeight: carat,
      piecesCount: dealType === 'parcel' ? piecesCount : 1,
      color,
      clarity,
      cutGrade,
      fluorescence,
      lab,
      certNumber: certNumber ? certNumber.trim() : undefined,
      rapListPriceUsd,
      dealerDiscountPercent: Number(discountPercent.toFixed(1)),
      pricePerCaratUsd: Number((finalTotalPriceUsd / (carat || 1)).toFixed(2)),
      totalPriceUsd: Number(finalTotalPriceUsd.toFixed(2)),
      offerPriceIls: Number(finalTotalPriceIls.toFixed(2)),
      weightGrams: Number((carat * 0.2).toFixed(3)), // 1 ct = 0.2g
      rawValueIls: Number(rawRapValueIls.toFixed(2)),
      profitIls: Number((rawRapValueIls - finalTotalPriceIls).toFixed(2)),
      clientType,
      privateDealType: clientType === 'private' ? privateDealType : undefined,
      settingDetails: settingDetails || undefined,
      itemPhotoUrl: photoUrl || undefined,
      notes: notes || undefined,
    };

    onAddItem(newItem);
    setAddedSuccessAnim(true);
    setTimeout(() => setAddedSuccessAnim(false), 1500);

    // Reset notes & photos
    setNotes('');
    setPhotoUrl('');
    setOverrideTotalPriceUsd('');
    setOverrideTotalPriceIls('');
  };

  return (
    <div id="diamond-calculator-top" className="bg-slate-900 border border-amber-500/30 rounded-2xl p-4 sm:p-6 shadow-2xl space-y-6 dir-rtl text-slate-100">
      {/* Title & Client Type Switcher */}
      <div className="space-y-4 border-b border-slate-800 pb-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-gradient-to-br from-cyan-500/20 via-blue-500/20 to-amber-500/20 text-cyan-300 rounded-xl border border-cyan-500/30 shadow-lg">
              <Gem className="w-6 h-6 stroke-[2]" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-black text-white flex items-center gap-2">
                מחשבון מסחר ביהלומים
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                  clientType === 'private'
                    ? 'bg-amber-950 text-amber-300 border-amber-800'
                    : 'bg-cyan-950 text-cyan-300 border-cyan-800'
                }`}>
                  {clientType === 'private' ? 'אדם פרטי (B2C)' : 'סוחר B2B (רפפורט)'}
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                {clientType === 'private'
                  ? 'תמחור והערכת שווי קנייה/מכירה של יהלומים ותכשיטי יהלום מול לקוחות פרטיים'
                  : 'תמחור יהלומים בין סוחרים לפי מחירון רפפורט ($/ct), קראט, צבע וניקיון'}
              </p>
            </div>
          </div>

          {/* Toggle Single vs Parcel */}
          <div className="bg-slate-950 p-1 rounded-xl border border-slate-800 flex items-center gap-1 self-start sm:self-auto">
            <button
              type="button"
              onClick={() => setDealType('single')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                dealType === 'single'
                  ? 'bg-amber-500 text-slate-950 shadow-md font-black'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Gem className="w-3.5 h-3.5" />
              <span>אבן יחידה</span>
            </button>
            <button
              type="button"
              onClick={() => setDealType('parcel')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                dealType === 'parcel'
                  ? 'bg-amber-500 text-slate-950 shadow-md font-black'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>חבילה (פאקע)</span>
            </button>
          </div>
        </div>

        {/* Major Toggle: B2B Dealer vs Private Individual (אדם פרטי) */}
        <div className="bg-slate-950 p-1.5 rounded-2xl border border-slate-800 grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => handleClientTypeChange('b2b')}
            className={`py-2.5 px-4 rounded-xl text-xs sm:text-sm font-black transition-all flex items-center justify-center gap-2 ${
              clientType === 'b2b'
                ? 'bg-cyan-500 text-slate-950 shadow-lg shadow-cyan-500/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>סוחר B2B (עסקה בין סוחרים)</span>
          </button>

          <button
            type="button"
            onClick={() => handleClientTypeChange('private')}
            className={`py-2.5 px-4 rounded-xl text-xs sm:text-sm font-black transition-all flex items-center justify-center gap-2 ${
              clientType === 'private'
                ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 shadow-lg shadow-amber-500/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            <Calculator className="w-4 h-4" />
            <span>👤 אדם פרטי (קנייה / מכירה מפרטי)</span>
          </button>
        </div>

        {/* Extra options for Private Individual */}
        {clientType === 'private' && (
          <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-3 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div>
              <label className="text-amber-300 font-bold block mb-1">סוג העסקה מול האדם הפרטי:</label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setPrivateDealType('buy_from_private')}
                  className={`flex-1 py-1.5 px-3 rounded-lg font-bold transition-all border ${
                    privateDealType === 'buy_from_private'
                      ? 'bg-amber-500 text-slate-950 border-amber-400'
                      : 'bg-slate-900 text-slate-300 border-slate-800'
                  }`}
                >
                  📥 קנייה מאדם פרטי
                </button>
                <button
                  type="button"
                  onClick={() => setPrivateDealType('sell_to_private')}
                  className={`flex-1 py-1.5 px-3 rounded-lg font-bold transition-all border ${
                    privateDealType === 'sell_to_private'
                      ? 'bg-amber-500 text-slate-950 border-amber-400'
                      : 'bg-slate-900 text-slate-300 border-slate-800'
                  }`}
                >
                  📤 מכירה לאדם פרטי
                </button>
              </div>
            </div>

            <div>
              <label className="text-amber-300 font-bold block mb-1">תיאור שיבוץ / תכשיט (רשות):</label>
              <input
                type="text"
                value={settingDetails}
                onChange={(e) => setSettingDetails(e.target.value)}
                placeholder="לדוגמה: טבעת אירוסין זהב לבן 18K / תליון..."
                className="w-full bg-slate-900 border border-slate-700 focus:border-amber-400 rounded-lg py-1.5 px-3 text-xs text-white"
              />
            </div>
          </div>
        )}
      </div>

      {/* 1. Diamond Shape Picker */}
      <div className="space-y-2">
        <label className="text-xs font-bold text-amber-300 block uppercase">
          1. צורת הליטוש (Shape):
        </label>
        <div className="grid grid-cols-5 sm:grid-cols-10 gap-1.5">
          {SHAPES.map((s) => {
            const isSelected = shape === s.key;
            return (
              <button
                key={s.key}
                type="button"
                onClick={() => setShape(s.key)}
                className={`p-2 rounded-xl border text-center transition-all flex flex-col items-center justify-center gap-1 ${
                  isSelected
                    ? 'bg-amber-500/20 border-amber-400 text-amber-300 font-bold shadow-md scale-105'
                    : 'bg-slate-950/80 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-white'
                }`}
              >
                <span className="text-base">{s.icon}</span>
                <span className="text-[10px] truncate w-full">{s.labelHe}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Carat Weight Input + Quick Shortcuts */}
      <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold text-amber-300 uppercase flex items-center gap-1.5">
            <Calculator className="w-4 h-4 text-amber-400" />
            2. משקל בקראט (Carat Weight - ct):
          </label>
          <span className="text-xs text-slate-400 font-mono">
            {carat.toFixed(2)}ct = {(carat * 0.2).toFixed(2)}g
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-center">
          <div className="relative">
            <input
              type="number"
              step="0.01"
              min="0.01"
              value={carat}
              onChange={(e) => setQuickCarat(parseFloat(e.target.value) || 0)}
              className="w-full bg-slate-900 border-2 border-amber-500/40 focus:border-amber-400 rounded-xl py-2.5 px-3 text-lg font-black text-amber-300 font-mono text-center focus:outline-none"
            />
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
              ct
            </span>
          </div>

          {dealType === 'parcel' && (
            <div className="relative">
              <label className="text-[10px] text-slate-400 block mb-1">מספר אבנים בחבילה:</label>
              <input
                type="number"
                min="1"
                value={piecesCount}
                onChange={(e) => setPiecesCount(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl py-2 px-3 text-sm font-bold text-white font-mono text-center focus:outline-none"
              />
              <span className="text-[10px] text-amber-300 block text-center mt-0.5 font-mono">
                ממוצע: {(carat / piecesCount).toFixed(2)} ct/אבן
              </span>
            </div>
          )}

          <div className="sm:col-span-2 flex items-center gap-1.5 flex-wrap">
            {[0.30, 0.50, 0.70, 0.90, 1.00, 1.20, 1.50, 2.00].map((quick) => (
              <button
                key={quick}
                type="button"
                onClick={() => setQuickCarat(quick)}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold font-mono border transition-all ${
                  carat === quick
                    ? 'bg-amber-500 text-slate-950 border-amber-400 font-black'
                    : 'bg-slate-900 text-slate-300 border-slate-800 hover:border-slate-700'
                }`}
              >
                {quick.toFixed(2)}ct
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 3. Color & Clarity Selectors */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Color Grade */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-amber-300 block uppercase">
            3. דרגת צבע (Color Grade):
          </label>
          <div className="grid grid-cols-6 sm:grid-cols-11 gap-1">
            {COLORS.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setColor(c)}
                className={`py-1.5 text-xs font-black font-mono rounded-lg border transition-all ${
                  color === c
                    ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-md'
                    : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'
                }`}
              >
                {c}
              </button>
            ))}
          </div>
          <span className="text-[10px] text-slate-400 block">
            D-F: ללא צבע (Colorless) &bull; G-J: כמעט ללא צבע &bull; Fancy: צבעוני
          </span>
        </div>

        {/* Clarity Grade */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-amber-300 block uppercase">
            4. דרגת ניקיון (Clarity Grade):
          </label>
          <div className="grid grid-cols-4 sm:grid-cols-6 gap-1">
            {CLARITIES.map((cl) => (
              <button
                key={cl}
                type="button"
                onClick={() => setClarity(cl)}
                className={`py-1.5 text-xs font-black font-mono rounded-lg border transition-all ${
                  clarity === cl
                    ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-md'
                    : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'
                }`}
              >
                {cl}
              </button>
            ))}
          </div>
          <span className="text-[10px] text-slate-400 block">
            FL/IF: נקי מוחלט &bull; VVS/VS: נקי מאוד &bull; SI/I: תכלילים קלים
          </span>
        </div>
      </div>

      {/* 4. Lab Certificate & Attributes */}
      <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div>
          <label className="text-xs font-bold text-slate-300 block mb-1">
            תעודה גמולוגית (Lab):
          </label>
          <div className="flex items-center gap-1">
            {LABS.map((l) => (
              <button
                key={l}
                type="button"
                onClick={() => setLab(l)}
                className={`px-2 py-1 rounded text-xs font-bold border transition-all flex-1 ${
                  lab === l
                    ? 'bg-amber-500 text-slate-950 border-amber-400'
                    : 'bg-slate-900 text-slate-400 border-slate-800'
                }`}
              >
                {l}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="text-xs font-bold text-slate-300 block mb-1">
            מספר תעודה גמולוגית (Cert #):
          </label>
          <input
            type="text"
            value={certNumber}
            onChange={(e) => setCertNumber(e.target.value)}
            placeholder="לדוגמה: 248910283..."
            className="w-full bg-slate-900 border border-slate-800 focus:border-amber-500 rounded-xl py-1.5 px-3 text-xs text-white placeholder-slate-500 font-mono"
          />
        </div>

        <div>
          <label className="text-xs font-bold text-slate-300 block mb-1">
            חיתוך / פלואורסצנטיות:
          </label>
          <div className="grid grid-cols-2 gap-1 text-xs">
            <select
              value={cutGrade}
              onChange={(e) => setCutGrade(e.target.value)}
              className="bg-slate-900 border border-slate-800 rounded-xl py-1 px-2 text-xs text-slate-200"
            >
              <option value="Excellent">Excellent</option>
              <option value="Very Good">Very Good</option>
              <option value="Good">Good</option>
            </select>
            <select
              value={fluorescence}
              onChange={(e) => setFluorescence(e.target.value)}
              className="bg-slate-900 border border-slate-800 rounded-xl py-1 px-2 text-xs text-slate-200"
            >
              <option value="None">Fluor: None</option>
              <option value="Faint">Fluor: Faint</option>
              <option value="Medium">Fluor: Medium</option>
              <option value="Strong">Fluor: Strong</option>
            </select>
          </div>
        </div>
      </div>

      {/* 5. Rapaport & B2B / Private Client Pricing Calculator */}
      <div className="bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 border-2 border-amber-500/40 rounded-2xl p-4 sm:p-5 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-2">
          <div className="flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-amber-400" />
            <h3 className="text-sm sm:text-base font-bold text-white">
              {clientType === 'private'
                ? `תמחור עסקה מול אדם פרטי (${privateDealType === 'buy_from_private' ? 'קנייה מפרטי' : 'מכירה לפרטי'})`
                : 'מחירון רפפורט ותמחור B2B לסוחרים (% Off Rap)'}
            </h3>
          </div>
          <span className="text-xs font-mono text-slate-400">
            שער דולר: <strong className="text-amber-300">₪{usdIlsRate.toFixed(3)}</strong>
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Rapaport List Price $/ct */}
          <div className="bg-slate-900 p-3 rounded-xl border border-slate-800">
            <label className="text-[11px] text-slate-400 font-bold block mb-1">
              מחירון רפפורט ($/ct):
            </label>
            <div className="relative">
              <input
                type="number"
                step="50"
                value={rapListPriceUsd}
                onChange={(e) => {
                  setRapListPriceUsd(Number(e.target.value) || 0);
                  setOverrideTotalPriceUsd('');
                  setOverrideTotalPriceIls('');
                }}
                className="w-full bg-slate-950 border border-slate-700 focus:border-amber-400 rounded-lg py-1.5 pr-3 pl-7 text-sm font-black font-mono text-amber-300 text-left dir-ltr"
              />
              <span className="absolute left-2 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">$</span>
            </div>
          </div>

          {/* Dealer Discount / Margin % Off Rap */}
          <div className="bg-slate-900 p-3 rounded-xl border border-slate-800">
            <label className="text-[11px] text-amber-400 font-bold block mb-1">
              {clientType === 'private' ? 'הנחה/מרווח מהרפפורט (% Off):' : 'הנחת סוחר מהרפפורט (% Off):'}
            </label>
            <div className="relative">
              <input
                type="number"
                step="1"
                min="0"
                max="99"
                value={discountPercent}
                onChange={(e) => {
                  setDiscountPercent(Math.min(99, Math.max(0, Number(e.target.value) || 0)));
                  setOverrideTotalPriceUsd('');
                  setOverrideTotalPriceIls('');
                }}
                className="w-full bg-slate-950 border border-amber-500/50 focus:border-amber-400 rounded-lg py-1.5 pr-3 pl-7 text-sm font-black font-mono text-emerald-400 text-left dir-ltr"
              />
              <span className="absolute left-2 top-1/2 -translate-y-1/2 text-xs font-bold text-amber-400">%</span>
            </div>
          </div>

          {/* Direct Shekel (₪) Price Override for Private Clients */}
          <div className="bg-slate-900 p-3 rounded-xl border border-amber-500/40">
            <label className="text-[11px] text-amber-300 font-bold block mb-1">
              הזן מחיר הצעה בש"ח (₪):
            </label>
            <div className="relative">
              <input
                type="number"
                placeholder="למשל 12500..."
                value={overrideTotalPriceIls}
                onChange={(e) => {
                  const val = e.target.value;
                  setOverrideTotalPriceIls(val);
                  setOverrideTotalPriceUsd('');
                  if (val && !isNaN(Number(val)) && rapListPriceUsd > 0 && carat > 0) {
                    const totalIls = Number(val);
                    const totalUsd = totalIls / (usdIlsRate || 3.65);
                    const calcDisc = (1 - (totalUsd / (rapListPriceUsd * carat))) * 100;
                    setDiscountPercent(Number(calcDisc.toFixed(1)));
                  }
                }}
                className="w-full bg-slate-950 border border-amber-500 focus:border-amber-400 rounded-lg py-1.5 pr-3 pl-7 text-sm font-black font-mono text-amber-300 text-left dir-ltr"
              />
              <span className="absolute left-2 top-1/2 -translate-y-1/2 text-xs font-bold text-amber-400">₪</span>
            </div>
          </div>

          {/* Direct USD ($) Override */}
          <div className="bg-slate-900 p-3 rounded-xl border border-slate-800">
            <label className="text-[11px] text-slate-400 font-bold block mb-1">
              או מחיר כולל בדולר ($):
            </label>
            <div className="relative">
              <input
                type="number"
                placeholder="למשל 3200..."
                value={overrideTotalPriceUsd}
                onChange={(e) => {
                  const val = e.target.value;
                  setOverrideTotalPriceUsd(val);
                  setOverrideTotalPriceIls('');
                  if (val && !isNaN(Number(val)) && rapListPriceUsd > 0 && carat > 0) {
                    const totalUsd = Number(val);
                    const calcDisc = (1 - (totalUsd / (rapListPriceUsd * carat))) * 100;
                    setDiscountPercent(Number(calcDisc.toFixed(1)));
                  }
                }}
                className="w-full bg-slate-950 border border-slate-700 focus:border-amber-400 rounded-lg py-1.5 pr-3 pl-7 text-sm font-black font-mono text-white text-left dir-ltr"
              />
              <span className="absolute left-2 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">$</span>
            </div>
          </div>
        </div>

        {/* Quick Discount Shortcuts */}
        <div className="flex items-center gap-1.5 flex-wrap pt-1 border-t border-slate-800/80">
          <span className="text-[11px] text-slate-400 font-bold ml-1">
            {clientType === 'private'
              ? (privateDealType === 'buy_from_private' ? 'מרווחי קנייה מפרטי נפוצים:' : 'הנחות מכירה לפרטי:')
              : 'הנחות סוחר נפוצות:'}
          </span>
          {(clientType === 'private' && privateDealType === 'buy_from_private'
            ? [35, 40, 45, 50, 55, 60, 65]
            : [15, 20, 25, 30, 35, 40, 45, 50]
          ).map((disc) => (
            <button
              key={disc}
              type="button"
              onClick={() => {
                setDiscountPercent(disc);
                setOverrideTotalPriceUsd('');
                setOverrideTotalPriceIls('');
              }}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold font-mono border transition-all ${
                discountPercent === disc
                  ? 'bg-amber-500 text-slate-950 border-amber-400 font-black'
                  : 'bg-slate-950 text-slate-300 border-slate-800 hover:border-slate-700'
              }`}
            >
              -{disc}%
            </button>
          ))}
        </div>

        {/* Total Final Calculation Box */}
        <div className="bg-slate-950 border-2 border-amber-500/50 rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <span className="text-xs font-bold text-slate-400 block uppercase">
              {clientType === 'private'
                ? (privateDealType === 'buy_from_private' ? 'מחיר מוצע לתשלום ללקוח הפרטי:' : 'מחיר סופי לגבייה מהלקוח הפרטי:')
                : 'סה"כ לתשלום בעסקה (B2B):'}
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-black text-amber-400 font-mono">
                ₪{finalTotalPriceIls.toLocaleString('he-IL', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
              <span className="text-sm font-bold text-slate-300 font-mono">
                (${finalTotalPriceUsd.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })})
              </span>
            </div>
          </div>

          <div className="text-left text-xs text-slate-400 font-mono">
            <span>ערך רפפורט מלא: ₪{rawRapValueIls.toLocaleString('he-IL')}</span>
            <span className="block text-emerald-400 font-bold">
              {clientType === 'private'
                ? `מרווח/הנחה מפרטי: -₪${(rawRapValueIls - finalTotalPriceIls).toLocaleString('he-IL')} (-${discountPercent}%)`
                : `חיסכון B2B: -₪${(rawRapValueIls - finalTotalPriceIls).toLocaleString('he-IL')} (-${discountPercent}%)`}
            </span>
          </div>
        </div>
      </div>

      {/* 6. Notes & Photo URL */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <input
          type="text"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="הערות לסוחר / פרטי אבן / נתונים נוספים..."
          className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl py-2 px-3 text-xs text-slate-100 placeholder-slate-500 focus:outline-none"
        />
        <input
          type="text"
          value={photoUrl}
          onChange={(e) => setPhotoUrl(e.target.value)}
          placeholder="קישור לתמונת אבן או תעודה גמולוגית (URL)..."
          className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl py-2 px-3 text-xs text-slate-100 placeholder-slate-500 focus:outline-none text-left dir-ltr"
        />
      </div>

      {/* Primary Action Button */}
      <button
        type="button"
        onClick={handleAddToCart}
        className="w-full bg-gradient-to-r from-cyan-500 via-blue-600 to-amber-500 hover:from-cyan-400 hover:to-amber-400 text-slate-950 font-black text-base py-4 rounded-xl shadow-xl shadow-cyan-500/20 flex items-center justify-center gap-2 transition-all transform active:scale-98"
      >
        {addedSuccessAnim ? (
          <>
            <Check className="w-6 h-6 stroke-[3]" />
            <span>היהלום התווסף בהצלחה לסל העסקה!</span>
          </>
        ) : (
          <>
            <Plus className="w-6 h-6 stroke-[3]" />
            <span>הוסף יהלום זה לסל העסקה</span>
          </>
        )}
      </button>
    </div>
  );
};
