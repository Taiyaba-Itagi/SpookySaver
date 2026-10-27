import React from 'react';
import { Target, Plus, Sparkles, CheckCircle2, Calendar, Trophy, Laptop, Compass, Shield, HeartHandshake } from 'lucide-react';
import { SavingsGoal } from '../types';
import { sounds } from '../utils/audio';

interface SavingsGoalsViewProps {
  goals: SavingsGoal[];
  currency: string;
  onOpenAddGoal: () => void;
  onOpenDeposit: (goal: SavingsGoal) => void;
  onDeleteGoal: (goalId: string) => void;
}

export const SavingsGoalsView: React.FC<SavingsGoalsViewProps> = ({
  goals,
  currency,
  onOpenAddGoal,
  onOpenDeposit,
  onDeleteGoal,
}) => {
  const totalSaved = goals.reduce((a, b) => a + b.currentAmount, 0);
  const totalTarget = goals.reduce((a, b) => a + b.targetAmount, 0);
  const overallPercent = totalTarget > 0 ? Math.round((totalSaved / totalTarget) * 100) : 0;

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'tech': return <Laptop className="w-5 h-5 text-cyan-400" />;
      case 'travel': return <Compass className="w-5 h-5 text-amber-400" />;
      case 'emergency': return <Shield className="w-5 h-5 text-emerald-400" />;
      case 'college': return <Trophy className="w-5 h-5 text-purple-400" />;
      default: return <Target className="w-5 h-5 text-orange-400" />;
    }
  };

  const getPumpkinStage = (percent: number) => {
    if (percent >= 100) return { title: 'Golden Jack-o-Lantern Harvest 🏆', icon: '👑', desc: 'Goal fully achieved!' };
    if (percent >= 75) return { title: 'Radiant Fire Pumpkin 🔥', icon: '🎃', desc: 'Nearing the final harvest!' };
    if (percent >= 40) return { title: 'Carved Jack-o-Lantern 🕯️', icon: '🎃', desc: 'Sturdy glowing progress' };
    return { title: 'Sprouting Autumn Seedling 🌱', icon: '🌰', desc: 'The journey begins' };
  };

  return (
    <div className="space-y-8">
      
      {/* Title & Action Strip */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-100 font-cinzel">
            Savings Cauldron & Pumpkin Vaults
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Save towards a laptop, college fees, travel, or an emergency fund and harvest rewards
          </p>
        </div>

        <button
          onClick={onOpenAddGoal}
          className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 rounded-lg shadow-md transition-all cursor-pointer whitespace-nowrap"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>New Savings Goal</span>
        </button>
      </div>

      {/* Aggregate Vault Summary Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-[#17112b] via-[#201538] to-[#17112b] border border-orange-500/30 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-orange-950/60 border border-orange-500/40 flex items-center justify-center text-3xl shadow-lg shadow-orange-950/50 shrink-0">
            🎃
          </div>
          <div>
            <div className="text-xs uppercase font-bold tracking-wider text-orange-400">Total Vault Progress</div>
            <div className="text-2xl font-bold font-mono tabular-nums text-slate-100 mt-0.5">
              {currency}{totalSaved.toLocaleString()} <span className="text-sm font-normal text-slate-400">/ {currency}{totalTarget.toLocaleString()}</span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              You are <span className="font-semibold text-orange-300 font-mono tabular-nums">{overallPercent}%</span> towards financing all your active ambitions.
            </p>
          </div>
        </div>

        <div className="w-full md:w-64 space-y-2">
          <div className="flex justify-between text-xs text-slate-300">
            <span>Overall Cauldron</span>
            <span className="font-mono text-orange-400 font-bold">{overallPercent}%</span>
          </div>
          <div className="w-full h-3 bg-[#0d0918] rounded-full overflow-hidden border border-purple-950">
            <div
              className="h-full bg-gradient-to-r from-orange-600 via-amber-500 to-yellow-400 rounded-full transition-all duration-500"
              style={{ width: `${Math.min(100, overallPercent)}%` }}
            />
          </div>
        </div>
      </div>

      {/* Goals Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {goals.map((goal) => {
          const percent = goal.targetAmount > 0 ? Math.round((goal.currentAmount / goal.targetAmount) * 100) : 0;
          const remaining = Math.max(0, goal.targetAmount - goal.currentAmount);
          const stage = getPumpkinStage(percent);
          const isComplete = percent >= 100;

          return (
            <div
              key={goal.id}
              className={`rounded-2xl bg-[#130f24] border transition-all flex flex-col justify-between overflow-hidden shadow-lg ${
                isComplete 
                  ? 'border-amber-500/60 shadow-amber-950/30 ring-1 ring-amber-500/30' 
                  : 'border-purple-900/50 hover:border-purple-800'
              }`}
            >
              <div className="p-6 space-y-4">
                
                {/* Header */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[#1d1633] border border-purple-900/60 flex items-center justify-center shrink-0">
                      {getCategoryIcon(goal.category)}
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-100 line-clamp-1">{goal.title}</h3>
                      <div className="text-[11px] text-slate-400 capitalize mt-0.5">
                        {goal.category} Goal
                      </div>
                    </div>
                  </div>
                  <span className="text-xl shrink-0" title={stage.title}>{stage.icon}</span>
                </div>

                {/* Progress bar */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400">Vault Progress</span>
                    <span className="font-mono tabular-nums font-bold text-orange-400">{percent}%</span>
                  </div>
                  <div className="w-full h-2.5 bg-[#0e0a1b] rounded-full overflow-hidden border border-purple-950">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        isComplete
                          ? 'bg-gradient-to-r from-emerald-500 to-amber-400'
                          : 'bg-gradient-to-r from-orange-600 via-amber-500 to-yellow-400'
                      }`}
                      style={{ width: `${Math.min(100, percent)}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-xs font-mono tabular-nums pt-0.5">
                    <span className="font-semibold text-emerald-400">{currency}{goal.currentAmount.toLocaleString()}</span>
                    <span className="text-slate-400">Target: {currency}{goal.targetAmount.toLocaleString()}</span>
                  </div>
                </div>

                {/* Milestone Badge info */}
                <div className="p-2.5 rounded-lg bg-[#0e0a1b] border border-purple-950/60 flex items-center justify-between text-xs text-slate-300">
                  <span className="truncate">{stage.title}</span>
                  <span className="text-slate-400 font-mono text-[11px] shrink-0">
                    {isComplete ? 'Harvested' : `Needs ${currency}${remaining.toLocaleString()}`}
                  </span>
                </div>

                {goal.deadline && (
                  <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
                    <Calendar className="w-3.5 h-3.5 text-slate-500" />
                    <span>Target Date: {goal.deadline}</span>
                  </div>
                )}

              </div>

              {/* Action Strip */}
              <div className="px-6 py-3.5 bg-purple-950/20 border-t border-purple-900/40 flex items-center justify-between">
                <button
                  onClick={() => onDeleteGoal(goal.id)}
                  className="text-xs text-slate-500 hover:text-rose-400 transition-colors cursor-pointer"
                >
                  Remove
                </button>

                <button
                  onClick={() => onOpenDeposit(goal)}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 rounded-lg shadow transition-all cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Feed Goal (+50 🎃)</span>
                </button>
              </div>

            </div>
          );
        })}
      </div>

    </div>
  );
};
