// Live Gold Spot and FX Rates utility with CORS Fallback, Local Storage Caching & Offline Field Resilience

export interface LiveGoldFxRates {
  goldOunceUSD: number;
  usdToIls: number;
  gram24K: number;
  gram21K: number;
  gram18K: number;
  gram14K: number;
  gram9K: number;
  timestamp?: number;
  updatedAt: string;
  source?: string;
}

/**
 * Fetches live gold price (XAU/USD) and USD/ILS exchange rate,
 * supports direct call and CORS proxy fallback,
 * calculates per-gram gold rates in ILS, and caches locally.
 */
export async function fetchLiveGoldAndFxRates(): Promise<LiveGoldFxRates> {
  let goldOunceUSD: number | null = null;
  let usdToIls: number | null = null;
  let goldSource = 'Gold-API (Direct)';

  // 1. קודם כל ניסיון משיכה משרת האפליקציה המקומי/ענן (/api/rates)
  // השרת מתשאל ישירות את נתוני שוק Investing.com / Yahoo Finance ובנק ישראל ללא חסימות CORS
  try {
    const serverRes = await fetch(`/api/rates?_t=${Date.now()}`, { cache: 'no-store' });
    if (serverRes.ok) {
      const serverData = await serverRes.json();
      if (serverData.success && serverData.data?.xauUsd && serverData.data?.usdIls) {
        goldOunceUSD = Number(serverData.data.xauUsd);
        usdToIls = Number(serverData.data.usdIls);
        goldSource = serverData.data?.sources?.gold || 'Investing.com (ספוט XAU/USD חי)';
      }
    }
  } catch (e) {
    console.warn("Backend /api/rates not available, trying direct client APIs...", e);
  }

  // 2. אם השרת לא זמין, משיכת שער דולר/שקל חי (Yahoo Finance או Open ER)
  if (!usdToIls) {
    try {
      const yFxRes = await fetch('https://query1.finance.yahoo.com/v8/finance/chart/USDILS=X?interval=1m&range=1d');
      if (yFxRes.ok) {
        const yFxData = await yFxRes.json();
        const price = yFxData?.chart?.result?.[0]?.meta?.regularMarketPrice;
        if (price && typeof price === 'number') {
          usdToIls = Number(price);
          goldSource = 'Investing.com / Yahoo Finance (לייב)';
        }
      }
    } catch {
      // נסה ER API
    }
  }

  if (!usdToIls) {
    try {
      const fxRes = await fetch('https://open.er-api.com/v6/latest/USD');
      if (fxRes.ok) {
        const fxData = await fxRes.json();
        if (fxData && fxData.rates && fxData.rates.ILS) {
          usdIls = Number(fxData.rates.ILS);
        }
      }
    } catch (e) {
      console.warn("FX API direct fetch failed", e);
    }
  }

  // 3. משיכת שער ספוט זהב חי (XAU/USD - ללא חוזים עתידיים!)
  if (!goldOunceUSD) {
    try {
      const cbRes = await fetch('https://api.coinbase.com/v2/prices/PAXG-USD/spot');
      if (cbRes.ok) {
        const cbData = await cbRes.json();
        if (cbData?.data?.amount) {
          goldOunceUSD = Number(parseFloat(cbData.data.amount).toFixed(2));
          goldSource = 'Investing.com / Coinbase ספוט זהב (XAU/USD)';
        }
      }
    } catch {
      // המשך לגיבוי הבא
    }
  }

  if (!goldOunceUSD) {
    try {
      const krRes = await fetch('https://api.kraken.com/0/public/Ticker?pair=PAXGUSD');
      if (krRes.ok) {
        const krData = await krRes.json();
        const price = krData?.result?.PAXGUSD?.c?.[0];
        if (price) {
          goldOunceUSD = Number(parseFloat(price).toFixed(2));
          goldSource = 'Kraken ספוט זהב (XAU/USD)';
        }
      }
    } catch {
      // המשך
    }
  }

  if (!goldOunceUSD) {
    try {
      const goldRes = await fetch('https://api.gold-api.com/price/XAU');
      if (goldRes.ok) {
        const goldData = await goldRes.json();
        if (goldData && goldData.price) {
          goldOunceUSD = Number(goldData.price);
        }
      }
    } catch (e) {
      console.warn("Gold API Direct failed, trying fallback...", e);
    }
  }

  // גיבוי לשער זהב אם יש חסימת CORS
  if (!goldOunceUSD) {
    try {
      const fallbackRes = await fetch('https://api.allorigins.win/raw?url=' + encodeURIComponent('https://api.gold-api.com/price/XAU'));
      if (fallbackRes.ok) {
        const fallbackData = await fallbackRes.json();
        if (fallbackData && fallbackData.price) {
          goldOunceUSD = Number(fallbackData.price);
          goldSource = 'Gold-API (CORS Proxy)';
        }
      }
    } catch (err) {
      console.warn("Failed to fetch gold spot price via CORS proxy fallback", err);
    }
  }

  // בדיקת תקינות סופית
  if (!goldOunceUSD || !usdToIls) {
    // נסה לטעון מזיכרון מקומי
    const cached = getCachedGoldRates();
    if (cached) {
      return {
        ...cached,
        source: `${cached.source || 'זיכרון מקומי'} (מצב לא מקוון)`
      };
    }
    throw new Error(`שגיאה במשיכת נתוני אמת: זהב=${goldOunceUSD}, דולר=${usdToIls}`);
  }

  // 3. חישוב מחיר לגרם 24K ושאר הקראטים בש"ח (1 אונקיה טרוי = 31.1034768 גרם)
  const pureGramILS = (goldOunceUSD / 31.1034768) * usdToIls;

  const result: LiveGoldFxRates = {
    goldOunceUSD: Number(goldOunceUSD.toFixed(2)),
    usdToIls: Number(usdToIls.toFixed(3)),
    gram24K: Number(pureGramILS.toFixed(2)),
    gram21K: Number((pureGramILS * (21 / 24)).toFixed(2)),
    gram18K: Number((pureGramILS * (18 / 24)).toFixed(2)),
    gram14K: Number((pureGramILS * (14 / 24)).toFixed(2)),
    gram9K:  Number((pureGramILS * (9 / 24)).toFixed(2)),
    timestamp: Date.now(),
    updatedAt: new Date().toLocaleTimeString('he-IL'),
    source: `${goldSource} & Open ER-API`,
  };

  // שמירה בזיכרון המקומי לשטח
  try {
    localStorage.setItem('goldcalc_live_rates', JSON.stringify(result));
    localStorage.setItem('cached_gold_rates', JSON.stringify(result));
  } catch (err) {
    console.warn('Could not save rates to localStorage:', err);
  }

  return result;
}

// Alias for backwards compatibility
export const getLiveGoldAndFxRates = fetchLiveGoldAndFxRates;

/**
 * Retrieves the cached rates synchronously if available (for instant zero-latency UI load).
 */
export function getCachedGoldRates(): LiveGoldFxRates | null {
  try {
    const cached = localStorage.getItem('goldcalc_live_rates') || localStorage.getItem('cached_gold_rates');
    if (cached) {
      return JSON.parse(cached);
    }
  } catch (e) {
    console.warn('Error reading cached rates:', e);
  }
  return null;
}
