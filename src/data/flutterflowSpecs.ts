export const DART_FUNCTIONS = {
  getLiveGoldAndFxRatesJs: `// JavaScript / Custom Action: משיכת שערי זהב רציפים בלייב וחישוב שקלי לגרם
async function getLiveGoldAndFxRates() {
  try {
    // 1. קריאה לשער הזהב העולמי (XAU/USD)
    const goldResponse = await fetch('https://api.gold-api.com/price/XAU');
    const goldData = await goldResponse.json();
    const goldOunceUSD = goldData.price; // לדוגמה: 2500.50

    // 2. קריאה לשער הדולר-שקל (USD/ILS)
    const fxResponse = await fetch('https://open.er-api.com/v6/latest/USD');
    const fxData = await fxResponse.json();
    const usdToIls = fxData.rates.ILS; // לדוגמה: 3.70

    // 3. חישוב מחיר לגרם זהב 24K בשקלים (1 אונקיה טרוי = 31.1034768 גרם)
    const pricePerGram24K_ILS = (goldOunceUSD / 31.1034768) * usdToIls;

    const rates = {
      goldOunceUSD: goldOunceUSD,
      usdToIls: usdToIls,
      gram24K: pricePerGram24K_ILS,
      gram21K: pricePerGram24K_ILS * (21 / 24),
      gram18K: pricePerGram24K_ILS * (18 / 24),
      gram14K: pricePerGram24K_ILS * (14 / 24),
      gram9K:  pricePerGram24K_ILS * (9 / 24),
      updatedAt: new Date().toLocaleTimeString('he-IL')
    };

    // שמירה בזיכרון המקומי למקרה שאין קליטה בשטח
    localStorage.setItem('cached_gold_rates', JSON.stringify(rates));

    return rates;
  } catch (error) {
    console.warn("שגיאה במשיכת נתונים, מנסה לטעון מזיכרון מקומי...", error);
    const cached = localStorage.getItem('cached_gold_rates');
    if (cached) {
      return JSON.parse(cached);
    }
    throw error;
  }
}`,

  getLiveGoldAndFxRatesDart: `// Custom Action for FlutterFlow (Dart): Fetch Live Gold Spot & USD/ILS Rates
// Returns Future<Map<String, dynamic>>
import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';

Future<Map<String, dynamic>> getLiveGoldAndFxRates() async {
  try {
    // 1. Fetch live gold spot (XAU/USD)
    final goldRes = await http.get(Uri.parse('https://api.gold-api.com/price/XAU'));
    final goldData = jsonDecode(goldRes.body);
    final double goldOunceUSD = (goldData['price'] as num).toDouble();

    // 2. Fetch live USD/ILS exchange rate
    final fxRes = await http.get(Uri.parse('https://open.er-api.com/v6/latest/USD'));
    final fxData = jsonDecode(fxRes.body);
    final double usdToIls = (fxData['rates']['ILS'] as num).toDouble();

    // 3. Calculate 24K per gram in ILS
    const double gramsPerOunce = 31.1034768;
    final double pricePerGram24K_ILS = (goldOunceUSD / gramsPerOunce) * usdToIls;

    final Map<String, dynamic> rates = {
      'goldOunceUSD': goldOunceUSD,
      'usdToIls': usdToIls,
      'gram24K': pricePerGram24K_ILS,
      'gram21K': pricePerGram24K_ILS * (21.0 / 24.0),
      'gram18K': pricePerGram24K_ILS * (18.0 / 24.0),
      'gram14K': pricePerGram24K_ILS * (14.0 / 24.0),
      'gram9K':  pricePerGram24K_ILS * (9.0 / 24.0),
      'updatedAt': DateTime.now().toIso8601String(),
    };

    // Save to SharedPreferences for offline field use
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString('cached_gold_rates', jsonEncode(rates));

    return rates;
  } catch (e) {
    // Fallback to cached rates
    final prefs = await SharedPreferences.getInstance();
    final cached = prefs.getString('cached_gold_rates');
    if (cached != null) {
      return jsonDecode(cached) as Map<String, dynamic>;
    }
    rethrow;
  }
}`,

  calculateGoldOffer: `// Custom Function for FlutterFlow: Calculate Gold Offer Price
// Inputs: weight (double), karat (double), xauUsd (double), usdIls (double), marginPercent (double)
// Output: double (Final offer price in ILS)

double calculateGoldOfferPrice(
  double weightGrams,
  double karat,
  double xauUsd,
  double usdIls,
  double marginPercent,
) {
  if (weightGrams <= 0 || karat <= 0 || xauUsd <= 0 || usdIls <= 0) {
    return 0.0;
  }
  
  // 1 Troy Ounce = 31.1034768 grams
  const double gramsPerOunce = 31.1034768;
  
  // Calculate purity ratio (e.g. 14K -> 14/24 = 0.5833, 18K -> 18/24 = 0.75)
  double purityRatio = karat / 24.0;
  
  // Price per pure gram in USD
  double pureGramUsd = xauUsd / gramsPerOunce;
  
  // Gross market value in ILS
  double grossValueIls = weightGrams * purityRatio * pureGramUsd * usdIls;
  
  // Apply dealer margin discount (e.g. 10% margin -> customer receives 90% of spot)
  double marginRatio = (100.0 - marginPercent) / 100.0;
  
  double offerPrice = grossValueIls * marginRatio;
  return double.parse(offerPrice.toStringAsFixed(2));
}`,

  parseScaleOcr: `// Custom Function for FlutterFlow: Parse Weight Reading from OCR Text
// Input: ocrRawText (String)
// Output: double? (Extracted numeric weight in grams)

double? parseScaleWeight(String ocrRawText) {
  if (ocrRawText.isEmpty) return null;
  
  // Regex to find decimal numbers followed by optional 'g' or 'gr' or standalone digits
  RegExp regExp = RegExp(r'(\\d+(?:\\.\\d+)?)\\s*(?:g|gr|gram)?', caseSensitive: false);
  Match? match = regExp.firstMatch(ocrRawText);
  
  if (match != null) {
    String? numStr = match.group(1);
    if (numStr != null) {
      return double.tryParse(numStr);
    }
  }
  return null;
}`,

  calculateDealerProfit: `// Custom Function for FlutterFlow: Calculate Gross Market Value & Profit
// Returns a Map with 'grossValue' and 'profitAmount'

Map<String, double> calculateDealerBreakdown(
  double weightGrams,
  double karat,
  double xauUsd,
  double usdIls,
  double marginPercent,
) {
  const double gramsPerOunce = 31.1034768;
  double purityRatio = karat / 24.0;
  double grossValue = weightGrams * purityRatio * (xauUsd / gramsPerOunce) * usdIls;
  double offerPrice = grossValue * ((100.0 - marginPercent) / 100.0);
  double profit = grossValue - offerPrice;
  
  return {
    'grossValue': double.parse(grossValue.toStringAsFixed(2)),
    'offerPrice': double.parse(offerPrice.toStringAsFixed(2)),
    'profitAmount': double.parse(profit.toStringAsFixed(2)),
  };
}`
};

