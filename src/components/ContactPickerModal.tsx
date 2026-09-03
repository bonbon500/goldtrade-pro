import React, { useState } from 'react';
import { User, Phone, Search, X, Check, BookUser, Plus } from 'lucide-react';
import { TradeDeal } from '../types';

interface ContactPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  history: TradeDeal[];
  onSelectContact: (contact: { name: string; phone: string; notes?: string }) => void;
}

// Sample address book contacts for easy testing/demo
const DEMO_CONTACTS = [
  { name: 'דוד כהן', phone: '050-1234567', notes: 'לקוח קבוע - חנות תכשיטים' },
  { name: 'מרדכי לוי', phone: '052-9876543', notes: 'סוחר זהב - ירושלים' },
  { name: 'אליאב מזרחי', phone: '054-5551212', notes: 'צורף זהב - תל אביב' },
  { name: 'שמואל אברהם', phone: '053-4443322', notes: 'אספן מטבעות זהב' },
  { name: 'רחל גולדברג', phone: '058-7778899', notes: 'קלאסית - תכשיטי ירושה' },
];

export const ContactPickerModal: React.FC<ContactPickerModalProps> = ({
  isOpen,
  onClose,
  history,
  onSelectContact,
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  if (!isOpen) return null;

  // Extract unique contacts from history
  const historyContactsMap = new Map<string, { name: string; phone: string; notes?: string }>();
  history.forEach((deal) => {
    if (deal.clientName && deal.clientName !== 'לקוח מזומן בשטח') {
      const key = (deal.clientName + '_' + deal.clientPhone).toLowerCase();
      if (!historyContactsMap.has(key)) {
        historyContactsMap.set(key, {
          name: deal.clientName,
          phone: deal.clientPhone || '',
          notes: deal.clientNotes || '',
        });
      }
    }
  });

  const historyContacts = Array.from(historyContactsMap.values());

  // Merge history contacts with demo contacts (avoiding exact duplicates)
  const allContacts = [...historyContacts];
  DEMO_CONTACTS.forEach((demo) => {
    if (!allContacts.some((c) => c.phone === demo.phone || c.name === demo.name)) {
      allContacts.push(demo);
    }
  });

  const filteredContacts = allContacts.filter(
    (c) =>
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.phone.includes(searchTerm) ||
      (c.notes && c.notes.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handlePickNative = async () => {
    if ('contacts' in navigator && 'select' in (navigator as any).contacts) {
      try {
        const contacts = await (navigator as any).contacts.select(['name', 'tel'], { multiple: false });
        if (contacts && contacts.length > 0) {
          const picked = contacts[0];
          const name = picked.name?.[0] || '';
          const phone = picked.tel?.[0] || '';
          if (name || phone) {
            onSelectContact({ name, phone });
            onClose();
          }
        }
      } catch (e) {
        console.warn('Native contact picker cancelled or not supported:', e);
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in dir-rtl">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl flex flex-col max-h-[85vh]">
        {/* Modal Header */}
        <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <BookUser className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-100">בחירת לקוח מאנשי קשר</h3>
              <p className="text-[11px] text-slate-400">בחר מתוך היסטוריית הלקוחות או אנשי הקשר בסלולר</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search Bar & Native Contact Trigger */}
        <div className="p-3 bg-slate-900/90 border-b border-slate-800 space-y-2">
          {'contacts' in navigator && (
            <button
              onClick={handlePickNative}
              className="w-full py-2 px-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 text-xs font-bold rounded-xl flex items-center justify-center gap-2 shadow-md shadow-amber-500/10 transition-all"
            >
              <Phone className="w-4 h-4" />
              <span>פתח את ספר הטלפונים בסלולר (Device Contacts)</span>
            </button>
          )}

          <div className="relative">
            <Search className="w-4 h-4 text-slate-500 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="חפש לפי שם, טלפון או הערה..."
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
                    <h4 className="text-xs font-bold text-slate-100 group-hover:text-amber-300 transition-colors">
                      {contact.name || 'לקוח ללא שם'}
                    </h4>
                    <p className="text-[11px] text-slate-400 font-mono dir-ltr text-right">{contact.phone}</p>
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
