export type ItemCategory = 'gold' | 'diamond';

export interface GoldItem {
  id: string;
  category?: 'gold';
  name: string;
  itemType?: string; // e.g., 'שרשרת', 'צמיד', 'טבעת', 'מטבע', 'עגילים', 'מטיל/שילב', 'זהב שבור'
  weightGrams: number;
  karat: number; // 9, 14, 18, 24
  purityPercent: number; // 0.375, 0.585, 0.750, 0.999
  marginPercent: number; // Dealer profit margin deducted from spot price
  rawValueIls: number; // Gross market value before margin
  offerPriceIls: number; // Price offered to customer
  profitIls: number; // Dealer profit amount
  scalePhotoUrl?: string; // OCR scale photo
  itemPhotoUrl?: string; // Jewelry item photo
  notes?: string;
}

export type DiamondShape = 'Round' | 'Princess' | 'Emerald' | 'Oval' | 'Pear' | 'Marquise' | 'Radiant' | 'Cushion' | 'Heart' | 'Asscher';
export type DiamondColor = 'D' | 'E' | 'F' | 'G' | 'H' | 'I' | 'J' | 'K' | 'L' | 'M' | 'Fancy';
export type DiamondClarity = 'FL' | 'IF' | 'VVS1' | 'VVS2' | 'VS1' | 'VS2' | 'SI1' | 'SI2' | 'SI3' | 'I1' | 'I2' | 'I3';
export type DiamondLab = 'GIA' | 'IGI' | 'HRD' | 'EGL' | 'ללא תעודה';

export interface DiamondItem {
  id: string;
  category: 'diamond';
  name: string; // e.g., 'יהלום עגול 1.25 ct (G/VS1 - GIA)'
  itemType: 'single' | 'parcel'; // 'single' = אבן יחידה, 'parcel' = חבילת אבנים (פאקע)
  shape: DiamondShape;
  caratWeight: number; // משקל בקראט (ct)
  piecesCount?: number; // כמות אבנים בחבילה
  color: DiamondColor;
  clarity: DiamondClarity;
  cutGrade?: string; // Excellent, Very Good, Good, Fair
  fluorescence?: string; // None, Faint, Medium, Strong
  lab: DiamondLab;
  certNumber?: string; // מספר תעודה גמולוגית
  rapListPriceUsd: number; // מחיר מחירון רפפורט $ לקראט ($/ct)
  dealerDiscountPercent: number; // הנחת סוחר מהרפפורט (% Off Rap)
  pricePerCaratUsd: number; // מחיר אפקטיבי לקראט ב-USD ($/ct)
  totalPriceUsd: number; // מחיר סופי ב-USD
  offerPriceIls: number; // מחיר סופי בשקלים (לפי שער USD/ILS)
  weightGrams: number; // 1 ct = 0.2g
  karat?: number; // 0 for diamonds
  rawValueIls: number; // ערך מחירון רפפורט מלא בשקלים
  profitIls: number; // רווח סוחר משוער בשקלים
  clientType?: 'b2b' | 'private'; // B2B סוחר / אדם פרטי
  privateDealType?: 'buy_from_private' | 'sell_to_private'; // קנייה מאדם פרטי / מכירה לאדם פרטי
  settingDetails?: string; // פרטי שיבוץ / תכשיט (למשל: טבעת זהב 18K)
  itemPhotoUrl?: string;
  certPhotoUrl?: string;
  notes?: string;
}

export type TradeItem = GoldItem | DiamondItem;

export interface RatesData {
  xauUsd: number;
  usdIls: number;
  gold24kPerGramUsd: number;
  gold24kPerGramIls: number;
  purityRatesIls: {
    '24K': number;
    '22K'?: number;
    '21K'?: number;
    '18K': number;
    '14K': number;
    '9K': number;
  };
  timestamp: string;
  sources: {
    gold: string;
    fx: string;
  };
}

export interface CartTotals {
  totalItems: number;
  totalWeightGrams: number;
  totalCarats?: number;
  totalRawValueIls: number;
  totalOfferPriceIls: number;
  totalDealerProfitIls: number;
  averageMarginPercent: number;
}

export interface TradeDeal {
  id: string;
  date: string;
  clientName: string;
  clientPhone: string;
  clientNotes?: string;
  items: TradeItem[];
  ratesSnapshot: RatesData;
  totals: CartTotals;
  businessName?: string;
}

export interface BusinessSettings {
  businessName: string;
  dealerName: string;
  phone: string;
  address: string;
  logoUrl?: string;
  defaultMarginPercent: number;
  metalApiKey?: string;
  themeStyle?: 'luxury_gold' | 'modern_clean' | 'emerald_classic' | 'royal_dark';
}
