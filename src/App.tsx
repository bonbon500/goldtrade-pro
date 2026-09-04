import React, { useState, useEffect, useCallback } from 'react';
import { HeaderNavbar } from './components/HeaderNavbar';
import { LiveRatesModal } from './components/LiveRatesModal';
import { GoldCalculator } from './components/GoldCalculator';
import { DiamondCalculator } from './components/DiamondCalculator';
import { ShoppingCartView } from './components/ShoppingCartView';
import { CameraOcrModal } from './components/CameraOcrModal';
import { PdfReceiptModal } from './components/PdfReceiptModal';
import { TradeHistoryModal } from './components/TradeHistoryModal';
import { SettingsModal } from './components/SettingsModal';
import { ContactPickerModal } from './components/ContactPickerModal';
import { FlutterFlowSpecCenter } from './components/FlutterFlowSpecCenter';
import { DealerDashboard } from './components/DealerDashboard';
import { TradeItem, RatesData, CartTotals, TradeDeal, BusinessSettings, GoldItem, DiamondItem, ItemCategory } from './types';
import { Coins, User, Phone, FileText, ArrowRight, ArrowLeft, Check, Plus, Trash2, Send, Save, BookUser, ShoppingBag, ExternalLink, RefreshCw, CheckCircle2, LayoutDashboard, Gem, Home, Mail } from 'lucide-react';
import { getLiveGoldAndFxRates, getCachedGoldRates } from './utils/goldRates';

const DEFAULT_SETTINGS: BusinessSettings = {
  businessName: 'גולדטרייד פלוס - סחר בזהב',
  dealerName: 'ישראל ישראלי',
  phone: '054-4332457',
  address: 'רחוב הבורסה 12, רמת גן',
  defaultMarginPercent: 10.0,
};