export const JSON_SCHEMAS = {
  metalpriceApi: {
    endpoint: "https://api.metalpriceapi.com/v1/latest",
    method: "GET",
    queryParameters: [
      { key: "api_key", type: "String", value: "YOUR_API_KEY" },
      { key: "base", type: "String", value: "USD" },
      { key: "currencies", type: "String", value: "XAU" }
    ],
    sampleResponseBody: `{
  "success": true,
  "base": "USD",
  "timestamp": 1722345600,
  "rates": {
    "XAU": 0.00037238, // 1 / XAU = Ounce Price USD (e.g. $2685.40)
    "USD": 1.0
  }
}`,
    jsonPathToOuncePrice: "1 / $.rates.XAU"
  },

  goldApi: {
    endpoint: "https://www.goldapi.io/api/XAU/USD",
    method: "GET",
    headers: [
      { key: "x-access-token", value: "YOUR_GOLDAPI_KEY" },
      { key: "Content-Type", value: "application/json" }
    ],
    sampleResponseBody: `{
  "timestamp": 1722345600,
  "metal": "XAU",
  "currency": "USD",
  "exchange": "FOREX",
  "symbol": "FOREX:XAUUSD",
  "prev_close_price": 2680.10,
  "price": 2685.40,
  "ch": 5.30,
  "chp": 0.20,
  "price_gram_24k": 86.33,
  "price_gram_22k": 79.14,
  "price_gram_21k": 75.54,
  "price_gram_18k": 64.75,
  "price_gram_14k": 50.36
}`,
    jsonPathToOuncePrice: "$.price"
  },

  exchangeRateApi: {
    endpoint: "https://open.er-api.com/v6/latest/USD",
    method: "GET",
    sampleResponseBody: `{
  "result": "success",
  "provider": "https://www.exchangerate-api.com",
  "base_code": "USD",
  "rates": {
    "ILS": 3.65,
    "EUR": 0.92,
    "GBP": 0.78
  }
}`,
    jsonPathToIlsRate: "$.rates.ILS"
  },

  visionOcrApi: {
    endpoint: "https://vision.googleapis.com/v1/images:annotate?key=YOUR_API_KEY",
    method: "POST",
    sampleRequestBody: `{
  "requests": [
    {
      "image": {
        "content": "BASE64_ENCODED_SCALE_PHOTO_STRING"
      },
      "features": [
        {
          "type": "TEXT_DETECTION",
          "maxResults": 1
        }
      ]
    }
  ]
}`,
    sampleResponseBody: `{
  "responses": [
    {
      "textAnnotations": [
        {
          "locale": "en",
          "description": "42.85 g\\n"
        }
      ]
    }
  ]
}`,
    jsonPathToOcrText: "$.responses[0].textAnnotations[0].description"
  }
};

