import React, { useState, useRef } from 'react';
import { X, Save, Building, User, Phone, MapPin, Percent, Check, Image as ImageIcon, Upload, Trash2, Mail, FileText, Hash, ShieldCheck, RefreshCw, Download, Smartphone } from 'lucide-react';
import { BusinessSettings } from '../types';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: BusinessSettings;
  onSaveSettings: (newSettings: BusinessSettings) => void;
  onForceUpdateApp?: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onSaveSettings,
  onForceUpdateApp,
}) => {
  const [formData, setFormData] = useState<BusinessSettings>(settings);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData((prev) => ({ ...prev, logoUrl: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveLogo = () => {
    setFormData((prev) => ({ ...prev, logoUrl: undefined }));
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveSettings(formData);
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 1000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md dir-rtl">
      <div className="bg-slate-900 border border-amber-500/40 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <Building className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-slate-100 flex items-center gap-2">
                הגדרות סוחר וניהול עסק
              </h3>
              <p className="text-xs text-slate-400">עמלת ברירת מחדל, פרטי עסק ומיתוג, לוגו והערות למסמכים</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-200 rounded-lg bg-slate-800 hover:bg-slate-700 transition-all"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 overflow-y-auto space-y-5 text-xs text-slate-200">
          {/* Section 1: Dealer Margin (Top Priority) */}
          <div className="space-y-3 bg-slate-950/80 p-4 rounded-xl border border-amber-500/30 shadow-inner">
            <span className="text-xs font-bold text-amber-300 uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-800 pb-1.5">
              <Percent className="w-4 h-4 text-amber-400" />
              <span>1. הגדרת עמלת סוחר ברירת מחדל (Default Margin %):</span>
            </span>

            <div>
              <label className="block text-slate-400 mb-1">
                אחוז עמלת הסוחר המנוכה משער הספוט היציג (הרווח שלך):
              </label>
              <div className="flex items-center gap-2 mb-2.5">
                <input
                  type="number"
                  step="0.5"
                  min="0"
                  max="50"
                  value={formData.defaultMarginPercent}
                  onChange={(e) => setFormData({ ...formData, defaultMarginPercent: parseFloat(e.target.value) || 0 })}
                  className="w-full bg-slate-900 border border-slate-700 focus:border-amber-400 rounded-xl py-2 px-3 text-amber-300 font-mono font-black text-xl focus:outline-none shadow-inner"
                />
                <span className="text-amber-400 font-bold font-mono text-base">%</span>
              </div>

              {/* Quick Presets Buttons */}
              <div className="space-y-1">
                <span className="text-[10px] text-slate-400 block">בחירה מהירה:</span>
                <div className="grid grid-cols-7 gap-1.5">
                  {[0, 5, 8, 10, 12, 15, 20].map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => setFormData({ ...formData, defaultMarginPercent: preset })}
                      className={`py-1.5 text-xs font-bold rounded-lg border transition-all ${
                        formData.defaultMarginPercent === preset
                          ? 'bg-amber-500 text-slate-950 border-amber-400 font-black shadow-md'
                          : 'bg-slate-900 border-slate-800 text-slate-300 hover:text-white hover:border-slate-700'
                      }`}
                    >
                      {preset}%
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <span className="text-xs font-bold text-amber-300 uppercase tracking-wider block border-b border-slate-800 pb-1">
              2. פרטי מיתוג וזהות העסק (למסמכים וקבלות):
            </span>

            {/* Logo Upload */}
            <div>
              <label className="block text-slate-400 mb-1.5 flex items-center gap-1.5">
                <ImageIcon className="w-3.5 h-3.5 text-amber-400" />
                <span>לוגו העסק (יופיע בראש קבלות ומסמכים):</span>
              </label>
              
              <div className="flex items-center gap-3 p-3 bg-slate-950 rounded-xl border border-slate-800">
                {formData.logoUrl ? (
                  <div className="relative group">
                    <img
                      src={formData.logoUrl}
                      alt="לוגו עסק"
                      className="w-16 h-16 object-contain bg-white/5 rounded-lg border border-slate-700 p-1"
                    />
                    <button
                      type="button"
                      onClick={handleRemoveLogo}
                      className="absolute -top-1.5 -right-1.5 bg-rose-600 hover:bg-rose-500 text-white rounded-full p-1 shadow-md transition-all"
                      title="הסר לוגו"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                ) : (
                  <div className="w-16 h-16 rounded-lg border border-dashed border-slate-700 flex flex-col items-center justify-center text-slate-500 bg-slate-900/50">
                    <ImageIcon className="w-5 h-5 mb-0.5 opacity-50" />
                    <span className="text-[9px]">אין לוגו</span>
                  </div>
                )}

                <div className="flex-1 space-y-1">
                  <input
                    type="file"
                    ref={fileInputRef}
                    accept="image/*"
                    onChange={handleLogoUpload}
                    className="hidden"
                    id="logo-file-input"
                  />
                  <label
                    htmlFor="logo-file-input"
                    className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded-lg text-xs font-semibold transition-all"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>{formData.logoUrl ? 'החלף קובץ לוגו' : 'העלה לוגו מהמכשיר'}</span>
                  </label>
                  <p className="text-[10px] text-slate-500">תומך ב-PNG, JPG, SVG. התמונה נשמרת אוטומטית במכשיר.</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <label className="block text-slate-400 mb-1">שם העסק / מיתוג:</label>
                <input
                  type="text"
                  value={formData.businessName}
                  onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                  placeholder="למשל: גולדטרייד ירושלים"
                  className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl py-2 px-3 text-slate-100 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1 flex items-center gap-1">
                  <Hash className="w-3 h-3 text-amber-400" />
                  <span>עוסק מורשה / ח.פ:</span>
                </label>
                <input
                  type="text"
                  value={formData.businessIdNumber || ''}
                  onChange={(e) => setFormData({ ...formData, businessIdNumber: e.target.value })}
                  placeholder="למשל: 512345678"
                  className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl py-2 px-3 text-slate-100 focus:outline-none font-mono text-left dir-ltr"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <label className="block text-slate-400 mb-1">שם הסוחר:</label>
                <input
                  type="text"
                  value={formData.dealerName}
                  onChange={(e) => setFormData({ ...formData, dealerName: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl py-2 px-3 text-slate-100 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">מספר טלפון:</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl py-2 px-3 text-slate-100 focus:outline-none text-left dir-ltr"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <label className="block text-slate-400 mb-1">כתובת העסק / סניף:</label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl py-2 px-3 text-slate-100 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1 flex items-center gap-1">
                  <Mail className="w-3 h-3 text-amber-400" />
                  <span>אימייל העסק:</span>
                </label>
                <input
                  type="email"
                  value={formData.businessEmail || ''}
                  onChange={(e) => setFormData({ ...formData, businessEmail: e.target.value })}
                  placeholder="dealer@gold.co.il"
                  className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl py-2 px-3 text-slate-100 focus:outline-none text-left dir-ltr"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-400 mb-1 flex items-center gap-1">
                <FileText className="w-3 h-3 text-amber-400" />
                <span>הערות קבועות בתחתית הקבלה (תנאים, תודה, פרטי העברה בנקאית):</span>
              </label>
              <textarea
                rows={2}
                value={formData.documentFooterNotes || ''}
                onChange={(e) => setFormData({ ...formData, documentFooterNotes: e.target.value })}
                placeholder="למשל: תודה על שבחרתם בנו. התשלום בוצע בהעברה בנקאית / מזומן בהתאם לחוק המזומן."
                className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl py-2 px-3 text-slate-100 focus:outline-none resize-none"
              />
            </div>
          </div>

          <div className="space-y-3 pt-2">
            <span className="text-xs font-bold text-amber-300 uppercase tracking-wider block border-b border-slate-800 pb-1">
              3. חיבור ספקי API לשערים בזמן אמת (אופציונלי):
            </span>

            <div>
              <label className="block text-slate-400 mb-1 flex items-center justify-between">
                <span>מפתח MetalpriceAPI / GoldAPI Key:</span>
                <span className="text-[10px] text-slate-500">משמש לקבלת שערי זהב בלייב</span>
              </label>
              <input
                type="password"
                placeholder="הדבק מפתח API אישי..."
                value={formData.metalApiKey || ''}
                onChange={(e) => setFormData({ ...formData, metalApiKey: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl py-2 px-3 text-slate-100 font-mono focus:outline-none text-left dir-ltr"
              />
              <p className="text-[10px] text-slate-500 mt-1">
                אם אינך מזין מפתח, המערכת משתמשת בשערים יציגים מורשים בזמן אמת.
              </p>
            </div>
          </div>

          {/* Section 4: Mobile Version & Cache Refresh */}
          <div className="space-y-3 pt-2">
            <span className="text-xs font-bold text-amber-300 uppercase tracking-wider block border-b border-slate-800 pb-1">
              4. תחזוקת גרסה וזיכרון מטמון למובייל:
            </span>

            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between gap-3">
              <div>
                <span className="text-xs font-bold text-slate-200 block">עדכון גרסה למכשיר</span>
                <span className="text-[10px] text-slate-400 block mt-0.5">
                  נקה זיכרון מטמון (Cache) וטעון מיד את הגרסה העדכנית ביותר מהשרת
                </span>
              </div>

              {onForceUpdateApp && (
                <button
                  type="button"
                  onClick={onForceUpdateApp}
                  className="px-3 py-1.5 bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/40 text-amber-300 rounded-xl text-xs font-bold transition-all shrink-0 flex items-center gap-1.5 active:scale-95"
                  title="בצע רענון קשיח וניקוי מטמון"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>רענן גרסה</span>
                </button>
              )}
            </div>

            <div className="p-3 bg-gradient-to-r from-emerald-950/40 to-slate-950 rounded-xl border border-emerald-500/30 flex items-center justify-between gap-3">
              <div>
                <span className="text-xs font-bold text-emerald-300 block flex items-center gap-1.5">
                  <Smartphone className="w-4 h-4" />
                  <span>קובץ התקנה מקורי לאנדרואיד (APK)</span>
                </span>
                <span className="text-[10px] text-slate-400 block mt-0.5">
                  קובץ התקנה מלא למכשיר עם אייקון תכשיט זהב יוקרתי, ללא תלות בדפדפן כרום
                </span>
              </div>

              <a
                href="/GoldTrade-Pro.apk"
                download="GoldTrade-Pro.apk"
                className="px-3 py-1.5 bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/40 text-emerald-300 rounded-xl text-xs font-bold transition-all shrink-0 flex items-center gap-1.5 active:scale-95 shadow"
                title="הורד קובץ התקנה למכשיר"
              >
                <Download className="w-3.5 h-3.5" />
                <span>הורד APK</span>
              </a>
            </div>
          </div>

          {/* Submit */}
          <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-300 transition-all"
            >
              ביטול
            </button>

            <button
              type="submit"
              className="flex items-center gap-1.5 bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 hover:from-amber-300 hover:to-amber-500 text-slate-950 font-bold px-5 py-2 rounded-xl text-xs shadow-lg transition-all"
            >
              {savedSuccess ? (
                <>
                  <Check className="w-4 h-4 stroke-[3]" />
                  <span>ההגדרות נשמרו!</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 text-slate-950" />
                  <span>שמור הגדרות</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
