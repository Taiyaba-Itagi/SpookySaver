import React, { useState } from 'react';
import { X, Sparkles, Plus } from 'lucide-react';
import { SavingsGoal } from '../types';
import { sounds } from '../utils/audio';

interface DepositGoalModalProps {
  isOpen: boolean;
  onClose: () => void;
  goal: SavingsGoal | null;
  currency: string;
  onDeposit: (goalId: string, amount: number) => void;
}

export const DepositGoalModal: React.FC<DepositGoalModalProps> = ({
  isOpen,
  onClose,
  goal,
  currency,
  onDeposit,
}) => {
  const [amount, setAmount] = useState('');

  if (!isOpen || !goal) return null;

  const remaining = Math.max(0, goal.targetAmount - goal.currentAmount);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = parseFloat(amount);
    if (isNaN(parsed) || parsed <= 0) return;

    onDeposit(goal.id, parsed);
    sounds.playPumpkinCoin();
    setAmount('');
    onClose();
  };

  const handleQuickAdd = (val: number) => {
    const current = parseFloat(amount) || 0;
    setAmount((current + val).toString());
    sounds.playPumpkinCoin();
  };

  const handleQuickSet = (val: number) => {
    setAmount(val.toString());
    sounds.playPumpkinCoin();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/80 backdrop-blur-sm p-0 sm:p-4 animate-fadeIn">
      <div 
        className="w-full max-w-md rounded-t-3xl sm:rounded-2xl bg-[#140f26] border border-orange-500/40 shadow-2xl shadow-black overflow-hidden flex flex-col max-h-[90vh]"
        role="dialog"
        aria-modal="true"
      >
        {/* Mobile Drag Handle */}
        <div className="w-12 h-1.5 bg-slate-600/80 rounded-full mx-auto mt-2.5 mb-1 sm:hidden shrink-0" />

        {/* Header */}
        <div className="flex items-center justify-between px-5 sm:px-6 py-3.5 border-b border-purple-900/40 bg-purple-950/30 shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-xl">💰</span>
            <h3 className="text-base font-semibold text-slate-100 font-cinzel">
              Feed the Pumpkin Stash
            </h3>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-200 hover:bg-purple-900/40 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 sm:p-6 overflow-y-auto space-y-4">
          <div className="p-3.5 rounded-xl bg-orange-950/20 border border-orange-500/20">
            <h4 className="text-sm font-semibold text-orange-200">{goal.title}</h4>
            <div className="flex items-center justify-between mt-1 text-xs text-slate-300">
              <span>Saved: <strong className="font-mono text-emerald-300">{currency}{goal.currentAmount.toLocaleString()}</strong></span>
              <span>Target: <strong className="font-mono text-slate-200">{currency}{goal.targetAmount.toLocaleString()}</strong></span>
              <span>Needs: <strong className="font-mono text-amber-300">{currency}{remaining.toLocaleString()}</strong></span>
            </div>
          </div>

          {/* Amount input for mobile phone */}
          <div className="p-3.5 rounded-2xl bg-[#0e0a1b] border border-orange-500/30 space-y-2">
            <label className="block text-xs font-semibold uppercase tracking-wider text-orange-300">
              Deposit Amount ({currency})
            </label>
            <div className="relative flex items-center">
              <span className="text-2xl sm:text-3xl font-bold font-mono text-slate-400 pl-2 mr-2 select-none">
                {currency}
              </span>
              <input
                type="number"
                inputMode="decimal"
                step="any"
                min="1"
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
                  className="px-2 py-1 text-xs text-slate-500 hover:text-slate-300 transition-colors shrink-0"
                >
                  Clear
                </button>
              )}
            </div>

            {/* Quick Amount suggestions */}
            <div className="pt-1 flex flex-wrap items-center gap-1.5">
              <span className="text-[10px] text-slate-500 uppercase tracking-tight mr-1">Tap to Add:</span>
              {[50, 100, 250, 500, 1000].map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => handleQuickAdd(preset)}
                  className="min-h-[36px] px-2.5 py-1.5 rounded-lg bg-[#18122c] border border-purple-900/50 hover:border-orange-500/60 text-xs font-mono tabular-nums text-slate-300 hover:text-orange-300 transition-all cursor-pointer active:scale-95"
                >
                  +{currency}{preset}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-1.5 p-3 rounded-xl bg-orange-950/30 border border-orange-500/20 text-xs text-orange-300">
            <Sparkles className="w-3.5 h-3.5 text-orange-400 shrink-0" />
            <span>Depositing directly earns <strong className="text-orange-200">+50 Pumpkin Points 🎃</strong> and grows your vault!</span>
          </div>

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
              <span>Confirm {amount ? `${currency}${amount}` : 'Deposit'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
