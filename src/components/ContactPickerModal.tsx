import React, { useState } from 'react';
import { User, Phone, Mail, Search, X, Check, BookUser, Plus, Smartphone, History, BookmarkPlus } from 'lucide-react';
import { TradeDeal } from '../types';

export interface ContactItem {
  name: string;
  phone: string;
  email?: string;
  notes?: string;
  source?: 'device' | 'history' | 'saved' | 'demo';
}

interface ContactPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  history: TradeDeal[];
  onSelectContact: (contact: { name: string; phone: string; email?: string; notes?: string }) => void;
}

// Sample address book contacts for easy testing/demo
const DEMO_CONTACTS: ContactItem[] = [
  { name: 'דוד כהן', phone: '050-1234567', email: 'david.gold@gmail.com', notes: 'לקוח קבוע - חנות תכשיטים', source: 'demo' },
  { name: 'מרדכי לוי', phone: '052-9876543', email: 'moti.levi@jewelry.co.il', notes: 'סוחר זהב - ירושלים', source: 'demo' },
  { name: 'אליאב מזרחי', phone: '054-5551212', email: 'eliav.craft@gmail.com', notes: 'צורף זהב - תל אביב', source: 'demo' },
  { name: 'שמואל אברהם', phone: '053-4443322', email: 'shmulik.coins@gmail.com', notes: 'אספן מטבעות זהב', source: 'demo' },
  { name: 'רחל גולדברג', phone: '058-7778899', email: 'rachel.g@walla.co.il', notes: 'קלאסית - תכשיטי ירושה', source: 'demo' },
];

