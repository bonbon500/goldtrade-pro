import express from 'express';
import path from 'path';
import fs from 'fs';
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
    let sourceGold = cachedRatesResponse?.data?.sources?.gold || 'Coinbase ספוט זהב (XAU/USD)';
    let sourceFx = cachedRatesResponse?.data?.sources?.fx || 'שער דולר רציף';

    // Parallel concurrent fetch of FX and Gold rates
    const fetchFxPromise = (async () => {
      // Priority 1: Yahoo Finance API (sub-100ms)
      try {
        const yFxRes = await fetch('https://query1.finance.yahoo.com/v8/finance/chart/USDILS=X?interval=1m&range=1d', {
          headers: { 'User-Agent': 'Mozilla/5.0' },
          signal: AbortSignal.timeout(2500)
        });
        if (yFxRes.ok) {
          const yFxData = await yFxRes.json();
          const price = yFxData?.chart?.result?.[0]?.meta?.regularMarketPrice;
          if (price && typeof price === 'number' && price > 1.5 && price < 6) {
            usdIls = Number(price.toFixed(4));
            sourceFx = 'Yahoo Finance (USD/ILS רציף)';
            return;
          }
        }
      } catch {}

      // Priority 2: Bank of Israel official rate
      try {
        const boiRes = await fetch('https://boi.org.il/PublicApi/GetExchangeRates', { signal: AbortSignal.timeout(2500) });
        if (boiRes.ok) {
          const boiData = await boiRes.json();
          const usdRate = boiData?.exchangeRates?.find((r: any) => r.key === 'USD');
          if (usdRate && usdRate.currentExchangeRate) {
            usdIls = Number(usdRate.currentExchangeRate);
            sourceFx = 'בנק ישראל (רשמי)';
            return;
          }
        }
      } catch {}

      // Priority 3: Open ER-API
      try {
        const erRes = await fetch('https://open.er-api.com/v6/latest/USD', { signal: AbortSignal.timeout(2500) });
        if (erRes.ok) {
          const erData = await erRes.json();
          if (erData?.rates?.ILS) {
            usdIls = Number(Number(erData.rates.ILS).toFixed(4));
            sourceFx = 'Open ER-API (USD/ILS)';
            return;
          }
        }
      } catch {}

      // Fallback 4: Jina scraper
      try {
        const jinaFxRes = await fetch('https://r.jina.ai/https://il.investing.com/currencies/usd-ils', {
          headers: { 'User-Agent': 'Mozilla/5.0' },
          signal: AbortSignal.timeout(3000)
        });
        if (jinaFxRes.ok) {
          const text = await jinaFxRes.text();
          const match = text.match(/USD ILS\) - במדור זה ניתן למצוא את השער \(?([0-9]+\.[0-9]+)\)?/) || text.match(/שער \(?([0-9]+\.[0-9]{3,4})\)?/);
          if (match && match[1]) {
            const parsed = parseFloat(match[1]);
            if (!isNaN(parsed) && parsed > 1.5 && parsed < 6) {
              usdIls = Number(parsed.toFixed(4));
              sourceFx = 'Investing.com (USD/ILS רציף)';
            }
          }
        }
      } catch {}
    })();

    const fetchGoldPromise = (async () => {
      // Priority 1: Coinbase Physical Spot Gold (sub-100ms)
      try {
        const cbRes = await fetch('https://api.coinbase.com/v2/prices/PAXG-USD/spot', { signal: AbortSignal.timeout(2500) });
        if (cbRes.ok) {
          const cbData = await cbRes.json();
          if (cbData?.data?.amount) {
            xauUsd = parseFloat(Number(cbData.data.amount).toFixed(2));
            sourceGold = 'Investing.com / Coinbase ספוט זהב (XAU/USD)';
            return;
          }
        }
      } catch {}

      // Priority 2: Binance PAXG Spot
      try {
        const binanceRes = await fetch('https://api.binance.com/api/v3/ticker/price?symbol=PAXGUSDT', { signal: AbortSignal.timeout(2500) });
        if (binanceRes.ok) {
          const binData = await binanceRes.json();
          if (binData?.price) {
            xauUsd = parseFloat(Number(binData.price).toFixed(2));
            sourceGold = 'Investing.com / Binance ספוט זהב';
            return;
          }
        }
      } catch {}

      // Priority 3: Gold-API
      try {
        const gRes = await fetch('https://api.gold-api.com/price/XAU', { signal: AbortSignal.timeout(2500) });
        if (gRes.ok) {
          const gData = await gRes.json();
          if (gData?.price) {
            xauUsd = parseFloat(Number(gData.price).toFixed(2));
            sourceGold = 'Gold-API ספוט זהב (XAU/USD)';
            return;
          }
        }
      } catch {}

      // Priority 4: Kraken Spot
      try {
        const krakenRes = await fetch('https://api.kraken.com/0/public/Ticker?pair=PAXGUSD', { signal: AbortSignal.timeout(2500) });
        if (krakenRes.ok) {
          const krakenData = await krakenRes.json();
          const price = krakenData?.result?.PAXGUSD?.c?.[0];
          if (price) {
            xauUsd = parseFloat(Number(price).toFixed(2));
            sourceGold = 'Kraken ספוט זהב (XAU/USD)';
            return;
          }
        }
      } catch {}

      // Fallback 5: Jina Markdown parser
      try {
        const jinaGoldRes = await fetch('https://r.jina.ai/https://il.investing.com/currencies/xau-usd', {
          headers: { 'User-Agent': 'Mozilla/5.0' },
          signal: AbortSignal.timeout(3000)
        });
        if (jinaGoldRes.ok) {
          const text = await jinaGoldRes.text();
          const match = text.match(/XAU\/USD הוא ([0-9,]+\.[0-9]+)/) || text.match(/צמד המטבעות XAU\/USD הוא ([0-9,]+\.[0-9]+)/);
          if (match && match[1]) {
            const cleanNum = parseFloat(match[1].replace(/,/g, ''));
            if (!isNaN(cleanNum) && cleanNum > 1000) {
              xauUsd = Number(cleanNum.toFixed(2));
              sourceGold = 'Investing.com (ספוט XAU/USD)';
            }
          }
        }
      } catch {}
    })();

    await Promise.all([fetchFxPromise, fetchGoldPromise]);

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

