import React, { useState } from 'react';
import { Code, Copy, Check, Terminal, Layers, Globe, Server, Database, Sparkles, BookOpen, ExternalLink, ArrowRight } from 'lucide-react';
import { DART_FUNCTIONS, JSON_SCHEMAS, APP_STATE_VARIABLES, FLUTTERFLOW_STEPS } from '../data/flutterflowSpecs';

export const FlutterFlowSpecCenter: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'steps' | 'dart' | 'json' | 'appstate'>('steps');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  return (
    <div className="bg-slate-900 border border-amber-500/30 rounded-2xl p-4 sm:p-6 shadow-2xl text-slate-100 relative">
      {/* Title */}
      <div className="flex items-center justify-between mb-6 border-b border-slate-800 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-gradient-to-br from-amber-400 via-amber-500 to-amber-600 text-slate-950 font-bold shadow-lg shadow-amber-500/20">
            <Code className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-extrabold text-amber-300 flex items-center gap-2">
              מרכז ארכיטקטורה וקוד עבור FlutterFlow
              <span className="bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[11px] px-2 py-0.5 rounded-full font-mono">
                No-Code Specs
              </span>
            </h2>
            <p className="text-xs text-slate-400">
              כל ה-JSON-ים, הנוסחאות, פונקציות ה-Dart ומשתני המערכת מוכנים להעתקה ישירה ל-FlutterFlow
            </p>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 mb-6 no-scrollbar border-b border-slate-800/80">
        <button
          onClick={() => setActiveTab('steps')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
            activeTab === 'steps'
              ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
              : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>תוכנית עבודה מפורטת (5 שלבים)</span>
        </button>

        <button
          onClick={() => setActiveTab('dart')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
            activeTab === 'dart'
              ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
              : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
          }`}
        >
          <Terminal className="w-4 h-4" />
          <span>פונקציות Dart (Custom Functions)</span>
        </button>

        <button
          onClick={() => setActiveTab('json')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
            activeTab === 'json'
              ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
              : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
          }`}
        >
          <Globe className="w-4 h-4" />
          <span>מבנה API & JSON Schemas</span>
        </button>

        <button
          onClick={() => setActiveTab('appstate')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
            activeTab === 'appstate'
              ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
              : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
          }`}
        >
          <Database className="w-4 h-4" />
          <span>טבלת App States & Data Types</span>
        </button>
      </div>

      {/* TAB 1: Step-by-Step Blueprint */}
      {activeTab === 'steps' && (
        <div className="space-y-4">
          <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4 text-xs text-amber-200 flex items-start gap-3">
            <Sparkles className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <strong className="block text-sm font-bold text-amber-300 mb-1">מדריך הקמה מלא שלב-אחר-שלב ב-FlutterFlow:</strong>
              עקוב אחר חמשת השלבים הבאים כדי לבנות את האפליקציה ב-FlutterFlow במהירות ללא כתיבת קוד מאפס.
            </div>
          </div>

          <div className="space-y-3">
            {FLUTTERFLOW_STEPS.map((s) => (
              <div key={s.step} className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-2">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-amber-500 text-slate-950 font-black text-xs flex items-center justify-center">
                    {s.step}
                  </span>
                  <h3 className="text-sm font-bold text-slate-100">{s.title}</h3>
                </div>
                <ul className="list-disc list-inside space-y-1 text-xs text-slate-300 pr-8">
                  {s.details.map((detail, idx) => (
                    <li key={idx} className="leading-relaxed">{detail}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 2: Custom Dart & JS Functions */}
      {activeTab === 'dart' && (
        <div className="space-y-5">
          <p className="text-xs text-slate-400">
            העתק את הקוד הבא והדבק אותו בבלוק ה-<strong>Custom Code &gt; Custom Functions / Actions</strong> ב-FlutterFlow או באפליקציה:
          </p>

          {/* Action 0: getLiveGoldAndFxRates (JavaScript) */}
          <div className="bg-slate-950 border-2 border-amber-500/50 rounded-xl p-4 space-y-2">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-bold text-amber-300 font-mono">async function getLiveGoldAndFxRates()</h4>
                  <span className="bg-amber-500/20 text-amber-300 text-[10px] px-2 py-0.5 rounded font-mono font-bold">JavaScript / Web / React</span>
                </div>
                <p className="text-[11px] text-slate-400">קריאה ישירה לשערי זהב ודולר, חישוב שקלי לכל קראט ושמירה אוטומטית בזיכרון מקומי לשטח (Offline Cache)</p>
              </div>

              <button
                onClick={() => copyToClipboard(DART_FUNCTIONS.getLiveGoldAndFxRatesJs, 'live_rates_js')}
                className="flex items-center gap-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 px-3 py-1.5 rounded-lg text-xs font-black transition-all shadow-md"
              >
                {copiedKey === 'live_rates_js' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedKey === 'live_rates_js' ? 'הועתק!' : 'העתק קוד JS'}</span>
              </button>
            </div>

            <pre className="bg-slate-900 text-amber-300 p-3.5 rounded-lg font-mono text-[11px] overflow-x-auto dir-ltr text-left border border-slate-800">
              <code>{DART_FUNCTIONS.getLiveGoldAndFxRatesJs}</code>
            </pre>
          </div>

          {/* Action 0.1: getLiveGoldAndFxRates (Dart) */}
          <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-2">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-bold text-emerald-400 font-mono">Future&lt;Map&gt; getLiveGoldAndFxRates()</h4>
                  <span className="bg-emerald-500/20 text-emerald-300 text-[10px] px-2 py-0.5 rounded font-mono font-bold">FlutterFlow Custom Action (Dart)</span>
                </div>
                <p className="text-[11px] text-slate-400">קוד Dart מקביל עם SharedPreferences לקליטה ושמירה לזיכרון מקומי באפליקציית מובייל</p>
              </div>

              <button
                onClick={() => copyToClipboard(DART_FUNCTIONS.getLiveGoldAndFxRatesDart, 'live_rates_dart')}
                className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-amber-400 px-3 py-1.5 rounded-lg text-xs font-semibold border border-slate-700 transition-all"
              >
                {copiedKey === 'live_rates_dart' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedKey === 'live_rates_dart' ? 'הועתק!' : 'העתק קוד Dart'}</span>
              </button>
            </div>

            <pre className="bg-slate-900 text-emerald-400 p-3.5 rounded-lg font-mono text-[11px] overflow-x-auto dir-ltr text-left border border-slate-800">
              <code>{DART_FUNCTIONS.getLiveGoldAndFxRatesDart}</code>
            </pre>
          </div>

          {/* Function 1: Offer Calculation */}
          <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-2">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-bold text-amber-300 font-mono">calculateGoldOfferPrice(...)</h4>
                <p className="text-[11px] text-slate-400">נוסחת החישוב להצעה ללקוח מבוססת משקל, קראט, שער זהב, שער דולר ודלתת רווח</p>
              </div>

              <button
                onClick={() => copyToClipboard(DART_FUNCTIONS.calculateGoldOffer, 'calc_gold')}
                className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-amber-400 px-3 py-1.5 rounded-lg text-xs font-semibold border border-slate-700 transition-all"
              >
                {copiedKey === 'calc_gold' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedKey === 'calc_gold' ? 'הועתק!' : 'העתק קוד Dart'}</span>
              </button>
            </div>

            <pre className="bg-slate-900 text-emerald-400 p-3.5 rounded-lg font-mono text-[11px] overflow-x-auto dir-ltr text-left border border-slate-800">
              <code>{DART_FUNCTIONS.calculateGoldOffer}</code>
            </pre>
          </div>

          {/* Function 2: OCR Parser */}
          <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-2">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-bold text-amber-300 font-mono">parseScaleWeight(...)</h4>
                <p className="text-[11px] text-slate-400">מחלץ את הערך הנומרי של המשקל בלבד מתוך מחרוזת ה-OCR של תמונת המאזניים</p>
              </div>

              <button
                onClick={() => copyToClipboard(DART_FUNCTIONS.parseScaleOcr, 'parse_ocr')}
                className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-amber-400 px-3 py-1.5 rounded-lg text-xs font-semibold border border-slate-700 transition-all"
              >
                {copiedKey === 'parse_ocr' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedKey === 'parse_ocr' ? 'הועתק!' : 'העתק קוד Dart'}</span>
              </button>
            </div>

            <pre className="bg-slate-900 text-emerald-400 p-3.5 rounded-lg font-mono text-[11px] overflow-x-auto dir-ltr text-left border border-slate-800">
              <code>{DART_FUNCTIONS.parseScaleOcr}</code>
            </pre>
          </div>

          {/* Function 3: Dealer Profit Breakdown */}
          <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-2">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-bold text-amber-300 font-mono">calculateDealerBreakdown(...)</h4>
                <p className="text-[11px] text-slate-400">מחזיר מפה עם שווי שוק גולמי, מחיר הצעה ורווח סוחר צפוי</p>
              </div>

              <button
                onClick={() => copyToClipboard(DART_FUNCTIONS.calculateDealerProfit, 'dealer_profit')}
                className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-amber-400 px-3 py-1.5 rounded-lg text-xs font-semibold border border-slate-700 transition-all"
              >
                {copiedKey === 'dealer_profit' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedKey === 'dealer_profit' ? 'הועתק!' : 'העתק קוד Dart'}</span>
              </button>
            </div>

            <pre className="bg-slate-900 text-emerald-400 p-3.5 rounded-lg font-mono text-[11px] overflow-x-auto dir-ltr text-left border border-slate-800">
              <code>{DART_FUNCTIONS.calculateDealerProfit}</code>
            </pre>
          </div>
        </div>
      )}

      {/* TAB 3: API JSON Schemas */}
      {activeTab === 'json' && (
        <div className="space-y-5">
          <p className="text-xs text-slate-400">
            מבני ה-JSON והפרמטרים להגדרת ה-<strong>API Calls</strong> ב-FlutterFlow:
          </p>

          {/* MetalpriceAPI */}
          <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-2">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-bold text-amber-300">1. API MetalpriceAPI (שערי זהב)</h4>
                <p className="text-[11px] text-slate-400 font-mono">GET https://api.metalpriceapi.com/v1/latest</p>
              </div>

              <button
                onClick={() => copyToClipboard(JSON_SCHEMAS.metalpriceApi.sampleResponseBody, 'metalprice_json')}
                className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-amber-400 px-3 py-1.5 rounded-lg text-xs font-semibold border border-slate-700 transition-all"
              >
                {copiedKey === 'metalprice_json' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedKey === 'metalprice_json' ? 'הועתק!' : 'העתק JSON'}</span>
              </button>
            </div>

            <div className="text-[11px] text-slate-300 font-mono bg-slate-900 p-2 rounded border border-slate-800">
              JSON Path לזהב: <strong className="text-amber-400">{JSON_SCHEMAS.metalpriceApi.jsonPathToOuncePrice}</strong>
            </div>

            <pre className="bg-slate-900 text-amber-300 p-3.5 rounded-lg font-mono text-[11px] overflow-x-auto dir-ltr text-left border border-slate-800">
              <code>{JSON_SCHEMAS.metalpriceApi.sampleResponseBody}</code>
            </pre>
          </div>

          {/* ExchangeRate API */}
          <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-2">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-bold text-amber-300">2. API שער דולר/שקל (ExchangeRate API)</h4>
                <p className="text-[11px] text-slate-400 font-mono">GET https://open.er-api.com/v6/latest/USD</p>
              </div>

              <button
                onClick={() => copyToClipboard(JSON_SCHEMAS.exchangeRateApi.sampleResponseBody, 'fx_json')}
                className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-amber-400 px-3 py-1.5 rounded-lg text-xs font-semibold border border-slate-700 transition-all"
              >
                {copiedKey === 'fx_json' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedKey === 'fx_json' ? 'הועתק!' : 'העתק JSON'}</span>
              </button>
            </div>

            <div className="text-[11px] text-slate-300 font-mono bg-slate-900 p-2 rounded border border-slate-800">
              JSON Path לדולר: <strong className="text-amber-400">{JSON_SCHEMAS.exchangeRateApi.jsonPathToIlsRate}</strong>
            </div>

            <pre className="bg-slate-900 text-amber-300 p-3.5 rounded-lg font-mono text-[11px] overflow-x-auto dir-ltr text-left border border-slate-800">
              <code>{JSON_SCHEMAS.exchangeRateApi.sampleResponseBody}</code>
            </pre>
          </div>

          {/* Vision OCR API */}
          <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-2">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-bold text-amber-300">3. API Google Vision OCR (זיהוי מאזניים)</h4>
                <p className="text-[11px] text-slate-400 font-mono">POST https://vision.googleapis.com/v1/images:annotate</p>
              </div>

              <button
                onClick={() => copyToClipboard(JSON_SCHEMAS.visionOcrApi.sampleResponseBody, 'vision_json')}
                className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-amber-400 px-3 py-1.5 rounded-lg text-xs font-semibold border border-slate-700 transition-all"
              >
                {copiedKey === 'vision_json' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedKey === 'vision_json' ? 'הועתק!' : 'העתק JSON'}</span>
              </button>
            </div>

            <div className="text-[11px] text-slate-300 font-mono bg-slate-900 p-2 rounded border border-slate-800">
              JSON Path לטקסט: <strong className="text-amber-400">{JSON_SCHEMAS.visionOcrApi.jsonPathToOcrText}</strong>
            </div>

            <pre className="bg-slate-900 text-amber-300 p-3.5 rounded-lg font-mono text-[11px] overflow-x-auto dir-ltr text-left border border-slate-800">
              <code>{JSON_SCHEMAS.visionOcrApi.sampleResponseBody}</code>
            </pre>
          </div>
        </div>
      )}

      {/* TAB 4: App State Variables Table */}
      {activeTab === 'appstate' && (
        <div className="space-y-4">
          <p className="text-xs text-slate-400">
            הגדר את משתני ה-<strong>App State</strong> הבאים ב-FlutterFlow כדי לנהל את מצב האפליקציה בזמן אמת:
          </p>

          <div className="overflow-x-auto">
            <table className="w-full text-right border-collapse text-xs">
              <thead>
                <tr className="bg-slate-950 text-amber-300 border-b border-slate-800 font-bold">
                  <th className="p-3">שם משתנה (App State)</th>
                  <th className="p-3">סוג נתונים (Data Type)</th>
                  <th className="p-3">ערך דיפולטיבי</th>
                  <th className="p-3">תיאור ותפקיד במערכת</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-slate-200">
                {APP_STATE_VARIABLES.map((varItem, idx) => (
                  <tr key={idx} className="hover:bg-slate-950/60">
                    <td className="p-3 font-mono font-bold text-amber-400">{varItem.name}</td>
                    <td className="p-3 font-mono text-slate-300">{varItem.type}</td>
                    <td className="p-3 font-mono text-slate-400">{varItem.defaultValue}</td>
                    <td className="p-3 text-slate-300">{varItem.description}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