export const ContactPickerModal: React.FC<ContactPickerModalProps> = ({
  isOpen,
  onClose,
  history,
  onSelectContact,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [newName, setNewName] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newNotes, setNewNotes] = useState('');
  const [savedContacts, setSavedContacts] = useState<ContactItem[]>(() => {
    try {
      const saved = localStorage.getItem('goldtrade_address_book');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  if (!isOpen) return null;

  // Extract unique contacts from history
  const historyContactsMap = new Map<string, ContactItem>();
  history.forEach((deal) => {
    if (deal.clientName && deal.clientName !== 'לקוח מזומן בשטח') {
      const key = (deal.clientName + '_' + deal.clientPhone).toLowerCase();
      if (!historyContactsMap.has(key)) {
        historyContactsMap.set(key, {
          name: deal.clientName,
          phone: deal.clientPhone || '',
          email: deal.clientEmail || '',
          notes: deal.clientNotes || '',
          source: 'history',
        });
      }
    }
  });

  const historyContacts = Array.from(historyContactsMap.values());

  // Merge: Saved contacts + History contacts + Demo contacts
  const allContacts: ContactItem[] = [...savedContacts];
  historyContacts.forEach((h) => {
    if (!allContacts.some((c) => c.phone === h.phone && c.name === h.name)) {
      allContacts.push(h);
    }
  });
  DEMO_CONTACTS.forEach((demo) => {
    if (!allContacts.some((c) => c.phone === demo.phone || c.name === demo.name)) {
      allContacts.push(demo);
    }
  });

  const filteredContacts = allContacts.filter(
    (c) =>
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.phone.includes(searchTerm) ||
      (c.email && c.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (c.notes && c.notes.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Native Device Contacts Picker (Available on Chrome Android / HTTPS)
  const isNativeSupported = typeof navigator !== 'undefined' && 'contacts' in navigator && 'select' in (navigator as any).contacts;

  const handlePickNative = async () => {
    if (isNativeSupported) {
      try {
        const props = ['name', 'tel', 'email'];
        const contacts = await (navigator as any).contacts.select(props, { multiple: false });
        if (contacts && contacts.length > 0) {
          const picked = contacts[0];
          const name = picked.name?.[0] || '';
          const phone = picked.tel?.[0] || '';
          const email = picked.email?.[0] || '';
          if (name || phone || email) {
            onSelectContact({ name, phone, email, notes: 'יובא מאנשי הקשר במכשיר' });
            onClose();
          }
        }
      } catch (e) {
        console.warn('Native contact picker cancelled or failed:', e);
      }
    }
  };

  const handleSaveNewContact = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() && !newPhone.trim()) return;

    const contact: ContactItem = {
      name: newName.trim() || 'לקוח חדש',
      phone: newPhone.trim(),
      email: newEmail.trim(),
      notes: newNotes.trim(),
      source: 'saved',
    };

    const updated = [contact, ...savedContacts];
    setSavedContacts(updated);
    try {
      localStorage.setItem('goldtrade_address_book', JSON.stringify(updated));
    } catch (err) {
      console.warn('Failed to save to address book:', err);
    }

    onSelectContact(contact);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-sm animate-fade-in dir-rtl">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <BookUser className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-100">ספר אנשי קשר ולקוחות</h3>
              <p className="text-[11px] text-slate-400">בחר מתוך המכשיר, היסטוריית עסקאות או הוסף איש קשר</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Action Buttons: Native Device Picker & Add New */}
        <div className="p-3 bg-slate-900/90 border-b border-slate-800 space-y-2">
          <div className="grid grid-cols-2 gap-2">
            {isNativeSupported ? (
              <button
                type="button"
                onClick={handlePickNative}
                className="py-2 px-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 text-xs font-black rounded-xl flex items-center justify-center gap-1.5 shadow-md shadow-amber-500/10 transition-all active:scale-95"
              >
                <Smartphone className="w-3.5 h-3.5" />
                <span>אנשי קשר בסלולר</span>
              </button>
            ) : (
              <div className="py-2 px-2.5 bg-slate-800/60 border border-slate-800 text-slate-400 text-[11px] rounded-xl flex items-center justify-center gap-1 text-center">
                <BookUser className="w-3.5 h-3.5 text-amber-400" />
                <span>ספר לקוחות שמור</span>
              </div>
            )}

            <button
              type="button"
              onClick={() => setIsAddingNew(!isAddingNew)}
              className={`py-2 px-2.5 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-all border ${
                isAddingNew
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
              }`}
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{isAddingNew ? 'סגור טופס' : 'איש קשר חדש'}</span>
            </button>
          </div>

          {/* Quick Add Form */}
          {isAddingNew && (
            <form onSubmit={handleSaveNewContact} className="p-3 bg-slate-950/90 border border-amber-500/30 rounded-xl space-y-2 animate-fade-in text-xs">
              <h4 className="font-bold text-amber-300 flex items-center gap-1 text-xs">
                <BookmarkPlus className="w-3.5 h-3.5" />
                <span>שמור לקוח חדש לספר הכתובות:</span>
              </h4>
              <input
                type="text"
                placeholder="שם הלקוח / חברה *"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                required
                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500 text-xs"
              />
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="tel"
                  placeholder="טלפון (לוואטסאפ) *"
                  value={newPhone}
                  onChange={(e) => setNewPhone(e.target.value)}
                  required
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500 text-xs font-mono dir-ltr text-right"
                />
                <input
                  type="email"
                  placeholder="אימייל (אופציונלי)"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500 text-xs font-mono dir-ltr text-right"
                />
              </div>
              <input
                type="text"
                placeholder="הערות (למשל: ת.ז / סוחר / פרטי)"
                value={newNotes}
                onChange={(e) => setNewNotes(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500 text-xs"
              />
              <button
                type="submit"
                className="w-full py-2 bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-bold rounded-lg hover:from-amber-400 hover:to-amber-500 transition-all text-xs"
              >
                שמור ובחר לקוח זה
              </button>
            </form>
          )}

          {/* Search Input */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-500 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="חפש לפי שם, טלפון, אימייל או הערה..."
              className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl py-2 pr-9 pl-3 text-xs text-slate-100 placeholder-slate-500 focus:outline-none"
            />
          </div>
        </div>

        {/* Contacts List */}
        <div className="p-3 overflow-y-auto space-y-2 flex-1">
          {filteredContacts.length === 0 ? (
            <div className="text-center py-8 text-slate-500 text-xs">
              לא נמצאו אנשי קשר התואמים לחיפוש
            </div>
          ) : (
            filteredContacts.map((contact, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  onSelectContact(contact);
                  onClose();
                }}
                className="w-full text-right p-3 rounded-xl bg-slate-950/60 hover:bg-slate-800/80 border border-slate-800/80 hover:border-amber-500/40 transition-all flex items-center justify-between group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-slate-800 group-hover:bg-amber-500/20 text-slate-300 group-hover:text-amber-300 font-bold text-xs flex items-center justify-center border border-slate-700 shrink-0">
                    {contact.name ? contact.name.charAt(0) : <User className="w-4 h-4" />}
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <h4 className="text-xs font-bold text-slate-100 group-hover:text-amber-300 transition-colors">
                        {contact.name || 'לקוח ללא שם'}
                      </h4>
                      {contact.source === 'history' && (
                        <span className="text-[9px] bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded flex items-center gap-0.5">
                          <History className="w-2.5 h-2.5" />
                          <span>מעסקאות</span>
                        </span>
                      )}
                      {contact.source === 'saved' && (
                        <span className="text-[9px] bg-amber-500/20 text-amber-300 px-1.5 py-0.5 rounded">
                          שמור
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-3 text-[11px] text-slate-400 mt-0.5">
                      <span className="font-mono dir-ltr">{contact.phone}</span>
                      {contact.email && (
                        <span className="font-mono dir-ltr text-slate-400/90 flex items-center gap-0.5">
                          <Mail className="w-3 h-3 text-amber-400/70 inline" />
                          <span>{contact.email}</span>
                        </span>
                      )}
                    </div>
                    {contact.notes && <p className="text-[10px] text-amber-500/80 mt-0.5">{contact.notes}</p>}
                  </div>
                </div>

                <div className="p-1.5 rounded-lg bg-slate-800 text-slate-400 group-hover:bg-amber-500 group-hover:text-slate-950 transition-all">
                  <Plus className="w-4 h-4" />
                </div>
              </button>
            ))
          )}
        </div>

        <div className="p-3 bg-slate-950 border-t border-slate-800 text-center">
          <button
            onClick={onClose}
            className="text-xs text-slate-400 hover:text-slate-200"
          >
            סגור
          </button>
        </div>
      </div>
    </div>
  );
};
