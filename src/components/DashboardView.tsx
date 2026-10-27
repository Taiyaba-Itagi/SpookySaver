import React, { useState } from 'react';
import { 
  DollarSign, 
  TrendingUp, 
  ShieldAlert, 
  Sparkles, 
  Plus, 
  ArrowRight, 
  CheckCircle2, 
  Flame, 
  Target, 
  Zap, 
  HelpCircle,
  Sliders
} from 'lucide-react';
import { BudgetConfig, Expense, SavingsGoal, ImpulseAnalysis, TrickOrTreatStats } from '../types';
import { sounds } from '../utils/audio';

interface DashboardViewProps {
  budget: BudgetConfig;
  expenses: Expense[];
  goals: SavingsGoal[];
  pumpkinPoints: number;
  trickStats?: TrickOrTreatStats;
  onOpenAddExpense: () => void;
  onOpenEditBudget: () => void;
  onOpenDeposit: (goal: SavingsGoal) => void;
  onNavigateTab: (tab: string) => void;
  onLoadPreset: (presetKey: 'student' | 'pro' | 'minimal') => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  budget,
  expenses,
  goals,
  pumpkinPoints,
  trickStats,
  onOpenAddExpense,
  onOpenEditBudget,
  onOpenDeposit,
  onNavigateTab,
  onLoadPreset,
}) => {
  const currency = budget.currency;
  const totalSpent = expenses.reduce((acc, curr) => acc + curr.amount, 0);
  const remaining = Math.max(0, budget.totalBudget - totalSpent);
  const percentUsed = budget.totalBudget > 0 ? Math.round((totalSpent / budget.totalBudget) * 100) : 0;

  const totalSaved = goals.reduce((acc, curr) => acc + curr.currentAmount, 0);
  const totalTarget = goals.reduce((acc, curr) => acc + curr.targetAmount, 0);
  const goalProgressPercent = totalTarget > 0 ? Math.round((totalSaved / totalTarget) * 100) : 0;

  // Breakdown by type
  const needsSpent = expenses.filter(e => e.type === 'need').reduce((a, b) => a + b.amount, 0);
  const wantsSpent = expenses.filter(e => e.type === 'want').reduce((a, b) => a + b.amount, 0);
  const splurgeSpent = expenses.filter(e => e.type === 'spooky-splurge').reduce((a, b) => a + b.amount, 0);

  // Impulse quick tester state
  const [impulseItem, setImpulseItem] = useState('');
  const [impulseCost, setImpulseCost] = useState('');
  const [impulseLoading, setImpulseLoading] = useState(false);
  const [impulseResult, setImpulseResult] = useState<ImpulseAnalysis | null>(null);

  const handleQuickImpulseCheck = async (e: React.FormEvent) => {
    e.preventDefault();
    const costNum = parseFloat(impulseCost);
    if (!impulseItem.trim() || isNaN(costNum) || costNum <= 0) return;

    setImpulseLoading(true);
    sounds.playSpookyWhoosh();
    try {
      const res = await fetch('/api/mentor/impulse-check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          itemName: impulseItem.trim(),
          cost: costNum,
          currency,
          budget: budget.totalBudget,
          totalSpent,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setImpulseResult(data.data);
      }
    } catch {
      // Offline fallback
      setImpulseResult({
        verdict: costNum > remaining ? 'Spooky Trap' : 'Worthy Treat',
        score: costNum > remaining ? 2 : 7,
        analysis: costNum > remaining 
          ? `Spending ${currency}${costNum} exceeds your remaining safe allowance of ${currency}${remaining}!` 
          : `At ${currency}${costNum}, it fits if you avoid other splurges this week.`,
        alternative: 'Wait 24 hours to see if you still crave it.',
        savingsEquivalent: `Equals ${(costNum / 50).toFixed(0)} meals or days saved towards your goal!`,
      });
    } finally {
      setImpulseLoading(false);
    }
  };

  // Primary active goal for spotlight
  const spotlightGoal = goals[0] || null;

  return (
    <div className="space-y-8">
      
      {/* Top Demo Bar & Presets */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-2 border-b border-purple-950/40 text-xs text-slate-400">
        <div className="flex items-center gap-2">
          <span>Demo Scenarios:</span>
          <button
            onClick={() => onLoadPreset('student')}
            className="px-2.5 py-1 rounded bg-[#171126] border border-orange-500/30 text-orange-300 hover:bg-orange-950/40 transition-colors cursor-pointer"
          >
            College Student ({currency}1,000/mo)
          </button>
          <button
            onClick={() => onLoadPreset('pro')}
            className="px-2.5 py-1 rounded bg-[#171126] border border-purple-900/40 text-slate-300 hover:text-white hover:bg-purple-900/30 transition-colors cursor-pointer"
          >
            Young Adult ({currency}15,000/mo)
          </button>
          <button
            onClick={() => onLoadPreset('minimal')}
            className="px-2.5 py-1 rounded bg-[#171126] border border-purple-900/40 text-slate-300 hover:text-white hover:bg-purple-900/30 transition-colors cursor-pointer"
          >
            Clean Slate
          </button>
        </div>
        <div className="text-slate-400">
          <span>Mode: </span>
          <strong className="text-slate-200 capitalize">{budget.period} Budgeting</strong>
        </div>
      </div>

      {/* 4 Quantitative KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Card 1: Total Budget */}
        <div className="p-5 rounded-2xl bg-[#130f24] border border-purple-900/40 flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>{budget.period.toUpperCase()} BUDGET</span>
            <button
              onClick={onOpenEditBudget}
              title="Edit Budget Limit"
              className="text-slate-400 hover:text-orange-400 transition-colors cursor-pointer"
            >
              <Sliders className="w-4 h-4" />
            </button>
          </div>
          <div className="mt-2">
            <div className="text-2xl font-bold font-mono tabular-nums text-slate-100">
              {currency}{budget.totalBudget.toLocaleString()}
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-400 mt-1">
              <span>Threshold: {budget.alertThreshold}%</span>
              <span>·</span>
              <span className="text-slate-300 capitalize">{budget.period}</span>
            </div>
          </div>
        </div>

        {/* Card 2: Total Spent & Remaining */}
        <div className="p-5 rounded-2xl bg-[#130f24] border border-purple-900/40 flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>CURRENT SPENT</span>
            <span className={`font-mono font-semibold ${percentUsed >= 90 ? 'text-rose-400' : percentUsed >= 75 ? 'text-amber-400' : 'text-emerald-400'}`}>
              {percentUsed}%
            </span>
          </div>
          <div className="mt-2">
            <div className="text-2xl font-bold font-mono tabular-nums text-slate-100">
              {currency}{totalSpent.toLocaleString()}
            </div>
            <div className="flex items-center gap-2 text-xs mt-1">
              <span className="text-slate-400">Remaining:</span>
              <span className="font-mono tabular-nums font-semibold text-emerald-400">
                {currency}{remaining.toLocaleString()}
              </span>
            </div>
          </div>
        </div>

        {/* Card 3: Total Saved in Vault */}
        <div className="p-5 rounded-2xl bg-[#130f24] border border-purple-900/40 flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>PUMPKIN TREASURE</span>
            <span className="font-mono text-orange-400 font-semibold">{goalProgressPercent}%</span>
          </div>
          <div className="mt-2">
            <div className="text-2xl font-bold font-mono tabular-nums text-orange-300">
              {currency}{totalSaved.toLocaleString()}
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-400 mt-1">
              <span>Target: {currency}{totalTarget.toLocaleString()}</span>
              <span>·</span>
              <span>{goals.length} Goals</span>
            </div>
          </div>
        </div>

        {/* Card 4: Pumpkin Points & Spooky Rank */}
        <div className="p-5 rounded-2xl bg-[#130f24] border border-purple-900/40 flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>PUMPKIN POINTS</span>
            <span className="text-orange-400 font-semibold text-xs">Level {Math.floor(pumpkinPoints / 500) + 1}</span>
          </div>
          <div className="mt-2">
            <div className="text-2xl font-bold font-mono tabular-nums text-amber-300 flex items-center gap-1.5">
              <span>🎃</span>
              <span>{pumpkinPoints.toLocaleString()}</span>
            </div>
            <div className="text-xs text-slate-400 mt-1">
              <span>Rank: </span>
              <strong className="text-slate-200">
                {pumpkinPoints >= 2000 ? 'Jack-o-Lantern Archon' : pumpkinPoints >= 1000 ? 'Cauldron Master' : 'Pumpkin Apprentice'}
              </strong>
            </div>
          </div>
        </div>

      </div>

      {/* Main 2-Column Split: Visual Pumpkin Treasure + Spending Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
        
        {/* Left Column: Virtual Pumpkin Treasure Chest (5 cols) */}
        <div className="lg:col-span-5 rounded-2xl bg-[#130f24] border border-purple-900/50 overflow-hidden flex flex-col justify-between">
          
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-slate-100 font-cinzel">
                  Virtual Pumpkin Treasure
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Grow your treasure vault by meeting realistic savings goals
                </p>
              </div>
              <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-orange-950/60 text-orange-300 border border-orange-500/30">
                {goalProgressPercent >= 100 ? 'Harvested! 🏆' : 'Growing Strong 🌱'}
              </span>
            </div>

            {/* Visual Image Asset */}
            <div className="mt-4 relative rounded-xl overflow-hidden aspect-square border border-orange-500/30 bg-black/40">
              <img
                src="/src/assets/images/spooky_pumpkin_treasure_1793085116985.jpg"
                alt="Glowing Pumpkin Treasure Vault"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0e0a1b] via-transparent to-transparent opacity-80" />
              
              {/* Overlay Stat */}
              <div className="absolute bottom-3 left-3 right-3 p-3 rounded-lg bg-[#0e0a1b]/85 backdrop-blur-md border border-orange-500/20 flex items-center justify-between">
                <div>
                  <div className="text-[11px] uppercase tracking-wider text-slate-400">Treasured Stash</div>
                  <div className="text-lg font-bold font-mono tabular-nums text-orange-300">
                    {currency}{totalSaved.toLocaleString()}
                  </div>
                </div>
                {spotlightGoal && (
                  <button
                    onClick={() => onOpenDeposit(spotlightGoal)}
                    className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-white bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 rounded-lg shadow cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Feed Vault</span>
                  </button>
                )}
              </div>
            </div>

            {/* Goal Progress Bar */}
            {spotlightGoal && (
              <div className="mt-4 space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-300 font-medium">{spotlightGoal.title}</span>
                  <span className="font-mono text-orange-400 font-semibold tabular-nums">
                    {Math.round((spotlightGoal.currentAmount / spotlightGoal.targetAmount) * 100)}%
                  </span>
                </div>
                <div className="w-full h-2.5 bg-[#0e0a1b] rounded-full overflow-hidden border border-purple-950">
                  <div
                    className="h-full bg-gradient-to-r from-orange-600 via-amber-500 to-yellow-400 rounded-full transition-all duration-500"
                    style={{
                      width: `${Math.min(100, Math.round((spotlightGoal.currentAmount / spotlightGoal.targetAmount) * 100))}%`,
                    }}
                  />
                </div>
                <div className="flex justify-between text-[11px] text-slate-400 font-mono tabular-nums">
                  <span>{currency}{spotlightGoal.currentAmount.toLocaleString()} saved</span>
                  <span>Target: {currency}{spotlightGoal.targetAmount.toLocaleString()}</span>
                </div>
              </div>
            )}
          </div>

          <div className="px-6 py-3.5 bg-purple-950/20 border-t border-purple-900/40 flex items-center justify-between text-xs">
            <span className="text-slate-400">Managing {goals.length} active quests</span>
            <button
              onClick={() => onNavigateTab('goals')}
              className="text-orange-400 hover:text-orange-300 font-medium flex items-center gap-1 cursor-pointer"
            >
              <span>View All Goals</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

        </div>

        {/* Right Column: Spending Breakdown & Habit Haunt (7 cols) */}
        <div className="lg:col-span-7 space-y-6 flex flex-col justify-between">
          
          {/* Spending Anatomy Panel */}
          <div className="p-6 rounded-2xl bg-[#130f24] border border-purple-900/50">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold text-slate-100 font-cinzel">
                  Spending Anatomy & Habit Haunt
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Distinguishing essential living costs from phantom impulse leaks
                </p>
              </div>
              <button
                onClick={onOpenAddExpense}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-200 bg-[#1f1738] hover:bg-[#281f47] border border-purple-800/60 rounded-lg transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5 text-orange-400" />
                <span>Log Spent</span>
              </button>
            </div>

            {/* Needs vs Wants vs Splurges bar */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-300">
                <span>Spending Distribution</span>
                <span className="font-mono tabular-nums text-slate-400">{currency}{totalSpent.toLocaleString()} Total</span>
              </div>
              
              <div className="h-4 w-full bg-[#0e0a1b] rounded-full overflow-hidden flex border border-purple-950">
                {totalSpent > 0 ? (
                  <>
                    <div 
                      title={`Needs: ${currency}${needsSpent}`} 
                      style={{ width: `${(needsSpent / totalSpent) * 100}%` }} 
                      className="bg-emerald-600 hover:bg-emerald-500 transition-all cursor-help"
                    />
                    <div 
                      title={`Wants: ${currency}${wantsSpent}`} 
                      style={{ width: `${(wantsSpent / totalSpent) * 100}%` }} 
                      className="bg-amber-600 hover:bg-amber-500 transition-all cursor-help"
                    />
                    <div 
                      title={`Spooky Splurges: ${currency}${splurgeSpent}`} 
                      style={{ width: `${(splurgeSpent / totalSpent) * 100}%` }} 
                      className="bg-rose-600 hover:bg-rose-500 transition-all cursor-help"
                    />
                  </>
                ) : (
                  <div className="w-full bg-slate-800" />
                )}
              </div>

              {/* Legends with clean unboxed text */}
              <div className="flex flex-wrap items-center gap-4 text-xs pt-1 text-slate-400">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" />
                  <span>Vital Needs: <strong className="text-slate-200 font-mono tabular-nums">{currency}{needsSpent}</strong> ({totalSpent > 0 ? Math.round((needsSpent/totalSpent)*100) : 0}%)</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block" />
                  <span>Modest Wants: <strong className="text-slate-200 font-mono tabular-nums">{currency}{wantsSpent}</strong> ({totalSpent > 0 ? Math.round((wantsSpent/totalSpent)*100) : 0}%)</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500 inline-block" />
                  <span>Spooky Splurges: <strong className="text-slate-200 font-mono tabular-nums">{currency}{splurgeSpent}</strong> ({totalSpent > 0 ? Math.round((splurgeSpent/totalSpent)*100) : 0}%)</span>
                </div>
              </div>
            </div>

            {/* Quick Recent Expenses Strip */}
            <div className="mt-6 pt-5 border-t border-purple-950/50">
              <div className="flex items-center justify-between mb-3 text-xs text-slate-400">
                <span>Recent Hauntings</span>
                <button
                  onClick={() => onNavigateTab('expenses')}
                  className="text-orange-400 hover:underline cursor-pointer"
                >
                  View full ledger ({expenses.length}) →
                </button>
              </div>

              <div className="divide-y divide-purple-950/30">
                {expenses.slice(0, 3).map((exp) => (
                  <div key={exp.id} className="py-2.5 flex items-center justify-between gap-4 text-xs">
                    <div className="min-w-0">
                      <div className="text-slate-200 font-medium truncate">{exp.title}</div>
                      <div className="text-slate-400 text-[11px] flex items-center gap-2 mt-0.5">
                        <span className="capitalize">{exp.category}</span>
                        <span>·</span>
                        <span>{exp.date}</span>
                        <span>·</span>
                        <span className={exp.type === 'spooky-splurge' ? 'text-rose-400 font-medium' : exp.type === 'want' ? 'text-amber-400' : 'text-emerald-400'}>
                          {exp.type === 'spooky-splurge' ? 'Splurge' : exp.type === 'want' ? 'Want' : 'Need'}
                        </span>
                      </div>
                    </div>
                    <div className="font-mono tabular-nums font-semibold text-slate-100 text-sm whitespace-nowrap">
                      {currency}{exp.amount.toLocaleString()}
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* Quick Impulse Spender Oracle Widget */}
          <div className="p-5 rounded-2xl bg-[#130f24] border border-orange-500/30 relative overflow-hidden">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="text-lg">🔮</span>
                <h4 className="text-sm font-bold text-slate-100 font-cinzel">
                  Spooky Impulse Buy Oracle
                </h4>
              </div>
              <span className="text-[11px] text-orange-400 font-medium">Powered by Gemini AI</span>
            </div>
            <p className="text-xs text-slate-400 mb-3">
              Tempted to buy something non-essential right now? Let Professor Jack judge before you pay.
            </p>

            <form onSubmit={handleQuickImpulseCheck} className="flex flex-col sm:flex-row gap-2">
              <input
                type="text"
                value={impulseItem}
                onChange={(e) => setImpulseItem(e.target.value)}
                placeholder="Item name (e.g., Costume Hoodie, Fancy Boba)"
                className="flex-1 px-3 py-2 rounded-lg bg-[#0e0a1b] border border-purple-900/60 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-orange-500"
              />
              <div className="relative w-full sm:w-28">
                <span className="absolute left-2.5 top-2 text-slate-400 font-mono text-xs">{currency}</span>
                <input
                  type="number"
                  inputMode="decimal"
                  step="any"
                  value={impulseCost}
                  onChange={(e) => setImpulseCost(e.target.value)}
                  placeholder="Cost"
                  className="w-full pl-6 pr-2.5 py-2 rounded-lg bg-[#0e0a1b] border border-purple-900/60 text-xs text-slate-100 font-mono tabular-nums focus:outline-none focus:border-orange-500"
                />
              </div>
              <button
                type="submit"
                disabled={impulseLoading}
                className="px-4 py-2 text-xs font-semibold text-white bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 rounded-lg shadow transition-all cursor-pointer whitespace-nowrap shrink-0 disabled:opacity-50"
              >
                {impulseLoading ? 'Consulting...' : 'Judge Impulse'}
              </button>
            </form>

            {/* Quick Result Drawer */}
            {impulseResult && (
              <div className="mt-3 p-3 rounded-xl bg-purple-950/40 border border-purple-800/40 space-y-1.5 animate-fadeIn">
                <div className="flex items-center justify-between text-xs">
                  <span className={`font-bold ${impulseResult.verdict === 'Spooky Trap' ? 'text-rose-400' : 'text-emerald-400'}`}>
                    {impulseResult.verdict === 'Spooky Trap' ? '👻 Ghost Verdict: SPOOKY TRAP' : '🎃 Ghost Verdict: WORTHY TREAT'}
                  </span>
                  <span className="text-slate-400">Score: <strong className="text-slate-200">{impulseResult.score}/10</strong></span>
                </div>
                <p className="text-xs text-slate-300">{impulseResult.analysis}</p>
                <div className="text-[11px] text-amber-300 font-medium">
                  Alternative: {impulseResult.alternative}
                </div>
                <div className="pt-1 flex items-center justify-between">
                  <span className="text-[11px] text-slate-400">Ready to test your willpower?</span>
                  <button
                    type="button"
                    onClick={() => onNavigateTab('trick-or-treat')}
                    className="text-xs font-semibold text-orange-400 hover:text-orange-300 underline cursor-pointer"
                  >
                    Play in Trick or Treat Arena →
                  </button>
                </div>
              </div>
            )}
          </div>

        </div>

      </div>

      {/* Feature Banner: 'Trick or Treat' Spending Game */}
      <div className="rounded-2xl border border-orange-500/40 bg-gradient-to-r from-[#1b102e] via-[#24143d] to-[#1b102e] p-6 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-500 via-orange-500 to-purple-600 flex items-center justify-center text-3xl shadow-lg shadow-orange-950/50 shrink-0">
            🍬
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-base font-bold text-slate-100 font-cinzel">
                'Trick or Treat' Impulse Spending Game
              </h4>
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-orange-950/60 border border-orange-500/40 text-orange-300">
                Gamified Impulse Control
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-1 max-w-xl">
              Faced with a non-essential craving? Choose <strong>'Trick'</strong> to skip the buy, bag bonus pumpkin points (+50–250 🎃), and celebrate with a sweet virtual treat animation! Or choose <strong>'Treat'</strong> to indulge mindfully.
            </p>
            {trickStats && trickStats.totalTrickedSavings > 0 && (
              <div className="mt-2 text-xs text-slate-400 flex items-center gap-3 font-mono tabular-nums">
                <span>Saved so far: <strong className="text-emerald-400">{currency}{trickStats.totalTrickedSavings.toLocaleString()}</strong></span>
                <span>·</span>
                <span>Trick Streak: <strong className="text-orange-400">{trickStats.currentStreak} 🔥</strong></span>
              </div>
            )}
          </div>
        </div>

        <button
          onClick={() => onNavigateTab('trick-or-treat')}
          className="flex items-center gap-2 px-5 py-2.5 text-xs font-semibold text-white bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 rounded-xl shadow-lg shadow-orange-950/40 transition-all cursor-pointer whitespace-nowrap shrink-0"
        >
          <span>Play Trick or Treat</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Callout Strip for Halloween Challenges */}
      <div className="rounded-2xl border border-purple-900/40 bg-gradient-to-r from-[#17112b] via-[#1b1333] to-[#17112b] p-6 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-2xl shadow-lg shadow-orange-950/40 shrink-0">
            🎃
          </div>
          <div>
            <h4 className="text-base font-bold text-slate-100 font-cinzel">
              Halloween Savings Quests & Pumpkin Badges
            </h4>
            <p className="text-xs text-slate-400 mt-0.5">
              Complete weekly money-saving challenges like "Ghosting the Impulse Buy" to earn points and level up your hunter rank.
            </p>
          </div>
        </div>

        <button
          onClick={() => onNavigateTab('challenges')}
          className="flex items-center gap-1.5 px-5 py-2.5 text-xs font-semibold text-white bg-orange-600 hover:bg-orange-500 rounded-lg shadow transition-colors cursor-pointer whitespace-nowrap shrink-0"
        >
          <span>Explore Quests</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

    </div>
  );
};
