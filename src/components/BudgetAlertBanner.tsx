import React from 'react';
import { AlertTriangle, Flame, ShieldCheck, ArrowRight } from 'lucide-react';

interface BudgetAlertBannerProps {
  totalBudget: number;
  totalSpent: number;
  currency: string;
  period: string;
  alertThreshold: number;
  onConsultMentor: () => void;
}

export const BudgetAlertBanner: React.FC<BudgetAlertBannerProps> = ({
  totalBudget,
  totalSpent,
  currency,
  period,
  alertThreshold,
  onConsultMentor,
}) => {
  const percentUsed = totalBudget > 0 ? Math.round((totalSpent / totalBudget) * 100) : 0;
  const remaining = Math.max(0, totalBudget - totalSpent);

  if (percentUsed >= 90) {
    return (
      <div className="relative overflow-hidden rounded-xl border border-rose-500/40 bg-gradient-to-r from-rose-950/60 via-purple-950/60 to-rose-950/60 p-4 shadow-lg shadow-rose-950/30">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-rose-900/60 border border-rose-500/50 flex items-center justify-center text-rose-300 shrink-0">
              <AlertTriangle className="w-5 h-5 text-rose-400 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs uppercase font-bold tracking-wider text-rose-400">
                  Full Moon Nightmare Alert · {percentUsed}% of Budget Exhausted
                </span>
              </div>
              <p className="text-sm text-slate-200 mt-0.5">
                Beware! You have spent <span className="font-semibold text-rose-300 font-mono tabular-nums">{currency}{totalSpent.toLocaleString()}</span> of your <span className="font-semibold font-mono tabular-nums">{currency}{totalBudget.toLocaleString()}</span> {period} limit. Only <span className="font-semibold text-emerald-300 font-mono tabular-nums">{currency}{remaining.toLocaleString()}</span> remains in safe vault reserve!
              </p>
            </div>
          </div>
          <button
            onClick={onConsultMentor}
            className="flex items-center justify-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-500 rounded-lg transition-colors cursor-pointer shrink-0 shadow-sm"
          >
            <span>Summon AI Mentor</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    );
  }

  if (percentUsed >= alertThreshold) {
    return (
      <div className="relative overflow-hidden rounded-xl border border-amber-500/40 bg-gradient-to-r from-amber-950/50 via-purple-950/50 to-orange-950/50 p-4 shadow-md shadow-amber-950/20">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-amber-900/60 border border-amber-500/50 flex items-center justify-center text-amber-300 shrink-0">
              <Flame className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs uppercase font-bold tracking-wider text-amber-400">
                  Witching Hour Warning · {percentUsed}% Approaching Budget Limit
                </span>
              </div>
              <p className="text-sm text-slate-200 mt-0.5">
                You've passed your {alertThreshold}% warning threshold. You have <span className="font-semibold text-amber-300 font-mono tabular-nums">{currency}{remaining.toLocaleString()}</span> left to pace through the rest of this {period}.
              </p>
            </div>
          </div>
          <button
            onClick={onConsultMentor}
            className="flex items-center justify-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-amber-100 bg-amber-600/30 hover:bg-amber-600/50 border border-amber-500/40 rounded-lg transition-colors cursor-pointer shrink-0"
          >
            <span>Triage with AI</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-purple-900/30 bg-[#120e22]/60 p-3.5 flex items-center justify-between gap-3 text-xs text-slate-300">
      <div className="flex items-center gap-2.5">
        <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
        <span>
          <strong className="text-slate-100 font-medium">Safe Graveyard Zone:</strong> Spent <span className="font-mono tabular-nums text-slate-200">{currency}{totalSpent.toLocaleString()}</span> ({percentUsed}%) of {currency}{totalBudget.toLocaleString()} {period} budget. Safe allowance: <span className="text-emerald-400 font-mono tabular-nums font-semibold">{currency}{remaining.toLocaleString()}</span>.
        </span>
      </div>
      <button
        onClick={onConsultMentor}
        className="text-orange-400 hover:text-orange-300 hover:underline cursor-pointer font-medium whitespace-nowrap hidden sm:inline"
      >
        Ask AI Tips →
      </button>
    </div>
  );
};
