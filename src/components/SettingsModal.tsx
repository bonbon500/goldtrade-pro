import React, { useState } from 'react';
import { X, Save, Key, Building, User, Phone, MapPin, Percent, Check, Palette, Sparkles } from 'lucide-react';
import { BusinessSettings } from '../types';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: BusinessSettings;
  onSaveSettings: (newSettings: BusinessSettings) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onSaveSettings,
}) => {
  const [formData, setFormData] = useState<BusinessSettings>(settings);
  const [savedSuccess, setSavedSuccess] = useState(false);

  if (!isOpen) return null;

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
      <div className="bg-slate-900 border border-amber-500/40 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
              הגדרות סוחר, מיתוג וספקי API
            </h3>
            <p className="text-xs text-slate-400">התאם את פרטי העסק והמפתחות לקבלת שערים בזמן אמת</p>
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
          {/* Design Style Selection Section */}
          <div className="space-y-3 bg-slate-950/60 p-3.5 rounded-xl border border-amber-500/30">
            <span className="text-xs font-bold text-amber-300 uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-800 pb-1.5">
              <Palette className="w-4 h-4 text-amber-400" />
              <span>סגנון עיצוב וערכת נושא לאפליקציה:</span>
            </span>

            <div className="grid grid-cols-2 gap-2 pt-1">
              {[
                {
                  id: 'luxury_gold',
                  title: 'זהב יוקרתי (Dark Gold)',
                  desc: 'עיצוב כהה מהודר, מסגרות אוקטן וזהב מוברש',
                  badgeBg: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
                },
                {
                  id: 'modern_clean',
                  title: 'מודרני נקי (Ivory Light)',
                  desc: 'רקע בהיר, טיפוגרפיה חדה וגבהים נקיים',
                  badgeBg: 'bg-slate-100 text-slate-900 border-slate-300 font-bold',
                },
                {
                  id: 'emerald_classic',
                  title: 'אמרלד ירוק (Emerald Gold)',
                  desc: 'מראה בורסה ירוק קלאסי לסחר בזהב',
                  badgeBg: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
                },
                {
                  id: 'royal_dark',
                  title: 'רויאל סלייט (Slate Dark)',
                  desc: 'מראה הייטק שחור-פחם מינימליסטי',
                  badgeBg: 'bg-sky-500/20 text-sky-300 border-sky-500/40',
                },
              ].map((style) => {
                const isSelected = (formData.themeStyle || 'luxury_gold') === style.id;
                return (
                  <button
                    key={style.id}
                    type="button"
                    onClick={() => setFormData({ ...formData, themeStyle: style.id as any })}
                    className={`p-2.5 rounded-xl border text-right transition-all flex flex-col justify-between ${
                      isSelected
                        ? 'bg-amber-500/10 border-amber-400 ring-2 ring-amber-400/40 shadow-lg'
                        : 'bg-slate-950/80 border-slate-800 hover:border-slate-700 text-slate-400'
                    }`}
                  >
                    <div className="flex items-center justify-between w-full mb-1">
                      <span className={`text-[11px] font-bold ${isSelected ? 'text-amber-300' : 'text-slate-200'}`}>
                        {style.title}
                      </span>
                      {isSelected && <Check className="w-3.5 h-3.5 text-amber-400 stroke-[3]" />}
                    </div>
                    <p className="text-[10px] text-slate-400 leading-snug">{style.desc}</p>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="space-y-3">
            <span className="text-xs font-bold text-amber-300 uppercase tracking-wider block border-b border-slate-800 pb-1">
              1. פרטי מיתוג וזהות העסק (למסמכים וקבלות):
            </span>

            <div>
              <label className="block text-slate-400 mb-1">שם העסק / מיתוג:</label>
              <input
                type="text"
                value={formData.businessName}
                onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl py-2 px-3 text-slate-100 focus:outline-none"
              />
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

            <div>
              <label className="block text-slate-400 mb-1">כתובת העסק / סניף:</label>
              <input
                type="text"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl py-2 px-3 text-slate-100 focus:outline-none"
              />
            </div>
          </div>

          <div className="space-y-3 pt-2">
            <span className="text-xs font-bold text-amber-300 uppercase tracking-wider block border-b border-slate-800 pb-1">
              2. הגדרות תמכור ועמלת סוחר ברירת מחדל:
            </span>

            <div>
              <label className="block text-slate-400 mb-1">עמלת סוחר דיפולטיבית (Margin %):</label>
              <div className="flex items-center gap-2 mb-2">
                <input
                  type="number"
                  step="0.5"
                  min="0"
                  max="50"
                  value={formData.defaultMarginPercent}
                  onChange={(e) => setFormData({ ...formData, defaultMarginPercent: parseFloat(e.target.value) || 0 })}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl py-2 px-3 text-amber-400 font-mono font-bold text-base focus:outline-none"
                />
                <span className="text-amber-400 font-bold font-mono text-sm">%</span>
              </div>

              {/* Presets */}
              <div className="flex items-center justify-between gap-1.5">
                {[0, 5, 8, 10, 12, 15, 20].map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => setFormData({ ...formData, defaultMarginPercent: preset })}
                    className={`flex-1 py-1 text-[11px] font-bold rounded-lg border transition-all ${
                      formData.defaultMarginPercent === preset
                        ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-sm'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {preset}%
                  </button>
                ))}
              </div>
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
