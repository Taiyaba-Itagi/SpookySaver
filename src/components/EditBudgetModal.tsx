import React, { useState } from 'react';
import { X, Sliders, Check } from 'lucide-react';
import { BudgetConfig } from '../types';

interface EditBudgetModalProps {
  isOpen: boolean;
  onClose: () => void;
  budgetConfig: BudgetConfig;
  onSaveBudget: (newConfig: BudgetConfig) => void;
}

export const EditBudgetModal: React.FC<EditBudgetModalProps> = ({
  isOpen,
  onClose,
  budgetConfig,
  onSaveBudget,
}) => {
  const [totalBudget, setTotalBudget] = useState(budgetConfig.totalBudget.toString());
  const [period, setPeriod] = useState(budgetConfig.period);
  const [alertThreshold, setAlertThreshold] = useState(budgetConfig.alertThreshold.toString());

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedBudget = parseFloat(totalBudget);
    const parsedThreshold = parseInt(alertThreshold, 10);
    if (isNaN(parsedBudget) || parsedBudget <= 0) return;

    onSaveBudget({
      ...budgetConfig,
      totalBudget: parsedBudget,
      period,
      alertThreshold: isNaN(parsedThreshold) ? 80 : parsedThreshold,
    });
    onClose();
  };

  const handleQuickBudgetPreset = (val: number) => {
    setTotalBudget(val.toString());
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/80 backdrop-blur-sm p-0 sm:p-4 animate-fadeIn">
      <div 
        className="w-full max-w-md rounded-t-3xl sm:rounded-2xl bg-[#140f26] border border-purple-900/60 shadow-2xl shadow-black overflow-hidden flex flex-col max-h-[90vh]"
        role="dialog"
        aria-modal="true"
      >
        {/* Mobile Drag Handle */}
        <div className="w-12 h-1.5 bg-slate-600/80 rounded-full mx-auto mt-2.5 mb-1 sm:hidden shrink-0" />

        <div className="flex items-center justify-between px-5 sm:px-6 py-3.5 border-b border-purple-900/40 bg-purple-950/30 shrink-0">
          <div className="flex items-center gap-2">
            <Sliders className="w-5 h-5 text-orange-400" />
            <h3 className="text-base font-semibold text-slate-100 font-cinzel">
              Configure Smart Budget Limit
            </h3>
          </div>
          <button
            onClick={onClose}
            className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-200 hover:bg-purple-900/40 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 sm:p-6 overflow-y-auto space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Budget Cadence
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(['daily', 'weekly', 'monthly'] as const).map((p) => (
                <button
                  type="button"
                  key={p}
                  onClick={() => setPeriod(p)}
                  className={`min-h-[44px] py-2 text-xs font-semibold rounded-xl capitalize border transition-all cursor-pointer active:scale-98 ${
                    period === p
                      ? 'bg-orange-950/50 border-orange-500 text-orange-300 font-bold'
                      : 'bg-[#0e0a1b] border-purple-950/60 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          {/* Amount input for phone */}
          <div className="p-3.5 rounded-2xl bg-[#0e0a1b] border border-purple-900/50 space-y-2">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300">
              Limit Amount ({budgetConfig.currency})
            </label>
            <div className="relative flex items-center">
              <span className="text-2xl font-bold font-mono text-slate-400 pl-2 mr-2 select-none">
                {budgetConfig.currency}
              </span>
              <input
                type="number"
                inputMode="decimal"
                step="any"
                min="10"
                required
                value={totalBudget}
                onChange={(e) => setTotalBudget(e.target.value)}
                className="w-full text-2xl font-bold font-mono tabular-nums text-slate-100 bg-transparent border-0 focus:outline-none"
              />
            </div>

            {/* Quick Presets for phones */}
            <div className="pt-1 flex flex-wrap items-center gap-1.5">
              <span className="text-[10px] text-slate-500 uppercase tracking-tight mr-1">Presets:</span>
              {[500, 1000, 2500, 5000, 15000].map((presetVal) => (
                <button
                  key={presetVal}
                  type="button"
                  onClick={() => handleQuickBudgetPreset(presetVal)}
                  className="min-h-[36px] px-2.5 py-1 rounded-lg bg-[#18122c] border border-purple-900/60 hover:border-orange-500/60 text-xs font-mono text-slate-300 hover:text-orange-300 transition-all cursor-pointer"
                >
                  {budgetConfig.currency}{presetVal.toLocaleString()}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Witching Hour Alert Threshold ({alertThreshold}%)
            </label>
            <input
              type="range"
              min="50"
              max="95"
              step="5"
              value={alertThreshold}
              onChange={(e) => setAlertThreshold(e.target.value)}
              className="w-full accent-orange-500 cursor-pointer h-8"
            />
            <div className="flex justify-between text-[11px] text-slate-400 mt-0.5">
              <span>50% (Early Alert)</span>
              <span>75% (Balanced)</span>
              <span>95% (Extreme)</span>
            </div>
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
              <Check className="w-4 h-4" />
              <span>Update Budget Limit</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
