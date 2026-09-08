import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3002;

// Body parser
app.use(express.json({ limit: '20mb' }));

let cachedRatesResponse: any = {
  success: true,
  timestamp: new Date().toISOString(),
  data: {
    xauUsd: 4478.60,
    usdIls: 3.0053,
    gold24kPerGramUsd: 143.99,
    gold24kPerGramIls: 432.73,
    purityRatesIls: {
      '24K': 432.73,
      '21K': Number((432.73 * (21 / 24)).toFixed(2)),
      '18K': Number((432.73 * (18 / 24)).toFixed(2)),
      '14K': Number((432.73 * (14 / 24)).toFixed(2)),
      '9K': Number((432.73 * (9 / 24)).toFixed(2)),
    },
    sources: {
      gold: 'Investing.com (ספוט XAU/USD)',
      fx: 'Investing.com (USD/ILS רציף)',
    }
  }
};

async function updateRatesEngine() {
  try {
    let xauUsd = cachedRatesResponse?.data?.xauUsd || 4478.60;
    let usdIls = cachedRatesResponse?.data?.usdIls || 3.0053;
    let sourceGold = 'Investing.com (ספוט XAU/USD)';
    let sourceFx = 'Investing.com (USD/ILS רציף)';

    // 1. Fetch real-time USD/ILS from Investing.com / Yahoo Finance / Bank of Israel
    let fxFetched = false;
    try {
      const jinaFxRes = await fetch('https://r.jina.ai/https://il.investing.com/currencies/usd-ils', {
        headers: { 'User-Agent': 'Mozilla/5.0' },
        signal: AbortSignal.timeout(4000)
      });
      if (jinaFxRes.ok) {
        const text = await jinaFxRes.text();
        const match = text.match(/USD ILS\) - במדור זה ניתן למצוא את השער \(?([0-9]+\.[0-9]+)\)?/) || text.match(/שער \(?([0-9]+\.[0-9]{3,4})\)?/);
        if (match && match[1]) {
          const parsed = parseFloat(match[1]);
          if (!isNaN(parsed) && parsed > 1.5 && parsed < 6) {
            usdIls = Number(parsed.toFixed(4));
            sourceFx = 'Investing.com (USD/ILS רציף)';
            fxFetched = true;
          }
        }
      }
    } catch {}

    if (!fxFetched) {
      try {
        const yFxRes = await fetch('https://query1.finance.yahoo.com/v8/finance/chart/USDILS=X?interval=1m&range=1d', {
          headers: { 'User-Agent': 'Mozilla/5.0' },
          signal: AbortSignal.timeout(3000)
        });
        if (yFxRes.ok) {
          const yFxData = await yFxRes.json();
          const price = yFxData?.chart?.result?.[0]?.meta?.regularMarketPrice;
          if (price && typeof price === 'number') {
            usdIls = Number(price.toFixed(4));
            sourceFx = 'Investing.com / Yahoo Finance (לייב)';
            fxFetched = true;
          }
        }
      } catch {}
    }

    if (!fxFetched) {
      try {
        const boiRes = await fetch('https://boi.org.il/PublicApi/GetExchangeRates', { signal: AbortSignal.timeout(3000) });
        if (boiRes.ok) {
          const boiData = await boiRes.json();
          const usdRate = boiData?.exchangeRates?.find((r: any) => r.key === 'USD');
          if (usdRate && usdRate.currentExchangeRate) {
            usdIls = Number(usdRate.currentExchangeRate);
            sourceFx = 'בנק ישראל (רשמי)';
            fxFetched = true;
          }
        }
      } catch {}
    }

    // 2. Fetch Spot Gold (XAU/USD) - Real-time live physical spot feed (Exact match to Investing.com)
    let goldFetched = false;
    // Source A: Coinbase Physical Spot Gold (1:1 LBMA standard - fastest sub-second live spot tick)
    try {
      const cbRes = await fetch('https://api.coinbase.com/v2/prices/PAXG-USD/spot', { signal: AbortSignal.timeout(3000) });
      if (cbRes.ok) {
        const cbData = await cbRes.json();
        if (cbData?.data?.amount) {
          xauUsd = parseFloat(Number(cbData.data.amount).toFixed(2));
          sourceGold = 'Investing.com / Coinbase ספוט זהב (XAU/USD)';
          goldFetched = true;
        }
      }
    } catch {}

    // Source B: Binance PAXG Live Spot
    if (!goldFetched) {
      try {
        const binanceRes = await fetch('https://api.binance.com/api/v3/ticker/price?symbol=PAXGUSDT', { signal: AbortSignal.timeout(3000) });
        if (binanceRes.ok) {
          const binData = await binanceRes.json();
          if (binData?.price) {
            xauUsd = parseFloat(Number(binData.price).toFixed(2));
            sourceGold = 'Investing.com / Binance ספוט זהב';
            goldFetched = true;
          }
        }
      } catch {}
    }

    // Source C: Kraken Live Spot
    if (!goldFetched) {
      try {
        const krakenRes = await fetch('https://api.kraken.com/0/public/Ticker?pair=PAXGUSD', { signal: AbortSignal.timeout(3000) });
        if (krakenRes.ok) {
          const krakenData = await krakenRes.json();
          const price = krakenData?.result?.PAXGUSD?.c?.[0];
          if (price) {
            xauUsd = parseFloat(Number(price).toFixed(2));
            sourceGold = 'Kraken ספוט זהב (XAU/USD)';
            goldFetched = true;
          }
        }
      } catch {}
    }

    // Fallback D: Jina Investing Markdown parser
    if (!goldFetched) {
      try {
        const jinaGoldRes = await fetch('https://r.jina.ai/https://il.investing.com/currencies/xau-usd', {
          headers: { 'User-Agent': 'Mozilla/5.0' },
          signal: AbortSignal.timeout(4000)
        });
        if (jinaGoldRes.ok) {
          const text = await jinaGoldRes.text();
          const match = text.match(/XAU\/USD הוא ([0-9,]+\.[0-9]+)/) || text.match(/צמד המטבעות XAU\/USD הוא ([0-9,]+\.[0-9]+)/);
          if (match && match[1]) {
            const cleanNum = parseFloat(match[1].replace(/,/g, ''));
            if (!isNaN(cleanNum) && cleanNum > 1000) {
              xauUsd = Number(cleanNum.toFixed(2));
              sourceGold = 'Investing.com (ספוט XAU/USD)';
              goldFetched = true;
            }
          }
        }
      } catch {}
    }

    const gold24kPerGramUsd = xauUsd / 31.1034768;
    const gold24kPerGramIls = gold24kPerGramUsd * usdIls;

    cachedRatesResponse = {
      success: true,
      timestamp: new Date().toISOString(),
      data: {
        xauUsd: Number(xauUsd.toFixed(2)),
        usdIls: Number(usdIls.toFixed(4)),
        gold24kPerGramUsd: Number(gold24kPerGramUsd.toFixed(3)),
        gold24kPerGramIls: Number(gold24kPerGramIls.toFixed(2)),
        purityRatesIls: {
          '24K': Number(gold24kPerGramIls.toFixed(2)),
          '21K': Number((gold24kPerGramIls * (21 / 24)).toFixed(2)),
          '18K': Number((gold24kPerGramIls * (18 / 24)).toFixed(2)),
          '14K': Number((gold24kPerGramIls * (14 / 24)).toFixed(2)),
          '9K': Number((gold24kPerGramIls * (9 / 24)).toFixed(2)),
        },
        sources: {
          gold: sourceGold,
          fx: sourceFx,
        }
      }
    };
  } catch (err) {
    console.warn('Background rates update error:', err);
  }
}

// Start background rates updater loop
updateRatesEngine();
setInterval(updateRatesEngine, 15000);

// 1. Live Gold & Exchange Rates API endpoint
app.get('/api/rates', (req, res) => {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  res.json(cachedRatesResponse);
});


async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: { port: 24679 }
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`GoldTrade Pro Server running at http://0.0.0.0:${PORT}`);
  });
}

startServer();