export default function App() {
  const [mode, setMode] = useState<'app' | 'flutterflow'>('app');
  const [activeStep, setActiveStep] = useState<0 | 1 | 2 | 3>(0); // 0: Personal Dashboard, 1: Customer Info, 2: Deal Items, 3: Deal Summary

  const [rates, setRates] = useState<RatesData | null>(() => {
    const cached = getCachedGoldRates();
    if (cached) {
      return {
        xauUsd: cached.goldOunceUSD,
        usdIls: cached.usdToIls,
        gold24kPerGramUsd: Number((cached.goldOunceUSD / 31.1034768).toFixed(3)),
        gold24kPerGramIls: cached.gram24K,
        purityRatesIls: {
          '24K': cached.gram24K,
          '21K': cached.gram21K,
          '18K': cached.gram18K,
          '14K': cached.gram14K,
          '9K': cached.gram9K,
        },
        timestamp: new Date().toISOString(),
        sources: {
          gold: cached.source || 'זיכרון מקומי',
          fx: 'שער שמור',
        },
      };
    }
    return null;
  });
  const [loadingRates, setLoadingRates] = useState<boolean>(false);

  // Merchant Settings
  const [settings, setSettings] = useState<BusinessSettings>(() => {
    try {
      const saved = localStorage.getItem('goldtrade_settings');
      return saved ? JSON.parse(saved) : DEFAULT_SETTINGS;
    } catch {
      return DEFAULT_SETTINGS;
    }
  });

  // Cart & Deals State
  const [cart, setCart] = useState<TradeItem[]>([]);
  const [activeCalcCategory, setActiveCalcCategory] = useState<ItemCategory>('gold');
  const [history, setHistory] = useState<TradeDeal[]>(() => {
    try {
      const saved = localStorage.getItem('goldtrade_history');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Camera OCR weight bridge
  const [scannedWeight, setScannedWeight] = useState<number | null>(null);

  // Modals visibility
  const [isOcrCameraOpen, setIsOcrCameraOpen] = useState(false);
  const [isPdfReceiptOpen, setIsPdfReceiptOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isRatesModalOpen, setIsRatesModalOpen] = useState(false);
  const [isContactPickerOpen, setIsContactPickerOpen] = useState(false);

  // Client info for active receipt
  const [activeClientInfo, setActiveClientInfo] = useState({
    name: '',
    phone: '',
    email: '',
    notes: '',
  });

  const [customUsdIls, setCustomUsdIls] = useState<number | null>(() => {
    try {
      const saved = localStorage.getItem('goldtrade_custom_usd_ils');
      return saved ? parseFloat(saved) : null;
    } catch {
      return null;
    }
  });

  const [customXauUsd, setCustomXauUsd] = useState<number | null>(() => {
    try {
      const saved = localStorage.getItem('goldtrade_custom_xau_usd');
      return saved ? parseFloat(saved) : null;
    } catch {
      return null;
    }
  });

  const handleSetCustomUsdIls = (rate: number | null) => {
    setCustomUsdIls(rate);
    if (rate === null) {
      localStorage.removeItem('goldtrade_custom_usd_ils');
    } else {
      localStorage.setItem('goldtrade_custom_usd_ils', rate.toString());
    }
  };

  const handleSetCustomXauUsd = (rate: number | null) => {
    setCustomXauUsd(rate);
    if (rate === null) {
      localStorage.removeItem('goldtrade_custom_xau_usd');
    } else {
      localStorage.setItem('goldtrade_custom_xau_usd', rate.toString());
    }
  };

  // Compute effective rates incorporating user custom overrides
  const effectiveUsdIls = customUsdIls ?? rates?.usdIls ?? 3.005;
  const effectiveXauUsd = customXauUsd ?? rates?.xauUsd ?? 4492.89;
  const effectiveGold24kUsd = effectiveXauUsd / 31.1034768;
  const effectiveGold24kIls = effectiveGold24kUsd * effectiveUsdIls;

  const effectiveRates: RatesData = {
    xauUsd: Number(effectiveXauUsd.toFixed(2)),
    usdIls: Number(effectiveUsdIls.toFixed(3)),
    gold24kPerGramUsd: Number(effectiveGold24kUsd.toFixed(3)),
    gold24kPerGramIls: Number(effectiveGold24kIls.toFixed(2)),
    purityRatesIls: {
      '24K': Number(effectiveGold24kIls.toFixed(2)),
      '21K': Number((effectiveGold24kIls * (21 / 24)).toFixed(2)),
      '18K': Number((effectiveGold24kIls * (18 / 24)).toFixed(2)),
      '14K': Number((effectiveGold24kIls * (14 / 24)).toFixed(2)),
      '9K': Number((effectiveGold24kIls * (9 / 24)).toFixed(2)),
    },
    sources: {
      gold: customXauUsd ? 'שער זהב מותאם אישית' : (rates?.sources?.gold || 'שער לייב בזמן אמת'),
      fx: customUsdIls ? 'שער דולר מותאם אישית' : (rates?.sources?.fx || 'שער רציף בזמן אמת'),
    },
    timestamp: rates?.timestamp || new Date().toISOString(),
  };

  // Fetch Live Rates using getLiveGoldAndFxRates with local storage caching & offline resilience
  const fetchRates = useCallback(async () => {
    setLoadingRates(true);
    try {
      const liveData = await getLiveGoldAndFxRates();
      setRates({
        xauUsd: liveData.goldOunceUSD,
        usdIls: liveData.usdToIls,
        gold24kPerGramUsd: Number((liveData.goldOunceUSD / 31.1034768).toFixed(3)),
        gold24kPerGramIls: liveData.gram24K,
        purityRatesIls: {
          '24K': liveData.gram24K,
          '21K': liveData.gram21K,
          '18K': liveData.gram18K,
          '14K': liveData.gram14K,
          '9K': liveData.gram9K,
        },
        timestamp: new Date().toISOString(),
        sources: {
          gold: liveData.source || 'Gold-API (XAU/USD)',
          fx: 'Open ER-API (USD/ILS)',
        },
      });
    } catch (err) {
      console.error('Failed to fetch live rates:', err);
    } finally {
      setLoadingRates(false);
    }
  }, []);

  useEffect(() => {
    fetchRates();
    const interval = setInterval(fetchRates, 10000);
    return () => clearInterval(interval);
  }, [fetchRates]);

  // Compute Cart Aggregate Totals
  const totals: CartTotals = cart.reduce(
    (acc, item) => {
      acc.totalItems += 1;
      acc.totalWeightGrams += item.weightGrams || 0;
      if (item.category === 'diamond') {
        const d = item as DiamondItem;
        acc.totalCarats = (acc.totalCarats || 0) + (d.caratWeight || 0);
      }
      acc.totalRawValueIls += item.rawValueIls || 0;
      acc.totalOfferPriceIls += item.offerPriceIls || 0;
      acc.totalDealerProfitIls += item.profitIls || 0;
      return acc;
    },
    {
      totalItems: 0,
      totalWeightGrams: 0,
      totalCarats: 0,
      totalRawValueIls: 0,
      totalOfferPriceIls: 0,
      totalDealerProfitIls: 0,
      averageMarginPercent: settings.defaultMarginPercent,
    }
  );

  const handleAddItem = (item: TradeItem) => {
    setCart((prev) => [item, ...prev]);
  };

  const handleRemoveItem = (id: string) => {
    setCart((prev) => prev.filter((i) => i.id !== id));
  };

  const handleClearCart = () => {
    setCart([]);
  };

  const handleSaveSettings = (newSettings: BusinessSettings) => {
    setSettings(newSettings);
    localStorage.setItem('goldtrade_settings', JSON.stringify(newSettings));
  };

  const handleSaveDealToHistory = () => {
    if (cart.length === 0 || !rates) return;

    const newDeal: TradeDeal = {
      id: 'DEAL-' + Math.floor(100000 + Math.random() * 900000),
      date: new Date().toLocaleDateString('he-IL', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }),
      clientName: activeClientInfo.name || 'לקוח מזומן בשטח',
      clientPhone: activeClientInfo.phone,
      clientEmail: activeClientInfo.email,
      clientNotes: activeClientInfo.notes,
      items: [...cart],
      ratesSnapshot: rates,
      totals,
      businessName: settings.businessName,
    };

    const updatedHistory = [newDeal, ...history];
    setHistory(updatedHistory);
    localStorage.setItem('goldtrade_history', JSON.stringify(updatedHistory));
  };

  const handleDeleteHistoryDeal = (id: string) => {
    const updated = history.filter((d) => d.id !== id);
    setHistory(updated);
    localStorage.setItem('goldtrade_history', JSON.stringify(updated));
  };

  const handleSendWhatsApp = () => {
    const itemsText = cart
      .map((item, i) => `${i + 1}. *${item.name}* (${item.karat}K) - ${item.weightGrams}g = ₪${item.offerPriceIls.toLocaleString('he-IL')}`)
      .join('\n');

    const text = `שלום ${activeClientInfo.name || 'לקוח יקר'},
להלן סיכום הצעת המחיר לקניית זהב מאת ${settings.businessName}:

⚖️ *סה"כ משקל:* ${totals.totalWeightGrams.toFixed(2)} גרם
💰 *סה"כ לתשלום במזומן:* ₪${totals.totalOfferPriceIls.toLocaleString('he-IL', { minimumFractionDigits: 2 })}

*פירוט פריטים:*
${itemsText}

*שערים ברגע העסקה:*
• XAU/USD: $${effectiveRates.xauUsd.toFixed(2)}
• USD/ILS: ₪${effectiveRates.usdIls.toFixed(3)}

בברכה,
${settings.dealerName} | ${settings.phone}`;

    const encoded = encodeURIComponent(text);
    let cleanPhone = activeClientInfo.phone.replace(/[^0-9]/g, '');
    if (cleanPhone.startsWith('0')) {
      cleanPhone = '972' + cleanPhone.substring(1);
    }

    const url = cleanPhone
      ? `https://api.whatsapp.com/send?phone=${cleanPhone}&text=${encoded}`
      : `https://api.whatsapp.com/send?text=${encoded}`;

    window.open(url, '_blank');
  };

  const handleSelectHistoryDeal = (deal: TradeDeal) => {
    setCart(deal.items);
    setActiveClientInfo({
      name: deal.clientName,
      phone: deal.clientPhone,
      notes: deal.clientNotes || '',
    });
    setIsHistoryOpen(false);
    setActiveStep(3); // Jump straight to deal summary
  };

  const handleStartNewDeal = () => {
    setCart([]);
    setActiveClientInfo({ name: '', phone: '', notes: '' });
    setActiveStep(1);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans dir-rtl select-none pb-24 md:pb-12 transition-colors duration-500">
      {/* Header */}
      <HeaderNavbar
        mode={mode}
        setMode={setMode}
        rates={effectiveRates}
        loadingRates={loadingRates}
        onRefreshRates={fetchRates}
        onOpenRatesModal={() => setIsRatesModalOpen(true)}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenHistory={() => setIsHistoryOpen(true)}
        onGoToDashboard={() => setActiveStep(0)}
        settings={settings}
        cartCount={cart.length}
      />

      {/* Main Workspace */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 pt-6">
        {mode === 'flutterflow' ? (
          <FlutterFlowSpecCenter />
        ) : (
          <div className="space-y-6">
            {/* STEP 0: PERSONAL DEALER DASHBOARD HOME SCREEN */}
            {activeStep === 0 && (
              <DealerDashboard
                settings={settings}
                rates={effectiveRates}
                history={history}
                onStartNewDeal={(category) => {
                  if (category) setActiveCalcCategory(category);
                  setActiveStep(1);
                }}
                onOpenHistory={() => setIsHistoryOpen(true)}
                onOpenSettings={() => setIsSettingsOpen(true)}
                onOpenRatesModal={() => setIsRatesModalOpen(true)}
                onOpenContactPicker={() => setIsContactPickerOpen(true)}
                onViewDealReceipt={(deal) => {
                  setActiveClientInfo({
                    name: deal.clientName,
                    phone: deal.clientPhone,
                    notes: deal.clientNotes || '',
                  });
                  setCart(deal.items);
                  setIsPdfReceiptOpen(true);
                }}
              />
            )}

            {/* WIZARD PROCESS (STEPS 1, 2, 3) */}
            {activeStep > 0 && (
              <>
                {/* Live Spot Rates Quick Bar */}
                <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-3 sm:p-4 shadow-md flex items-center justify-between gap-3 flex-wrap">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20 shrink-0">
                      <Coins className="w-4 h-4" />
                    </div>
                    <div className="text-xs">
                      <span className="font-bold text-slate-200">שערי זהב ודולר לייב: </span>
                      <span className="font-mono text-amber-400 font-bold mr-1">XAU/USD: ${effectiveRates.xauUsd.toFixed(2)}</span>
                      <span className="text-slate-500 mx-1">&bull;</span>
                      <span className="font-mono text-slate-300">USD/ILS: ₪{effectiveRates.usdIls.toFixed(3)}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setActiveStep(0)}
                      className="text-xs text-amber-300 hover:text-amber-200 font-bold bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5"
                      title="דף הבית - חזור לדשבורד"
                    >
                      <Home className="w-4 h-4 text-amber-400" />
                      <span>דף הבית</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsRatesModalOpen(true)}
                      className="text-xs text-amber-400 hover:text-amber-300 font-bold bg-slate-800 hover:bg-slate-700 border border-slate-700 px-3 py-1.5 rounded-xl transition-all"
                    >
                      ערוך שערים
                    </button>
                  </div>
                </div>

                {/* Clean 4-Tab Stepper Bar Including Home Link */}
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-2.5 shadow-lg">
                  <div className="grid grid-cols-4 gap-1.5 sm:gap-2">
                    {[
                      { step: 0, label: '🏠 דף הבית', desc: 'דשבורד' },
                      { step: 1, label: '1. פרטי לקוח', desc: 'הרשמה/קשר' },
                      { step: 2, label: '2. הזנת עסקה', desc: `סל (${cart.length})` },
                      { step: 3, label: '3. סיכום', desc: 'מסמכים' },
                    ].map((item) => {
                      const isActive = activeStep === item.step;
                      const isCompleted = item.step > 0 && activeStep > item.step;
                      return (
                        <button
                          key={item.step}
                          type="button"
                          onClick={() => setActiveStep(item.step as any)}
                          className={`p-2 sm:p-2.5 rounded-xl border text-center transition-all flex flex-col items-center justify-center ${
                            isActive
                              ? 'bg-amber-500 text-slate-950 border-amber-400 font-black shadow-md shadow-amber-500/20 scale-[1.01]'
                              : isCompleted
                              ? 'bg-emerald-950/40 text-emerald-300 border-emerald-800/40 font-bold'
                              : 'bg-slate-950 text-slate-400 border-slate-800 hover:bg-slate-800/50'
                          }`}
                        >
                          <span className="text-xs sm:text-sm font-bold block">{item.label}</span>
                          <span className="text-[10px] opacity-80 block hidden sm:block mt-0.5">{item.desc}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </>
            )}

            {/* STEP 1: CUSTOMER REGISTRATION & CONTACT PICKER */}
            {activeStep === 1 && (
              <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 sm:p-7 shadow-xl space-y-5">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
                      <User className="w-5 h-5" />
                    </div>
                    <div>
                      <h2 className="text-base font-bold text-slate-100">דף 1: הרשמת פרטי הלקוח</h2>
                      <p className="text-xs text-slate-400">הזן פרטים ידנית או משוך ישירות מאנשי הקשר בסלולר</p>
                    </div>
                  </div>

                  {/* Pull from Contacts Button */}
                  <button
                    type="button"
                    onClick={() => setIsContactPickerOpen(true)}
                    className="flex items-center gap-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold px-3.5 py-2 rounded-xl text-xs shadow-md shadow-amber-500/20 transition-all active:scale-95"
                  >
                    <BookUser className="w-4 h-4 stroke-[2.5]" />
                    <span>משוך מאנשי קשר</span>
                  </button>
                </div>

                <div className="space-y-4 max-w-xl mx-auto pt-2">
                  <div>
                    <label className="text-xs font-bold text-slate-300 block mb-1.5">
                      שם הלקוח / שם החברה:
                    </label>
                    <div className="relative">
                      <User className="w-4 h-4 text-slate-500 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                      <input
                        type="text"
                        value={activeClientInfo.name}
                        onChange={(e) => setActiveClientInfo({ ...activeClientInfo, name: e.target.value })}
                        placeholder="הקלד שם מלא או לחץ 'משוך מאנשי קשר'..."
                        className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl py-3 pr-10 pl-4 text-sm text-slate-100 placeholder-slate-500 focus:outline-none shadow-inner"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-300 block mb-1.5">
                      מספר טלפון (לשליחת קבלה בוואטסאפ):
                    </label>
                    <div className="relative">
                      <Phone className="w-4 h-4 text-slate-500 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                      <input
                        type="tel"
                        value={activeClientInfo.phone}
                        onChange={(e) => setActiveClientInfo({ ...activeClientInfo, phone: e.target.value })}
                        placeholder="050-0000000"
                        className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl py-3 pr-10 pl-4 text-sm text-slate-100 placeholder-slate-500 focus:outline-none font-mono text-left dir-ltr shadow-inner"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-300 block mb-1.5">
                      כתובת אימייל (אופציונלי - לשליחת סיכום העסקה במייל):
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-slate-500 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                      <input
                        type="email"
                        value={activeClientInfo.email}
                        onChange={(e) => setActiveClientInfo({ ...activeClientInfo, email: e.target.value })}
                        placeholder="client@example.com"
                        className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl py-3 pr-10 pl-4 text-sm text-slate-100 placeholder-slate-500 focus:outline-none font-mono text-left dir-ltr shadow-inner"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-300 block mb-1.5">
                      תעודת זהות / הערות עסקה (אופציונלי):
                    </label>
                    <div className="relative">
                      <FileText className="w-4 h-4 text-slate-500 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                      <input
                        type="text"
                        value={activeClientInfo.notes}
                        onChange={(e) => setActiveClientInfo({ ...activeClientInfo, notes: e.target.value })}
                        placeholder="מספר ת.ז / דרכון / הערות מיוחדות..."
                        className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl py-3 pr-10 pl-4 text-sm text-slate-100 placeholder-slate-500 focus:outline-none shadow-inner"
                      />
                    </div>
                  </div>

                  {/* Proceed to Step 2 Button */}
                  <div className="pt-4">
                    <button
                      type="button"
                      onClick={() => setActiveStep(2)}
                      className="w-full py-3.5 px-4 bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 hover:from-amber-400 hover:to-amber-300 text-slate-950 font-black text-sm rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 transition-all active:scale-[0.99]"
                    >
                      <span>המשך להזנת פריטי העסקה</span>
                      <ArrowLeft className="w-4 h-4 stroke-[3]" />
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 2: DEAL ITEMS ENTRY & CALCULATORS */}
            {activeStep === 2 && (
              <div className="space-y-6">
                {/* Category Selector Bar: Gold vs Diamond */}
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-2 shadow-lg flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setActiveCalcCategory('gold')}
                    className={`flex-1 py-3 px-4 rounded-xl text-xs sm:text-sm font-black transition-all flex items-center justify-center gap-2 ${
                      activeCalcCategory === 'gold'
                        ? 'bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/20 font-black'
                        : 'bg-slate-950 text-slate-400 border border-slate-800 hover:text-white'
                    }`}
                  >
                    <Coins className="w-4 h-4" />
                    <span>🪙 מחשבון עסקאות זהב</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveCalcCategory('diamond')}
                    className={`flex-1 py-3 px-4 rounded-xl text-xs sm:text-sm font-black transition-all flex items-center justify-center gap-2 ${
                      activeCalcCategory === 'diamond'
                        ? 'bg-gradient-to-r from-cyan-500 via-blue-600 to-amber-500 text-slate-950 shadow-lg shadow-cyan-500/20 font-black'
                        : 'bg-slate-950 text-slate-400 border border-slate-800 hover:text-white'
                    }`}
                  >
                    <Gem className="w-4 h-4" />
                    <span>💎 מחשבון יהלומים (B2B / אדם פרטי)</span>
                  </button>
                </div>

                {/* Render Selected Calculator */}
                {activeCalcCategory === 'gold' ? (
                  <GoldCalculator
                    rates={effectiveRates}
                    defaultMarginPercent={settings.defaultMarginPercent}
                    onAddItem={handleAddItem}
                    onOpenOcrCamera={() => setIsOcrCameraOpen(true)}
                    scannedWeight={scannedWeight}
                    clearScannedWeight={() => setScannedWeight(null)}
                    onOpenSettings={() => setIsSettingsOpen(true)}
                    cartCount={cart.length}
                  />
                ) : (
                  <DiamondCalculator
                    rates={effectiveRates}
                    onAddItem={handleAddItem}
                  />
                )}

                {/* Items Added to Cart in this Deal */}
                {cart.length > 0 && (
                  <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xl space-y-3">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
                      <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                        <ShoppingBag className="w-4 h-4 text-amber-400" />
                        <span>פריטים שהתווספו לעסקה ({cart.length})</span>
                      </h3>
                      <button
                        onClick={handleClearCart}
                        className="text-xs text-red-400 hover:underline"
                      >
                        רוקן הכל
                      </button>
                    </div>

                    <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                      {cart.map((item, idx) => {
                        const isDiamond = item.category === 'diamond';
                        const d = isDiamond ? (item as DiamondItem) : null;

                        return (
                          <div
                            key={item.id}
                            className={`p-3 rounded-xl bg-slate-950 border flex items-center justify-between gap-2 ${
                              isDiamond ? 'border-cyan-500/40' : 'border-slate-800'
                            }`}
                          >
                            <div className="flex items-center gap-2.5">
                              {isDiamond ? (
                                <span className="w-7 h-7 rounded-lg bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 flex items-center justify-center text-xs font-bold shrink-0">
                                  <Gem className="w-4 h-4 text-cyan-300" />
                                </span>
                              ) : (
                                <span className="w-7 h-7 rounded-lg bg-amber-500/10 text-amber-300 border border-amber-500/30 flex items-center justify-center text-xs font-bold font-mono shrink-0">
                                  {item.karat ? `${item.karat}K` : 'זהב'}
                                </span>
                              )}
                              <div>
                                <h4 className="text-xs font-bold text-slate-200">
                                  {idx + 1}. {item.name}
                                </h4>
                                <p className="text-[11px] text-slate-400 font-mono">
                                  {isDiamond && d
                                    ? `${d.caratWeight.toFixed(2)} ct (${d.color}/${d.clarity} ${d.lab})`
                                    : `${item.weightGrams} גרם`}
                                </p>
                              </div>
                            </div>

                            <div className="flex items-center gap-3">
                              <span className="text-xs font-black text-amber-400 font-mono">
                                ₪{item.offerPriceIls.toLocaleString('he-IL')}
                              </span>
                              <button
                                onClick={() => handleRemoveItem(item.id)}
                                className="text-slate-500 hover:text-red-400"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs flex-wrap gap-2">
                      <div className="flex items-center gap-3">
                        <span className="text-slate-400">משקל זהב: <strong className="text-white font-mono">{totals.totalWeightGrams.toFixed(2)}g</strong></span>
                        {(totals.totalCarats || 0) > 0 && (
                          <span className="text-cyan-300 font-bold">קראט יהלומים: <strong className="font-mono">{totals.totalCarats?.toFixed(2)}ct</strong></span>
                        )}
                      </div>
                      <span className="text-slate-400">סה"כ לתשלום סופי: <strong className="text-amber-400 text-sm font-mono">₪{totals.totalOfferPriceIls.toLocaleString('he-IL')}</strong></span>
                    </div>

                    {/* Quick Button to Add Another Item */}
                    <button
                      type="button"
                      onClick={() => {
                        const topElem = document.getElementById('diamond-calculator-top') || document.getElementById('calculator-top');
                        topElem?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                      }}
                      className="w-full py-2.5 px-3 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-300 font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-all"
                    >
                      <Plus className="w-4 h-4 text-amber-400 stroke-[2.5]" />
                      <span>+ הוסף פריט נוסף למחשבון (זהב או יהלום)</span>
                    </button>
                  </div>
                )}

                {/* Step 2 Bottom Navigation Controls */}
                <div className="flex items-center justify-between gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setActiveStep(1)}
                    className="py-3 px-4 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl flex items-center gap-2 border border-slate-700"
                  >
                    <ArrowRight className="w-4 h-4" />
                    <span>חזרה לפרטי לקוח</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveStep(3)}
                    disabled={cart.length === 0}
                    className="py-3 px-5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 text-xs font-black rounded-xl flex items-center gap-2 shadow-md shadow-amber-500/20 disabled:opacity-50"
                  >
                    <span>המשך לסיכום העסקה ({cart.length})</span>
                    <ArrowLeft className="w-4 h-4 stroke-[3]" />
                  </button>
                </div>
              </div>
            )}

            {/* STEP 3: DEAL SUMMARY & DOCUMENT GENERATION */}
            {activeStep === 3 && (() => {
              const uniqueKarats = Array.from(new Set<number>(cart.map((i) => Number(i.karat)))).sort((a: number, b: number) => b - a);
              const activeKarats: number[] = uniqueKarats.length > 0 ? uniqueKarats : [24, 18, 14, 9];

              return (
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 sm:p-7 shadow-xl space-y-6">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div>
                      <h2 className="text-base font-bold text-slate-100">דף 3: סיכום העסקה והפקת קבלה</h2>
                      <p className="text-xs text-slate-400">בדיקה סופית, שליחה בוואטסאפ והורדת קבלת PDF</p>
                    </div>
                  </div>

                  <button
                    onClick={handleStartNewDeal}
                    className="text-xs text-amber-400 hover:text-amber-300 bg-amber-500/10 border border-amber-500/20 px-3 py-1.5 rounded-xl font-bold"
                  >
                    + עסקה חדשה
                  </button>
                </div>

                {/* Deal Summary Box */}
                <div className="bg-slate-950/80 border border-amber-500/30 rounded-2xl p-4 sm:p-6 space-y-5">
                  {/* Customer Info Card Header */}
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3 flex-wrap gap-2">
                    <div>
                      <span className="text-[10px] text-slate-400 block uppercase font-bold">שם הלקוח / חברה:</span>
                      <h3 className="text-sm font-bold text-slate-100">{activeClientInfo.name || 'לקוח מזומן בשטח'}</h3>
                    </div>
                    <div className="flex items-center gap-4 text-left">
                      {activeClientInfo.phone && (
                        <div>
                          <span className="text-[10px] text-slate-400 block uppercase font-bold">טלפון:</span>
                          <span className="text-xs font-mono text-amber-300 font-bold dir-ltr block">{activeClientInfo.phone}</span>
                        </div>
                      )}
                      {activeClientInfo.email && (
                        <div>
                          <span className="text-[10px] text-slate-400 block uppercase font-bold">אימייל:</span>
                          <span className="text-xs font-mono text-slate-300 dir-ltr block">{activeClientInfo.email}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Transaction Rates Breakdown Card (Only relevant karats for this deal) */}
                  <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3.5 space-y-2">
                    <span className="text-xs font-bold text-amber-400 flex items-center gap-1.5 uppercase tracking-wider">
                      <Coins className="w-4 h-4 text-amber-400" />
                      <span>שערי חליפין וזהב ברגע העסקה (רלוונטיים לעסקה):</span>
                    </span>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs pt-1">
                      <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800/80">
                        <span className="text-[10px] text-slate-400 block font-bold">XAU/USD (אונקיה):</span>
                        <strong className="text-amber-300 font-mono text-sm">${effectiveRates.xauUsd.toFixed(2)}</strong>
                      </div>
                      <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800/80">
                        <span className="text-[10px] text-slate-400 block font-bold">USD/ILS (שער דולר):</span>
                        <strong className="text-slate-200 font-mono text-sm">₪{effectiveRates.usdIls.toFixed(3)}</strong>
                      </div>
                      {activeKarats.map((karat: number) => {
                        const gramRate = effectiveRates.gold24kPerGramIls * (karat / 24);
                        return (
                          <div key={karat} className="bg-slate-950 p-2.5 rounded-lg border border-amber-500/30">
                            <span className="text-[10px] text-amber-400 block font-bold">שער גרם {karat}K בעסקה:</span>
                            <strong className="text-amber-300 font-mono text-sm">₪{gramRate.toFixed(2)}/ג'</strong>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Weight Summary Breakdown (Only relevant karats) */}
                  <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3.5 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-amber-400 flex items-center gap-1.5 uppercase tracking-wider">
                        <Coins className="w-4 h-4 text-amber-400" />
                        <span>סיכום משקלים לפי קראט:</span>
                      </span>
                      <span className="text-xs font-bold text-white font-mono bg-slate-950 px-2.5 py-0.5 rounded border border-slate-800">
                        סה"כ {totals.totalWeightGrams.toFixed(2)} גרם
                      </span>
                    </div>

                    <div className={`grid gap-1.5 text-center text-xs pt-1 ${
                      activeKarats.length === 1
                        ? 'grid-cols-1'
                        : activeKarats.length === 2
                        ? 'grid-cols-2'
                        : activeKarats.length === 3
                        ? 'grid-cols-3'
                        : 'grid-cols-4'
                    }`}>
                      {activeKarats.map((karat: number) => {
                        const weight = cart.filter((i) => i.karat === karat).reduce((s, i) => s + i.weightGrams, 0);
                        return (
                          <div key={karat} className="bg-slate-950 p-2 rounded-lg border border-slate-800">
                            <span className="text-[10px] text-slate-400 block font-bold">משקל {karat}K</span>
                            <span className="font-mono text-amber-300 font-bold">{weight.toFixed(2)}g</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Items Detailed List */}
                  <div className="space-y-2">
                    <span className="text-xs font-bold text-slate-300 block">פירוט פריטי העסקה ({cart.length}):</span>
                    {cart.map((item, idx) => (
                      <div
                        key={item.id}
                        className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between text-xs"
                      >
                        <div className="flex items-center gap-2.5">
                          <span className="font-black text-amber-400 font-mono bg-slate-950 px-2 py-1 rounded border border-amber-500/30">
                            {item.karat}K
                          </span>
                          <div>
                            <span className="font-bold text-slate-100">{idx + 1}. {item.name}</span>
                            <span className="text-[11px] text-slate-400 block">משקל: {item.weightGrams} גרם</span>
                          </div>
                        </div>
                        <div className="text-left">
                          <span className="font-black text-amber-400 font-mono text-sm block">₪{item.offerPriceIls.toLocaleString('he-IL')}</span>
                          <span className="text-[10px] text-slate-500 block font-mono">ערך בורסה: ₪{item.rawValueIls.toFixed(0)}</span>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Grand Total Cash Payout Banner */}
                  <div className="bg-gradient-to-r from-amber-500/20 via-amber-500/10 to-amber-500/20 border-2 border-amber-500/50 rounded-xl p-4 flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold text-amber-300 block">סה"כ תשלום סופי במזומן:</span>
                      <span className="text-xs text-slate-400">משקל כולל: {totals.totalWeightGrams.toFixed(2)} גרם ({cart.length} פריטים)</span>
                    </div>
                    <span className="text-2xl sm:text-3xl font-black text-amber-400 font-mono">
                      ₪{totals.totalOfferPriceIls.toLocaleString('he-IL', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>

                {/* Primary Action Buttons */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsPdfReceiptOpen(true)}
                    className="py-3.5 px-4 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 transition-all active:scale-95"
                  >
                    <FileText className="w-4 h-4 text-slate-950" />
                    <span>צפה והפק מסמך PDF</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleSendWhatsApp}
                    className="py-3.5 px-4 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/20 transition-all active:scale-95"
                  >
                    <Send className="w-4 h-4" />
                    <span>פתח בוואטסאפ שליחה</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleSaveDealToHistory}
                    className="py-3.5 px-4 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition-all active:scale-95"
                  >
                    <Save className="w-4 h-4 text-amber-400" />
                    <span>שמור בעסקאות שמורות</span>
                  </button>
                </div>

                {/* Navigation Back */}
                <div className="pt-2 flex items-center justify-start">
                  <button
                    type="button"
                    onClick={() => setActiveStep(2)}
                    className="py-2.5 px-4 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold rounded-xl flex items-center gap-2 border border-slate-700"
                  >
                    <ArrowRight className="w-4 h-4" />
                    <span>חזרה להזנת פריטים (עריכה)</span>
                  </button>
                </div>
              </div>
            );
          })()}
          </div>
        )}
      </main>

      {/* Mobile Bottom Navigation Bar (Thumb-friendly field UI) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-slate-900/95 backdrop-blur-md border-t border-slate-800 px-2 py-1.5 flex items-center justify-around shadow-2xl dir-rtl">
        <button
          type="button"
          onClick={() => setActiveStep(0)}
          className={`flex-1 flex flex-col items-center py-1 rounded-xl transition-all ${
            activeStep === 0 ? 'text-amber-400 font-black' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Home className="w-5 h-5 mb-0.5" />
          <span className="text-[10px]">דשבורד</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveStep(1)}
          className={`flex-1 flex flex-col items-center py-1 rounded-xl transition-all ${
            activeStep === 1 ? 'text-amber-400 font-black' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <User className="w-5 h-5 mb-0.5" />
          <span className="text-[10px]">לקוח</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveStep(2)}
          className={`flex-1 flex flex-col items-center py-1 rounded-xl relative transition-all ${
            activeStep === 2 ? 'text-amber-400 font-black' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <div className="relative mb-0.5">
            <Coins className="w-5 h-5" />
            {cart.length > 0 && (
              <span className="absolute -top-1.5 -right-2.5 bg-amber-500 text-slate-950 font-black text-[10px] w-4 h-4 rounded-full flex items-center justify-center shadow-md">
                {cart.length}
              </span>
            )}
          </div>
          <span className="text-[10px]">מחשבון / סל</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveStep(3)}
          className={`flex-1 flex flex-col items-center py-1 rounded-xl transition-all ${
            activeStep === 3 ? 'text-amber-400 font-black' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <FileText className="w-5 h-5 mb-0.5" />
          <span className="text-[10px]">סיכום</span>
        </button>

        <button
          type="button"
          onClick={() => setIsHistoryOpen(true)}
          className="flex-1 flex flex-col items-center py-1 rounded-xl text-slate-400 hover:text-slate-200 transition-all"
        >
          <CheckCircle2 className="w-5 h-5 mb-0.5 text-amber-500/80" />
          <span className="text-[10px]">עסקאות</span>
        </button>
      </nav>

      {/* Modals */}
      <ContactPickerModal
        isOpen={isContactPickerOpen}
        onClose={() => setIsContactPickerOpen(false)}
        history={history}
        onSelectContact={(contact) => {
          setActiveClientInfo({
            name: contact.name,
            phone: contact.phone,
            email: contact.email || '',
            notes: contact.notes || activeClientInfo.notes,
          });
        }}
      />

      <CameraOcrModal
        isOpen={isOcrCameraOpen}
        onClose={() => setIsOcrCameraOpen(false)}
        onWeightExtracted={(weight) => setScannedWeight(weight)}
      />

      <PdfReceiptModal
        isOpen={isPdfReceiptOpen}
        onClose={() => setIsPdfReceiptOpen(false)}
        cart={cart}
        totals={totals}
        rates={effectiveRates}
        clientName={activeClientInfo.name}
        clientPhone={activeClientInfo.phone}
        clientEmail={activeClientInfo.email}
        clientNotes={activeClientInfo.notes}
        settings={settings}
      />

      <TradeHistoryModal
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        history={history}
        onDeleteDeal={handleDeleteHistoryDeal}
        onSelectDeal={handleSelectHistoryDeal}
      />

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        onSaveSettings={handleSaveSettings}
      />

      <LiveRatesModal
        isOpen={isRatesModalOpen}
        onClose={() => setIsRatesModalOpen(false)}
        rates={rates}
        loading={loadingRates}
        onRefresh={fetchRates}
        customUsdIls={customUsdIls}
        onUpdateCustomUsdIls={handleSetCustomUsdIls}
        customXauUsd={customXauUsd}
        onUpdateCustomXauUsd={handleSetCustomXauUsd}
      />
    </div>
  );
}

