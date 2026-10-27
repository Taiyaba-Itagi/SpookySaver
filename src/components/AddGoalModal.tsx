import React, { useState } from 'react';
import { X, Target, Plus } from 'lucide-react';
import { SavingsGoal } from '../types';
import { sounds } from '../utils/audio';

interface AddGoalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddGoal: (goal: Omit<SavingsGoal, 'id' | 'currentAmount'>) => void;
  currency: string;
}

export const AddGoalModal: React.FC<AddGoalModalProps> = ({
  isOpen,
  onClose,
  onAddGoal,
  currency,
}) => {
  const [title, setTitle] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [category, setCategory] = useState<'tech' | 'college' | 'travel' | 'emergency' | 'custom'>('tech');
  const [deadline, setDeadline] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedTarget = parseFloat(targetAmount);
    if (!title.trim() || isNaN(parsedTarget) || parsedTarget <= 0) return;

    onAddGoal({
      title: title.trim(),
      targetAmount: parsedTarget,
      category,
      deadline: deadline || undefined,
    });

    sounds.playPumpkinCoin();
    setTitle('');
    setTargetAmount('');
    setDeadline('');
    onClose();
  };

  const handleQuickTarget = (val: number) => {
    setTargetAmount(val.toString());
    sounds.playPumpkinCoin();
  };

  const goalTypes = [
    { id: 'tech', label: 'Laptop / Tech', icon: '💻' },
    { id: 'college', label: 'College / Exam', icon: '🎓' },
    { id: 'travel', label: 'Spooky Trip', icon: '✈️' },
    { id: 'emergency', label: 'Emergency Fund', icon: '🛡️' },
    { id: 'custom', label: 'Custom Dream', icon: '✨' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/80 backdrop-blur-sm p-0 sm:p-4 animate-fadeIn">
      <div 
        className="w-full max-w-md rounded-t-3xl sm:rounded-2xl bg-[#140f26] border border-purple-900/60 shadow-2xl shadow-black overflow-hidden flex flex-col max-h-[92vh]"
        role="dialog"
        aria-modal="true"
      >
        {/* Mobile Drag Handle */}
        <div className="w-12 h-1.5 bg-slate-600/80 rounded-full mx-auto mt-2.5 mb-1 sm:hidden shrink-0" />

        <div className="flex items-center justify-between px-5 sm:px-6 py-3.5 border-b border-purple-900/40 bg-purple-950/30 shrink-0">
          <div className="flex items-center gap-2">
            <Target className="w-5 h-5 text-orange-400" />
            <h3 className="text-base font-semibold text-slate-100 font-cinzel">
              Plant New Savings Goal
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
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Goal Name
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Study Laptop, College Semester Fee"
              className="w-full min-h-[44px] px-3.5 py-2.5 rounded-xl bg-[#0e0a1b] border border-purple-900/50 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-orange-500 transition-colors"
            />
          </div>

          {/* Amount input for phone */}
          <div className="p-3.5 rounded-2xl bg-[#0e0a1b] border border-purple-900/50 space-y-2">
            <label className="block text-xs font-semibold uppercase tracking-wider text-orange-300">
              Target Savings ({currency})
            </label>
            <div className="relative flex items-center">
              <span className="text-2xl font-bold font-mono text-slate-400 pl-2 mr-2 select-none">
                {currency}
              </span>
              <input
                type="number"
                inputMode="decimal"
                step="any"
                min="1"
                required
                value={targetAmount}
                onChange={(e) => setTargetAmount(e.target.value)}
                placeholder="2500"
                className="w-full text-2xl font-bold font-mono tabular-nums text-orange-200 bg-transparent border-0 focus:outline-none placeholder-slate-600"
              />
            </div>

            {/* Quick target chips */}
            <div className="pt-1 flex flex-wrap items-center gap-1.5">
              <span className="text-[10px] text-slate-500 uppercase tracking-tight mr-1">Presets:</span>
              {[1000, 2500, 5000, 10000, 25000].map((presetVal) => (
                <button
                  key={presetVal}
                  type="button"
                  onClick={() => handleQuickTarget(presetVal)}
                  className="min-h-[36px] px-2.5 py-1 rounded-lg bg-[#18122c] border border-purple-900/60 hover:border-orange-500/60 text-xs font-mono text-slate-300 hover:text-orange-300 transition-all cursor-pointer active:scale-95"
                >
                  {currency}{presetVal.toLocaleString()}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Category
            </label>
            <div className="grid grid-cols-2 gap-2">
              {goalTypes.map((gt) => (
                <button
                  type="button"
                  key={gt.id}
                  onClick={() => setCategory(gt.id as any)}
                  className={`min-h-[44px] flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium border text-left transition-all cursor-pointer active:scale-98 ${
                    category === gt.id
                      ? 'bg-orange-950/50 border-orange-500/70 text-orange-200'
                      : 'bg-[#0e0a1b] border-purple-950/60 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <span className="text-base">{gt.icon}</span>
                  <span className="truncate">{gt.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Target Deadline (Optional)
            </label>
            <input
              type="date"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
              className="w-full min-h-[44px] px-3.5 py-2 rounded-xl bg-[#0e0a1b] border border-purple-900/50 text-xs text-slate-100 focus:outline-none focus:border-orange-500 transition-colors"
            />
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
              <span>Plant Goal Pumpkin</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
