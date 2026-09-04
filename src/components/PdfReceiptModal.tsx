import React, { useRef, useState } from 'react';
import { X, Printer, Download, Send, Copy, Check, ShieldCheck, CheckCircle2, FileText, FileCode, Image, Mail } from 'lucide-react';
import { TradeItem, CartTotals, RatesData, BusinessSettings, DiamondItem } from '../types';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

interface PdfReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  cart: TradeItem[];
  totals: CartTotals;
  rates: RatesData | null;
  clientName: string;
  clientPhone: string;
  clientEmail?: string;
  clientNotes: string;
  settings: BusinessSettings;
}

export const PdfReceiptModal: React.FC<PdfReceiptModalProps> = ({
  isOpen,
  onClose,
  cart,
  totals,
  rates,
  clientName,
  clientPhone,
  clientEmail,
  clientNotes,
  settings,
}) => {
  const receiptRef = useRef<HTMLDivElement>(null);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [copiedWhatsApp, setCopiedWhatsApp] = useState(false);
  const [copiedImage, setCopiedImage] = useState(false);
  const [includeItemPhotos, setIncludeItemPhotos] = useState<boolean>(true);

  if (!isOpen) return null;

  const dealDate = new Date().toLocaleDateString('he-IL', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  const dealId = 'DEAL-' + Math.floor(100000 + Math.random() * 900000);

  // Normalize WhatsApp Phone
  let cleanPhone = clientPhone.replace(/[^0-9]/g, '');
  if (cleanPhone.startsWith('0')) {
    cleanPhone = '972' + cleanPhone.substring(1);
  }

  // Format cart items text with photo links/notes
  const itemsText = cart.map((item, i) => {
    let itemLine = '';
    if (item.category === 'diamond') {
      const d = item as DiamondItem;
      itemLine = `${i + 1}. 💎 *${item.name}* - ${d.caratWeight.toFixed(2)}ct (${d.color}/${d.clarity} ${d.lab}) [Rap: -${d.dealerDiscountPercent}%] = ₪${item.offerPriceIls.toLocaleString('he-IL')} ($${d.totalPriceUsd})`;
    } else {
      itemLine = `${i + 1}. 🪙 *${item.name}* (${item.karat}K) - ${item.weightGrams}g = ₪${item.offerPriceIls.toLocaleString('he-IL')}`;
    }
    if (item.itemPhotoUrl) {
      if (item.itemPhotoUrl.startsWith('http://') || item.itemPhotoUrl.startsWith('https://')) {
        itemLine += `\n   📷 תמונה: ${item.itemPhotoUrl}`;
      } else {
        itemLine += `\n   📷 צורף צילום פריט בעסקה`;
      }
    }
    return itemLine;
  }).join('\n');

  const photosCount = cart.filter((i) => i.itemPhotoUrl).length;
  const photosHeader = photosCount > 0 ? `\n📸 *תיעוד תמונות:* צורפו ${photosCount} צילומים במסמך העסקה המצורף.\n` : '';

  // Raw summary message for WhatsApp
  const whatsappSummaryText = `שלום ${clientName || 'סוחר / לקוח יקר'},
להלן סיכום הצעת המחיר לעסקה מאת ${settings.businessName}:

📄 *מספר עסקה:* ${dealId}
📅 *תאריך:* ${dealDate}
⚖️ *סה"כ משקל זהב:* ${totals.totalWeightGrams.toFixed(2)} גרם
💎 *סה"כ יהלומים:* ${(totals.totalCarats || 0).toFixed(2)} קראט
💰 *סה"כ לתשלום סופי:* ₪${totals.totalOfferPriceIls.toLocaleString('he-IL', { minimumFractionDigits: 2 })}

*פירוט פריטים בסל העסקה:*
${itemsText}
${photosHeader}
*שערי ייחוס בעסקה:*
• XAU/USD: $${rates?.xauUsd?.toFixed(2) || '3310.50'}
• USD/ILS: ₪${rates?.usdIls?.toFixed(3) || '3.650'}

בברכה,
${settings.dealerName} | ${settings.phone}`;

  const encodedText = encodeURIComponent(whatsappSummaryText);
  const waUrl = cleanPhone
    ? `https://api.whatsapp.com/send?phone=${cleanPhone}&text=${encodedText}`
    : `https://api.whatsapp.com/send?text=${encodedText}`;

  // Share via WhatsApp with Image file if supported, or open WhatsApp web
  const handleShareWhatsApp = async () => {
    if (receiptRef.current && typeof navigator !== 'undefined' && navigator.share && navigator.canShare) {
      try {
        setIsGeneratingPdf(true);
        const canvas = await html2canvas(receiptRef.current, {
          scale: 2,
          useCORS: true,
          allowTaint: true,
          backgroundColor: '#ffffff',
          logging: false,
        });

        const blob = await new Promise<Blob | null>((resolve) =>
          canvas.toBlob((b) => resolve(b), 'image/png')
        );

        if (blob) {
          const file = new File([blob], `קבלת_זהב_${dealId}.png`, { type: 'image/png' });
          if (navigator.canShare({ files: [file] })) {
            await navigator.share({
              title: `קבלת זהב וצילומי פריטים - ${dealId}`,
              text: whatsappSummaryText,
              files: [file],
            });
            setIsGeneratingPdf(false);
            return;
          }
        }
      } catch (e) {
        console.warn('Web share failed, falling back to standard WhatsApp URL:', e);
      } finally {
        setIsGeneratingPdf(false);
      }
    }

    // Fallback window open
    window.open(waUrl, '_blank');
  };

  // Send formatted deal summary and details via Email
  const handleSendEmail = () => {
    const subject = encodeURIComponent(`סיכום עסקת זהב ${dealId} - ${settings.businessName}`);
    const emailBody = `שלום ${clientName || 'סוחר / לקוח יקר'},

להלן סיכום הצעת המחיר לעסקה מאת ${settings.businessName}:

מספר עסקה: ${dealId}
תאריך: ${dealDate}
סה"כ משקל זהב: ${totals.totalWeightGrams.toFixed(2)} גרם
${totals.totalCarats ? `סה"כ יהלומים: ${totals.totalCarats.toFixed(2)} קראט\n` : ''}
סה"כ לתשלום סופי: ₪${totals.totalOfferPriceIls.toLocaleString('he-IL', { minimumFractionDigits: 2 })}

פירוט פריטים בעסקה:
${cart.map((item, i) => `${i + 1}. ${item.name} (${item.karat ? item.karat + 'K' : 'יהלום'}) - משקל: ${item.weightGrams}g | סכום: ₪${item.offerPriceIls.toLocaleString('he-IL')}`).join('\n')}

שערי ייחוס בעסקה:
• XAU/USD (זהב): $${rates?.xauUsd?.toFixed(2) || '---'}
• USD/ILS (דולר): ₪${rates?.usdIls?.toFixed(3) || '---'}

בברכה,
${settings.dealerName} | ${settings.phone}
${settings.businessName} - ${settings.address}`;

    const mailtoUrl = `mailto:${clientEmail || ''}?subject=${subject}&body=${encodeURIComponent(emailBody)}`;
    window.open(mailtoUrl, '_blank');
  };

  // Copy receipt canvas image to clipboard for easy WhatsApp pasting (Ctrl+V)
  const handleCopyReceiptImage = async () => {
    if (!receiptRef.current) return;
    setIsGeneratingPdf(true);
    try {
      const canvas = await html2canvas(receiptRef.current, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        logging: false,
      });

      const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/png'));
      if (blob && navigator.clipboard && typeof ClipboardItem !== 'undefined') {
        await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]);
        setCopiedImage(true);
        setTimeout(() => setCopiedImage(false), 4000);
      } else {
        // Fallback to downloading PNG if clipboard image write not supported
        handleDownloadPng();
      }
    } catch (e) {
      console.warn('Failed to copy image to clipboard:', e);
      handleDownloadPng();
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  // Download Receipt as PNG Image file
  const handleDownloadPng = async () => {
    if (!receiptRef.current) return;
    setIsGeneratingPdf(true);
    try {
      const canvas = await html2canvas(receiptRef.current, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        logging: false,
      });

      const dataUrl = canvas.toDataURL('image/png');
      const a = document.createElement('a');
      a.href = dataUrl;
      a.download = `קבלת_זהב_${(clientName || 'לקוח').replace(/\s+/g, '_')}_${dealId}.png`;
      a.click();
    } catch (e) {
      console.error('PNG download failed:', e);
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  // Copy WhatsApp text to clipboard
  const handleCopyWhatsAppText = () => {
    navigator.clipboard?.writeText(whatsappSummaryText).then(() => {
      setCopiedWhatsApp(true);
      setTimeout(() => setCopiedWhatsApp(false), 3000);
    });
  };

  // Generate & Download PDF document
  const handleDownloadPdf = async () => {
    if (!receiptRef.current) return;
    setIsGeneratingPdf(true);

    try {
      const element = receiptRef.current;

      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        logging: false,
        imageTimeout: 8000,
        windowWidth: 800,
      });

      const imgData = canvas.toDataURL('image/jpeg', 0.95);
      const pdf = new jsPDF({
        orientation: 'p',
        unit: 'mm',
        format: 'a4',
      });

      const pdfWidth = 210;
      const pageHeight = 297;
      const imgHeight = (canvas.height * pdfWidth) / canvas.width;

      if (imgHeight <= pageHeight) {
        pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, imgHeight);
      } else {
        // Multi-page or proportional fit without distorting aspect ratio
        const scaleFactor = Math.min(1, (pageHeight - 10) / imgHeight);
        const scaledWidth = pdfWidth * scaleFactor;
        const scaledHeight = imgHeight * scaleFactor;
        const xMargin = (pdfWidth - scaledWidth) / 2;

        pdf.addImage(imgData, 'JPEG', xMargin, 5, scaledWidth, scaledHeight);
      }

      pdf.save(`קבלת_זהב_${(clientName || 'לקוח').replace(/\s+/g, '_')}_${dealId}.pdf`);
    } catch (err) {
      console.error('PDF Canvas rendering error:', err);
      handleDownloadHtml();
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  // Download standalone formatted HTML receipt
  const handleDownloadHtml = () => {
    if (!receiptRef.current) return;
    const htmlContent = `<!DOCTYPE html>
<html dir="rtl" lang="he">
<head>
  <meta charset="UTF-8">
  <title>קבלת זהב - ${dealId}</title>
  <style>
    body { font-family: system-ui, -apple-system, sans-serif; background: #f8fafc; color: #0f172a; margin: 0; padding: 20px; }
    .receipt-box { max-width: 800px; margin: 0 auto; background: #ffffff; border: 1px solid #cbd5e1; border-radius: 12px; padding: 32px; box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1); }
    table { width: 100%; border-collapse: collapse; font-size: 13px; text-align: right; margin-bottom: 24px; }
    th { background: #0f172a; color: #fde68a; padding: 10px; border-bottom: 2px solid #d97706; }
    td { padding: 10px; border-bottom: 1px solid #e2e8f0; }
    tr:nth-child(even) { background: #f8fafc; }
    @media print { body { background: none; padding: 0; } }
  </style>
</head>
<body>
  <div class="receipt-box">
    ${receiptRef.current.innerHTML}
  </div>
</body>
</html>`;

    const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `קבלת_זהב_${(clientName || 'לקוח').replace(/\s+/g, '_')}_${dealId}.html`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Download TXT summary file
  const handleDownloadTxt = () => {
    const blob = new Blob([whatsappSummaryText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `סיכום_עסקה_${(clientName || 'לקוח').replace(/\s+/g, '_')}_${dealId}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Trigger browser print dialog
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/85 backdrop-blur-md overflow-y-auto">
      <div className="bg-slate-900 border border-amber-500/40 rounded-2xl w-full max-w-3xl shadow-2xl overflow-hidden my-auto flex flex-col max-h-[95vh]">
        {/* Header Action Bar */}
        <div className="p-4 bg-slate-950 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="text-sm sm:text-base font-bold text-slate-100 flex items-center gap-2">
              תצוגת מסמך הצעת מחיר / קבלת זהב (PDF)
              <span className="text-xs text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded font-mono">
                {dealId}
              </span>
            </h3>
            <p className="text-xs text-slate-400">מסמך ממותג מוכן להורדה ולשליחה ישירה ללקוח</p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* Toggle Include Item Photos in Document */}
            <button
              onClick={() => setIncludeItemPhotos(!includeItemPhotos)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold border transition-all ${
                includeItemPhotos
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 shadow-sm'
                  : 'bg-slate-800 text-slate-400 border-slate-700'
              }`}
              title="הצג/הסתר תמונות פריטים במסמך הקבלה והצעת המחיר"
            >
              <Image className="w-3.5 h-3.5 text-amber-400" />
              <span>{includeItemPhotos ? 'תמונות פריטים: מוצגות' : 'תמונות פריטים: מוסתרות'}</span>
            </button>

            {/* Copy Receipt Image to Clipboard for Instant WhatsApp Ctrl+V Paste */}
            <button
              onClick={handleCopyReceiptImage}
              disabled={isGeneratingPdf}
              className={`flex items-center gap-1.5 text-xs font-bold px-3 py-2 rounded-xl transition-all shadow-md border ${
                copiedImage
                  ? 'bg-emerald-600 text-white border-emerald-500'
                  : 'bg-slate-800 hover:bg-slate-700 text-amber-300 border-amber-500/30'
              }`}
              title="העתק את תמונת הקבלה והצילומים ללוח - להדבקה ישירה ב-WhatsApp (Ctrl+V)"
            >
              {copiedImage ? (
                <>
                  <Check className="w-3.5 h-3.5 text-white" />
                  <span>התמונה הועתקה! (הדבק ב-WhatsApp)</span>
                </>
              ) : (
                <>
                  <Image className="w-3.5 h-3.5 text-amber-400" />
                  <span>העתק תמונה (להדבקה ב-WhatsApp)</span>
                </>
              )}
            </button>

            {/* Direct WhatsApp Button */}
            <button
              onClick={handleShareWhatsApp}
              disabled={isGeneratingPdf}
              className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold px-3 py-2 rounded-xl transition-all shadow-md shadow-emerald-600/20 active:scale-95 disabled:opacity-50"
              title="פתח וואטסאפ לשליחת הסיכום"
            >
              <Send className="w-3.5 h-3.5" />
              <span>WhatsApp</span>
            </button>

            {/* Direct Email Button */}
            <button
              onClick={handleSendEmail}
              disabled={isGeneratingPdf}
              className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold px-3 py-2 rounded-xl transition-all shadow-md shadow-blue-600/20 active:scale-95 disabled:opacity-50"
              title="שלח סיכום עסקה ישירות למייל הלקוח"
            >
              <Mail className="w-3.5 h-3.5" />
              <span>שלח במייל</span>
            </button>

            {/* Copy WhatsApp Text Button */}
            <button
              onClick={handleCopyWhatsAppText}
              title="העתק טקסט הצעת מחיר ללוח"
              className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-bold px-3 py-2 rounded-xl transition-all"
            >
              {copiedWhatsApp ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400">הועתק!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-amber-400" />
                  <span>העתק טקסט</span>
                </>
              )}
            </button>

            {/* Print Button */}
            <button
              onClick={handlePrint}
              title="הדפס מסמך"
              className="p-2 text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl transition-all"
            >
              <Printer className="w-4 h-4" />
            </button>

            {/* Download PNG Button */}
            <button
              onClick={handleDownloadPng}
              disabled={isGeneratingPdf}
              className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-bold px-3 py-2 rounded-xl transition-all"
              title="הורד כתמונה מלאה (PNG)"
            >
              <Download className="w-3.5 h-3.5 text-amber-400" />
              <span>תמונה (PNG)</span>
            </button>

            {/* Download PDF Button */}
            <button
              onClick={handleDownloadPdf}
              disabled={isGeneratingPdf}
              className="flex items-center gap-1.5 bg-gradient-to-r from-amber-400 to-amber-600 hover:from-amber-300 hover:to-amber-500 text-slate-950 text-xs font-bold px-3.5 py-2 rounded-xl transition-all shadow-lg shadow-amber-500/20 disabled:opacity-50"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{isGeneratingPdf ? 'מייצר...' : 'הורד PDF'}</span>
            </button>

            {/* Close Button */}
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-200 rounded-xl bg-slate-800 hover:bg-slate-700 transition-all"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* WhatsApp Guidance Bar */}
        <div className="bg-amber-500/10 border-b border-amber-500/20 px-4 py-2 flex items-center justify-between text-[11px] text-amber-200">
          <span className="flex items-center gap-2">
            <span className="font-bold text-amber-400 shrink-0">💡 לשליחת תמונות ב-WhatsApp:</span>
            <span>דפדפנים אינם מאפשרים הזרקת קבצים אוטומטית ישירות לקישור WhatsApp. לחץ <strong>'העתק תמונה'</strong> והדבק בצ'אט (<strong>Ctrl+V</strong>) או הורד <strong>PNG / PDF</strong>.</span>
          </span>
        </div>

        {/* PDF Printable Document Container (Styled like clean white paper invoice) */}
        <div className="p-4 sm:p-8 overflow-y-auto bg-slate-950/80">
          <div
            ref={receiptRef}
            className="bg-white text-slate-900 rounded-xl p-6 sm:p-10 shadow-xl border border-slate-200 font-sans text-right dir-rtl max-w-2xl mx-auto"
            style={{ minHeight: '600px' }}
          >
            {/* Business Header */}
            <div className="flex items-start justify-between border-b-2 border-amber-500 pb-4 mb-6">
              <div>
                <h1 className="text-2xl font-black text-amber-700 tracking-tight">
                  {settings.businessName || 'גולדטרייד - קנייה ומכירת זהב'}
                </h1>
                <p className="text-xs text-slate-600 font-medium">
                  {settings.dealerName || 'סוחר מורשה קניית מתכות יקרות'} &bull; טלפון: {settings.phone || '050-0000000'}
                </p>
                <p className="text-xs text-slate-500">{settings.address || 'ישראל'}</p>
              </div>

              <div className="text-left font-mono text-xs">
                <span className="bg-amber-100 text-amber-900 font-bold px-2 py-1 rounded border border-amber-300 block mb-1">
                  הצעת מחיר / קבלה
                </span>
                <span className="text-slate-500 block">מזהה: {dealId}</span>
                <span className="text-slate-500 block">{dealDate}</span>
              </div>
            </div>

            {/* Client Info Bar */}
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 mb-6 grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
              <div>
                <span className="text-slate-500 block text-[11px]">שם הלקוח:</span>
                <strong className="text-slate-900 text-sm font-bold">{clientName || 'לקוח כללי / מזומן'}</strong>
              </div>

              <div>
                <span className="text-slate-500 block text-[11px]">טלפון:</span>
                <strong className="text-slate-900 font-mono text-sm">{clientPhone || 'לא צוין'}</strong>
              </div>

              {clientEmail && (
                <div>
                  <span className="text-slate-500 block text-[11px]">אימייל:</span>
                  <strong className="text-slate-900 font-mono text-xs">{clientEmail}</strong>
                </div>
              )}

              {clientNotes && (
                <div className="col-span-2 sm:col-span-3 pt-2 border-t border-slate-200 text-slate-700">
                  <span className="text-slate-500 text-[11px] block">הערות:</span>
                  <span>{clientNotes}</span>
                </div>
              )}
            </div>

            {/* Live Spot Rates Snapshot */}
            <div className="mb-6 bg-amber-50/80 border border-amber-200 rounded-lg p-3 text-xs flex items-center justify-between">
              <div>
                <span className="text-amber-800 font-bold block">שערי ייחוס ברגע העסקה:</span>
                <span className="text-slate-600">
                  XAU/USD: <strong>${rates?.xauUsd?.toFixed(2) || '2685.40'}</strong> &bull; USD/ILS: <strong>₪{rates?.usdIls?.toFixed(3) || '3.650'}</strong>
                </span>
              </div>

              <div className="text-left font-mono font-bold text-amber-900">
                זהב 24K: ₪{rates?.gold24kPerGramIls?.toFixed(2) || '315.20'}/גרם
              </div>
            </div>

            {/* Itemized Table */}
            <div className="mb-6 overflow-x-auto">
              <table className="w-full text-right border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-900 text-amber-300 border-b-2 border-amber-500 font-bold">
                    <th className="py-2.5 px-3">#</th>
                    <th className="py-2.5 px-3">תיאור ופרטי הפריט</th>
                    <th className="py-2.5 px-3">מפרט (קראט/צבע/ניקיון)</th>
                    <th className="py-2.5 px-3">משקל (גרם / ct)</th>
                    <th className="py-2.5 px-3 text-left">מחיר בש"ח</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 text-slate-800">
                  {cart.map((item, idx) => {
                    const isDiamond = item.category === 'diamond';
                    const d = isDiamond ? (item as DiamondItem) : null;

                    return (
                      <tr key={item.id} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50'}>
                        <td className="py-2.5 px-3 font-bold text-slate-500">{idx + 1}</td>
                        <td className="py-2.5 px-3 font-semibold">
                          <div className="flex items-center gap-2.5">
                            {includeItemPhotos && item.itemPhotoUrl && (
                              <img
                                src={item.itemPhotoUrl}
                                alt={item.name}
                                style={{ width: '48px', height: '48px', minWidth: '48px', minHeight: '48px', maxWidth: '48px', maxHeight: '48px', objectFit: 'cover' }}
                                className="w-12 h-12 rounded-lg object-cover border-2 border-amber-400/80 shadow-sm shrink-0"
                              />
                            )}
                            <div>
                              <div className="font-bold text-slate-900">{item.name}</div>
                              {isDiamond && d ? (
                                <div className="text-[10px] text-cyan-800 font-medium">
                                  מעבדה: {d.lab} {d.certNumber ? `| תעודה: #${d.certNumber}` : ''} | רפפורט: -{d.dealerDiscountPercent}% (${d.pricePerCaratUsd}/ct)
                                </div>
                              ) : (
                                item.itemType && (
                                  <div className="text-[10px] text-slate-500 font-medium">סוג: {item.itemType}</div>
                                )
                              )}
                              {item.notes && (
                                <div className="text-[10px] text-amber-800 font-normal italic">
                                  הערות: {item.notes}
                                </div>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="py-2.5 px-3 font-bold text-slate-800">
                          {isDiamond && d ? (
                            <span className="text-cyan-900 font-black">{d.color}/{d.clarity}</span>
                          ) : (
                            <span className="text-amber-800">{item.karat}K</span>
                          )}
                        </td>
                        <td className="py-2.5 px-3 font-mono">
                          {isDiamond && d ? (
                            <span className="text-cyan-900 font-bold">{d.caratWeight.toFixed(2)} ct</span>
                          ) : (
                            <span>{item.weightGrams.toFixed(2)} גרם</span>
                          )}
                        </td>
                        <td className="py-2.5 px-3 text-left font-black font-mono text-slate-900">
                          ₪{item.offerPriceIls.toLocaleString('he-IL', { minimumFractionDigits: 2 })}
                          {isDiamond && d && (
                            <span className="block text-[10px] text-slate-500 font-normal">
                              (${d.totalPriceUsd.toLocaleString('en-US')})
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Photo Annex Gallery Section if Enabled */}
            {includeItemPhotos && cart.some((i) => i.itemPhotoUrl) && (
              <div className="mb-6 p-4 bg-slate-50 border border-slate-200 rounded-xl">
                <div className="flex items-center justify-between mb-3 border-b border-slate-200 pb-2">
                  <h4 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <Image className="w-4 h-4 text-amber-600" />
                    <span>נספח צילומי פריטי הזהב בעסקה:</span>
                  </h4>
                  <span className="text-[10px] text-slate-500">תיעוד חזותי מלא למסמך וללקוח</span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {cart.map((item, idx) =>
                    item.itemPhotoUrl ? (
                      <div key={item.id} className="bg-white p-2 rounded-lg border border-slate-200 text-center shadow-sm">
                        <div style={{ width: '100%', height: '96px', overflow: 'hidden', borderRadius: '6px' }} className="mb-1.5 border border-slate-200">
                          <img
                            src={item.itemPhotoUrl}
                            alt={item.name}
                            style={{ width: '100%', height: '96px', maxHeight: '96px', objectFit: 'cover', display: 'block' }}
                            className="w-full h-24 object-cover rounded-md"
                          />
                        </div>
                        <span className="text-[11px] font-bold text-slate-900 block truncate">
                          #{idx + 1} {item.name}
                        </span>
                        <div className="flex items-center justify-between text-[10px] text-slate-600 mt-1 pt-1 border-t border-slate-100">
                          <span className="font-bold text-amber-700">{item.karat}K</span>
                          <span className="font-mono">{item.weightGrams} גרם</span>
                        </div>
                      </div>
                    ) : null
                  )}
                </div>
              </div>
            )}

            {/* Grand Total Payout */}
            <div className="bg-slate-900 text-white rounded-xl p-4 mb-6 flex items-center justify-between border-2 border-amber-500">
              <div>
                <span className="text-xs text-amber-300 font-bold uppercase tracking-wider block">
                  סה"כ לתשלום סופי במזומן ללקוח:
                </span>
                <span className="text-xs text-slate-300">
                  סה"כ משקל כולל: {totals.totalWeightGrams.toFixed(2)} גרם
                </span>
              </div>

              <div className="text-left font-mono">
                <span className="text-3xl font-black text-amber-400">
                  ₪{totals.totalOfferPriceIls.toLocaleString('he-IL', { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>

            {/* Signatures & Terms */}
            <div className="border-t border-slate-300 pt-6 mt-8 grid grid-cols-2 gap-8 text-xs text-slate-600">
              <div>
                <p className="font-bold text-slate-800 mb-1">חתימת הלקוח המוכר:</p>
                <p className="text-[11px] text-slate-500 mb-6">
                  הנני מצהיר כי הזהב בבעלותי הבלעדית והחוקית.
                </p>
                <div className="border-b border-slate-400 w-full h-8"></div>
              </div>

              <div>
                <p className="font-bold text-slate-800 mb-1">חתימת הסוחר הקונה:</p>
                <p className="text-[11px] text-slate-500 mb-6">
                  {settings.businessName} - אושר ושולם במזומן.
                </p>
                <div className="border-b border-slate-400 w-full h-8"></div>
              </div>
            </div>

            {/* Footer notice */}
            <div className="mt-8 text-center text-[10px] text-slate-400 border-t border-slate-100 pt-3">
              הופק באמצעות GoldTrade Pro &bull; מערכת תמכור וניהול עסקאות זהב בשטח &bull; {dealId}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