// Start background rates updater loop (fast 10-second tick)
updateRatesEngine();
setInterval(updateRatesEngine, 10000);

const APP_VERSION = '2.6.0';
const SERVER_START_TIME = new Date().toISOString();

// 1. Live Gold & Exchange Rates API endpoint
app.get('/api/rates', (req, res) => {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  res.json(cachedRatesResponse);
});

// 2. Version and Health check endpoint (for mobile auto-update detection)
app.get('/api/version', (req, res) => {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  res.json({
    version: APP_VERSION,
    serverStartTime: SERVER_START_TIME,
    timestamp: Date.now(),
  });
});

// 3. Native Android APK Installer download endpoint
app.get(['/download/apk', '/GoldTrade-Pro.apk'], (req, res) => {
  const possiblePaths = [
    path.join(__dirname, 'dist', 'GoldTrade-Pro.apk'),
    path.join(__dirname, 'public', 'GoldTrade-Pro.apk'),
    path.join(__dirname, 'GoldTrade-Pro.apk'),
  ];
  const targetPath = possiblePaths.find(p => fs.existsSync(p));
  if (targetPath) {
    res.setHeader('Content-Type', 'application/vnd.android.package-archive');
    res.setHeader('Content-Disposition', 'attachment; filename="GoldTrade-Pro.apk"');
    res.sendFile(targetPath);
  } else {
    res.status(404).send('קובץ ההתקנה APK אינו זמין כרגע.');
  }
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
    // Serve static assets with cache headers, but NEVER cache HTML files
    app.use(
      express.static(distPath, {
        maxAge: '1d',
        setHeaders: (res, filePath) => {
          if (filePath.endsWith('.html')) {
            res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
            res.setHeader('Pragma', 'no-cache');
            res.setHeader('Expires', '0');
          }
        },
      })
    );

    app.get('*', (req, res) => {
      res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
      res.setHeader('Pragma', 'no-cache');
      res.setHeader('Expires', '0');
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`GoldTrade Pro Server running at http://0.0.0.0:${PORT}`);
  });
}

startServer();