export const APP_STATE_VARIABLES = [
  { name: "xauUsdRate", type: "Double", defaultValue: "2685.40", description: "מחיר אונקיית זהב בדולר (XAU/USD)" },
  { name: "usdIlsRate", type: "Double", defaultValue: "3.65", description: "שער חליפין דולר לשקל (USD/ILS)" },
  { name: "gold24kGramIls", type: "Double", defaultValue: "315.20", description: "מחיר מחושב לגרם 24K בש\"ח" },
  { name: "defaultMarginPercent", type: "Double", defaultValue: "10.0", description: "עמלת סוחר דיפולטיבית באחוזים" },
  { name: "cartItems", type: "List<DataType: GoldItemStruct>", defaultValue: "[]", description: "רשימת הפריטים בסל העסקה הנוכחית" },
  { name: "cartTotalOfferIls", type: "Double", defaultValue: "0.0", description: "סה\"כ לתשלום ללקוח בסל" },
  { name: "cartTotalGrossIls", type: "Double", defaultValue: "0.0", description: "סה\"כ שווי שוק גולמי בסל" },
  { name: "cartTotalProfitIls", type: "Double", defaultValue: "0.0", description: "סה\"כ רווח סוחר צפוי" },
  { name: "lastRateUpdate", type: "DateTime", defaultValue: "Current Time", description: "זמן עדכון שערים אחרון" },
];

export const FLUTTERFLOW_STEPS = [
  {
    step: 1,
    title: "הגדרת API Calls ב-FlutterFlow",
    details: [
      "צור API Call בשם 'GetGoldPrice' לכתובת MetalpriceAPI או GoldAPI.",
      "צור API Call בשם 'GetExchangeRate' לכתובת open.er-api.com/v6/latest/USD.",
      "צור API Call בשם 'OCR_Scale' לכתובת Google Cloud Vision API.",
      "הגדר JSON Paths לחילוץ $.rates.ILS, $.price / $.rates.XAU."
    ]
  },
  {
    step: 2,
    title: "הגדרת App State & Custom Data Types",
    details: [
      "צור Data Type מותאם בשם 'GoldItemStruct' עם השדות: item_name (String), weight_grams (Double), karat (Double), offer_price (Double), gross_value (Double), photo_path (String).",
      "צור את משתני ה-App State לפי הטבלה המצורפת (xauUsdRate, usdIlsRate, cartItems, cartTotalOfferIls)."
    ]
  },
  {
    step: 3,
    title: "יצירת Custom Functions (Dart)",
    details: [
      "הוסף ב-FlutterFlow Custom Functions לשלוש הפונקציות: calculateGoldOfferPrice, parseScaleWeight, calculateDealerBreakdown.",
      "בדוק תקינות קוד ב-Custom Code Editor בתוך FlutterFlow."
    ]
  },
  {
    step: 4,
    title: "בניית המסכים והרכיבים (UI/UX)",
    details: [
      "מסך ראשי: כרטיסיית שערי זהב ודולר בלייב + כפתור רענון.",
      "כרטיסיית חישוב: ChoiceChips לבחירת Karat (14K, 18K, 21K, 24K), TextField למשקל עם כפתור מצלמה לפתיחת Camera Widget.",
      "רשימת סל פריטים (ListView / Container Grid) עם חישוב מצטבר בזמן אמת.",
      "כפתור הוספה לסל עם Action Flow שמעדכן את cartItems ומשחזר את השדות."
    ]
  },
  {
    step: 5,
    title: "הפקת PDF ושליחה בוואטסאפ",
    details: [
      "השתמש ב-FlutterFlow Package pdf (pdf: ^3.10.8 & printing: ^5.11.0) או ב-WebView להפקת PDF HTML.",
      "עבור וואטסאפ: הוסף Action של Launch URL בקישור: https://wa.me/{phone}?text={encoded_message}."
    ]
  }
];
