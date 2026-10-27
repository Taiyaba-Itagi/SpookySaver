import React, { useState } from 'react';
import { X, Sparkles, Plus, RotateCcw } from 'lucide-react';
import { Expense, ExpenseCategory, ExpenseType } from '../types';
import { sounds } from '../utils/audio';

interface AddExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddExpense: (expense: Omit<Expense, 'id'>) => void;
  currency: string;
}

export const AddExpenseModal: React.FC<AddExpenseModalProps> = ({
  isOpen,
  onClose,
  onAddExpense,
  currency,
}) => {
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState<ExpenseCategory>('food');
  const [type, setType] = useState<ExpenseType>('need');
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedAmount = parseFloat(amount);
    if (!title.trim() || isNaN(parsedAmount) || parsedAmount <= 0) return;

    onAddExpense({
      title: title.trim(),
      amount: parsedAmount,
      category,
      type,
      date,
      notes: notes.trim() || undefined,
    });

    sounds.playPumpkinCoin();
    // Reset form
    setTitle('');
    setAmount('');
    setNotes('');
    onClose();
  };

  const handleAddAmountChip = (chipVal: number) => {
    const current = parseFloat(amount) || 0;
    const next = current + chipVal;
    setAmount(next.toString());
    sounds.playPumpkinCoin();
  };

  const handleSetAmountChip = (chipVal: number) => {
    setAmount(chipVal.toString());
    sounds.playPumpkinCoin();
  };

  const categories: { id: ExpenseCategory; label: string; icon: string }[] = [
    { id: 'food', label: 'Food & Treats', icon: '🍲' },
    { id: 'transport', label: 'Commute', icon: '🚆' },
    { id: 'education', label: 'Study & Books', icon: '📚' },
    { id: 'entertainment', label: 'Entertainment', icon: '🎭' },
    { id: 'shopping', label: 'Retail & Gear', icon: '🛍️' },
    { id: 'utilities', label: 'Crypt & Bills', icon: '⚡' },
    { id: 'other', label: 'Other Phantoms', icon: '🔮' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/80 backdrop-blur-sm p-0 sm:p-4 animate-fadeIn">
      <div 
        className="w-full max-w-lg rounded-t-3xl sm:rounded-2xl bg-[#140f26] border border-purple-900/60 shadow-2xl shadow-black overflow-hidden max-h-[92vh] flex flex-col"
        role="dialog"
        aria-modal="true"
        aria-labelledby="add-expense-title"
      >
        {/* Mobile Drag Handle Affordance for iOS and Android */}
        <div className="w-12 h-1.5 bg-slate-600/80 rounded-full mx-auto mt-2.5 mb-1 sm:hidden shrink-0" />

        {/* Header */}
        <div className="flex items-center justify-between px-5 sm:px-6 py-3.5 border-b border-purple-900/40 bg-purple-950/30 shrink-0">
          <div className="flex items-center gap-2.5">
            <span className="text-xl">🎃</span>
            <div>
              <h3 id="add-expense-title" className="text-base font-semibold text-slate-100 font-cinzel">
                Record New Expense
              </h3>
              <p className="text-[11px] text-slate-400 sm:hidden">
                Add amount & earn +10 🎃 points
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close modal"
            className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-200 hover:bg-purple-900/40 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 overflow-y-auto space-y-4 flex-1">
          
          {/* Prominent Amount Entry for Mobile Phones */}
          <div className="p-3.5 rounded-2xl bg-[#0e0a1b] border border-orange-500/30 space-y-2.5">
            <label className="block text-xs font-semibold uppercase tracking-wider text-orange-300">
              Enter Amount ({currency})
            </label>
            
            <div className="relative flex items-center">
              <span className="text-2xl sm:text-3xl font-bold font-mono text-slate-400 pl-2 mr-2 select-none">
                {currency}
              </span>
              <input
                type="number"
                inputMode="decimal"
                step="any"
                min="0.01"
                required
                autoFocus
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                className="w-full text-2xl sm:text-3xl font-bold font-mono tabular-nums text-orange-200 bg-transparent border-0 focus:outline-none placeholder-slate-600"
              />
              {amount && (
                <button
                  type="button"
                  onClick={() => setAmount('')}
                  title="Clear amount"
                  className="px-2 py-1 text-xs text-slate-500 hover:text-slate-300 transition-colors shrink-0"
                >
                  Clear
                </button>
              )}
            </div>

            {/* Quick Amount Chips (One-Tap Add on Mobile) */}
            <div className="pt-1 flex flex-wrap items-center gap-1.5">
              <span className="text-[10px] text-slate-500 uppercase tracking-tight mr-1">Quick Add:</span>
              {[50, 100, 200, 500, 1000].map((val) => (
                <button
                  key={val}
                  type="button"
                  onClick={() => handleAddAmountChip(val)}
                  className="min-h-[36px] px-2.5 py-1.5 rounded-lg bg-[#18122c] hover:bg-orange-950/60 border border-purple-900/60 hover:border-orange-500/60 text-xs font-mono font-medium text-slate-300 hover:text-orange-300 transition-all cursor-pointer active:scale-95"
                >
                  +{currency}{val}
                </button>
              ))}
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Expense Description
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Pumpkin Spice Latte, Metro Pass, Study Book"
              className="w-full min-h-[44px] px-3.5 py-2.5 rounded-xl bg-[#0e0a1b] border border-purple-900/50 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-orange-500 transition-colors"
            />
          </div>

          {/* Category Selector with Thumb-Friendly Hitboxes */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Category
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {categories.map((cat) => (
                <button
                  type="button"
                  key={cat.id}
                  onClick={() => setCategory(cat.id)}
                  className={`min-h-[44px] flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium text-left border transition-all cursor-pointer active:scale-98 ${
                    category === cat.id
                      ? 'bg-orange-950/50 border-orange-500/70 text-orange-200'
                      : 'bg-[#0e0a1b] border-purple-950/60 text-slate-400 hover:text-slate-200 hover:border-purple-800'
                  }`}
                >
                  <span className="text-base">{cat.icon}</span>
                  <span className="truncate">{cat.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Expense Classification */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Classification
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setType('need')}
                className={`min-h-[44px] py-2 px-2.5 rounded-xl text-xs font-medium border text-center transition-all cursor-pointer active:scale-98 flex items-center justify-center gap-1 ${
                  type === 'need'
                    ? 'bg-emerald-950/60 border-emerald-500 text-emerald-200 font-semibold'
                    : 'bg-[#0e0a1b] border-purple-950/60 text-slate-400 hover:text-slate-200'
                }`}
              >
                <span>🛡️</span>
                <span>Need</span>
              </button>
              <button
                type="button"
                onClick={() => setType('want')}
                className={`min-h-[44px] py-2 px-2.5 rounded-xl text-xs font-medium border text-center transition-all cursor-pointer active:scale-98 flex items-center justify-center gap-1 ${
                  type === 'want'
                    ? 'bg-amber-950/60 border-amber-500 text-amber-200 font-semibold'
                    : 'bg-[#0e0a1b] border-purple-950/60 text-slate-400 hover:text-slate-200'
                }`}
              >
                <span>🕯️</span>
                <span>Want</span>
              </button>
              <button
                type="button"
                onClick={() => setType('spooky-splurge')}
                className={`min-h-[44px] py-2 px-2.5 rounded-xl text-xs font-medium border text-center transition-all cursor-pointer active:scale-98 flex items-center justify-center gap-1 ${
                  type === 'spooky-splurge'
                    ? 'bg-rose-950/60 border-rose-500 text-rose-200 font-semibold'
                    : 'bg-[#0e0a1b] border-purple-950/60 text-slate-400 hover:text-slate-200'
                }`}
              >
                <span>👻</span>
                <span>Splurge</span>
              </button>
            </div>
          </div>

          {/* Date & Notes (Collapsible or Clean on Mobile) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Date
              </label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full min-h-[44px] px-3 py-2 rounded-xl bg-[#0e0a1b] border border-purple-900/50 text-xs text-slate-100 focus:outline-none focus:border-orange-500 transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Notes (Optional)
              </label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="e.g. Split with classmate"
                className="w-full min-h-[44px] px-3 py-2 rounded-xl bg-[#0e0a1b] border border-purple-900/50 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-orange-500 transition-colors"
              />
            </div>
          </div>

          {/* Reward reminder */}
          <div className="flex items-center gap-1.5 p-3 rounded-xl bg-orange-950/30 border border-orange-500/20 text-xs text-orange-300">
            <Sparkles className="w-3.5 h-3.5 text-orange-400 shrink-0" />
            <span>Logging this expense earns <strong className="text-orange-200">+10 Pumpkin Points 🎃</strong></span>
          </div>

          {/* Footer Actions (Full-Width Primary Button for Mobile Thumbs) */}
          <div className="pt-2 pb-safe flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="min-h-[48px] px-4 rounded-xl text-xs font-semibold text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 min-h-[48px] rounded-xl text-sm font-bold text-white bg-gradient-to-r from-orange-600 via-amber-600 to-orange-500 hover:from-orange-500 hover:to-amber-500 shadow-lg shadow-orange-950/60 transition-all cursor-pointer flex items-center justify-center gap-2 active:scale-[0.98]"
            >
              <Plus className="w-4 h-4" />
              <span>Log {amount ? `${currency}${amount}` : 'Expense'}</span>
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};
