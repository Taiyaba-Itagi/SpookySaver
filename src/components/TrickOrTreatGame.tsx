import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  Flame, 
  ShieldCheck, 
  Zap, 
  ArrowRight, 
  RotateCcw, 
  Check, 
  HelpCircle,
  Trophy,
  Plus
} from 'lucide-react';
import { BudgetConfig, Expense, SavingsGoal, TrickOrTreatRecord, TrickOrTreatStats } from '../types';
import { sounds } from '../utils/audio';

interface TrickOrTreatGameProps {
  budget: BudgetConfig;
  totalSpent: number;
  goals: SavingsGoal[];
  stats: TrickOrTreatStats;
  history: TrickOrTreatRecord[];
  onTrickPurchase: (itemName: string, cost: number, depositGoalId?: string) => Promise<any>;
  onTreatPurchase: (itemName: string, cost: number, category: any) => Promise<any>;
  onNavigateTab: (tab: string) => void;
}

// Preset temptation cards for fast, fun gameplay
const QUICK_TEMPTATIONS = [
  { name: 'Pumpkin Spice Latte & Cake', cost: 180, category: 'food', icon: '☕', hint: 'Daily cafe habit' },
  { name: 'Midnight Hostel Takeout Pizza', cost: 280, category: 'food', icon: '🍕', hint: 'Late-night hunger splurge' },
  { name: 'Halloween Costume Accessory', cost: 350, category: 'shopping', icon: '🎭', hint: 'One-time wear temptation' },
  { name: 'Spooky In-Game Character Skin', cost: 240, category: 'entertainment', icon: '🎮', hint: 'Virtual cosmetic thrill' },
  { name: 'Gourmet Autumn Bubble Tea', cost: 160, category: 'food', icon: '🧋', hint: 'Sweet impulse after lecture' },
];

export const TrickOrTreatGame: React.FC<TrickOrTreatGameProps> = ({
  budget,
  totalSpent,
  goals,
  stats,
  history,
  onTrickPurchase,
  onTreatPurchase,
  onNavigateTab,
}) => {
  const currency = budget.currency;
  const remainingBudget = Math.max(0, budget.totalBudget - totalSpent);

  // Form states
  const [itemName, setItemName] = useState('Pumpkin Spice Latte & Cake');
  const [cost, setCost] = useState('180');
  const [category, setCategory] = useState<string>('food');
  const [selectedGoalId, setSelectedGoalId] = useState<string>(goals[0]?.id || '');
  const [depositToGoal, setDepositToGoal] = useState<boolean>(true);

  // Interaction & animation states
  const [loadingAction, setLoadingAction] = useState<'trick' | 'treat' | null>(null);
  const [showCelebration, setShowCelebration] = useState(false);
  const [lastResult, setLastResult] = useState<{
    decision: 'trick' | 'treat';
    itemName: string;
    cost: number;
    points: number;
    remark: string;
    goalName?: string;
  } | null>(null);

  // Candy particles
  const [particles, setParticles] = useState<Array<{ id: number; emoji: string; x: number; y: number; delay: number }>>([]);

  const parsedCost = parseFloat(cost) || 0;
  const projectedBonusPoints = Math.max(50, Math.min(250, Math.round(parsedCost * 0.5)));

  // Trigger candy particle shower
  const launchCandyAnimation = () => {
    const candyEmojis = ['🍬', '🍭', '🍫', '🎃', '🍩', '🧁', '✨', '🪙'];
    const newParticles = Array.from({ length: 24 }).map((_, i) => ({
      id: Date.now() + i,
      emoji: candyEmojis[Math.floor(Math.random() * candyEmojis.length)],
      x: Math.random() * 90 + 5,
      y: Math.random() * 60 + 20,
      delay: Math.random() * 0.4,
    }));
    setParticles(newParticles);
    setTimeout(() => setParticles([]), 2500);
  };

  const handleSelectPreset = (preset: typeof QUICK_TEMPTATIONS[0]) => {
    setItemName(preset.name);
    setCost(preset.cost.toString());
    setCategory(preset.category);
    sounds.playSpookyWhoosh();
  };

  // User chooses "TRICK" (Skip purchase, save money, get bonus points)
  const handleTrick = async () => {
    if (!itemName.trim() || parsedCost <= 0) return;
    setLoadingAction('trick');

    try {
      const res = await onTrickPurchase(
        itemName.trim(),
        parsedCost,
        depositToGoal && selectedGoalId ? selectedGoalId : undefined
      );

      sounds.playCandySparkle();
      launchCandyAnimation();

      const matchedGoal = goals.find(g => g.id === selectedGoalId);
      setLastResult({
        decision: 'trick',
        itemName: itemName.trim(),
        cost: parsedCost,
        points: res?.points || projectedBonusPoints,
        remark: res?.remark || `You outsmarted the ${currency}${parsedCost} impulse! Your pumpkin vault is feasting!`,
        goalName: depositToGoal && matchedGoal ? matchedGoal.title : undefined,
      });
      setShowCelebration(true);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingAction(null);
    }
  };

  // User chooses "TREAT" (Mindful purchase within budget)
  const handleTreat = async () => {
    if (!itemName.trim() || parsedCost <= 0) return;
    setLoadingAction('treat');

    try {
      const res = await onTreatPurchase(itemName.trim(), parsedCost, category);
      sounds.playPumpkinCoin();

      setLastResult({
        decision: 'treat',
        itemName: itemName.trim(),
        cost: parsedCost,
        points: 10,
        remark: res?.remark || `Mindful treat recorded! Enjoy your ${itemName}, and balance with a thrifty meal later.`,
      });
      setShowCelebration(true);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingAction(null);
    }
  };

  return (
    <div className="space-y-8 relative">
      
      {/* Floating Candy Shower Particles for TRICK celebrations */}
      {particles.length > 0 && (
        <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
          {particles.map((p) => (
            <div
              key={p.id}
              className="absolute text-3xl sm:text-4xl animate-bounce"
              style={{
                left: `${p.x}%`,
                top: `${p.y}%`,
                transition: 'all 1.8s cubic-bezier(0.16, 1, 0.3, 1)',
                transform: `scale(${1 + Math.random() * 0.5}) rotate(${Math.random() * 360}deg)`,
                animationDelay: `${p.delay}s`,
              }}
            >
              {p.emoji}
            </div>
          ))}
        </div>
      )}

      {/* Header & Concept */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-2xl">🍬</span>
            <h2 className="text-xl font-bold text-slate-100 font-cinzel">
              'Trick or Treat' Impulse Arena
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl">
            Faced with a non-essential temptation? Choose <strong className="text-orange-300">TRICK</strong> to skip the buy, hoard bonus pumpkin points (+50–250 🎃), and feed your goal stash with a sweet virtual treat! Or choose <strong className="text-purple-300">TREAT</strong> to mindfully log it without guilt.
          </p>
        </div>

        <button
          onClick={() => onNavigateTab('dashboard')}
          className="text-xs text-slate-400 hover:text-slate-200 transition-colors cursor-pointer self-start sm:self-auto"
        >
          ← Back to Dashboard
        </button>
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        
        {/* Stat 1: Total Tricked Savings */}
        <div className="p-4 rounded-xl bg-[#130f24] border border-orange-500/40">
          <div className="text-[11px] uppercase tracking-wider text-slate-400">Total Money Saved</div>
          <div className="text-xl font-bold font-mono tabular-nums text-emerald-400 mt-0.5">
            {currency}{stats.totalTrickedSavings.toLocaleString()}
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">Saved by tricking impulses</div>
        </div>

        {/* Stat 2: Tricks Slayed */}
        <div className="p-4 rounded-xl bg-[#130f24] border border-purple-900/50">
          <div className="text-[11px] uppercase tracking-wider text-slate-400">Impulses Tricked</div>
          <div className="text-xl font-bold font-mono tabular-nums text-orange-300 mt-0.5">
            {stats.tricksCount} 👻
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">Purchases safely bypassed</div>
        </div>

        {/* Stat 3: Current Streak */}
        <div className="p-4 rounded-xl bg-[#130f24] border border-purple-900/50">
          <div className="text-[11px] uppercase tracking-wider text-slate-400">Trick Streak</div>
          <div className="text-xl font-bold font-mono tabular-nums text-amber-300 mt-0.5 flex items-center gap-1">
            <span>{stats.currentStreak}</span>
            <Flame className="w-4 h-4 text-orange-400" />
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">Consecutive impulse skips</div>
        </div>

        {/* Stat 4: Mindful Treats */}
        <div className="p-4 rounded-xl bg-[#130f24] border border-purple-900/50">
          <div className="text-[11px] uppercase tracking-wider text-slate-400">Mindful Treats</div>
          <div className="text-xl font-bold font-mono tabular-nums text-purple-300 mt-0.5">
            {stats.treatsCount} 🍬
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">Logged within budget</div>
        </div>

      </div>

      {/* Main Interactive Arena */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: The Temptation Form & Decision (7 cols) */}
        <div className="lg:col-span-7 rounded-2xl bg-[#130f24] border border-orange-500/40 p-6 space-y-6 shadow-2xl relative overflow-hidden">
          
          <div className="flex items-center justify-between border-b border-purple-950/60 pb-3">
            <div>
              <span className="text-xs font-semibold text-orange-400 uppercase tracking-wider">
                The Fork in the Fog
              </span>
              <h3 className="text-lg font-bold text-slate-100 font-cinzel mt-0.5">
                Confront Your Spending Temptation
              </h3>
            </div>
            <span className="text-xs text-slate-400 font-mono tabular-nums">
              Safe Allowance: <strong className="text-emerald-400">{currency}{remainingBudget.toLocaleString()}</strong>
            </span>
          </div>

          {/* Quick Preset Cards */}
          <div className="space-y-2">
            <span className="text-xs text-slate-400">Or pick a common spooky temptation:</span>
            <div className="flex gap-2 overflow-x-auto pb-1 text-xs">
              {QUICK_TEMPTATIONS.map((preset, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSelectPreset(preset)}
                  className={`px-3 py-2 rounded-xl border flex items-center gap-2 whitespace-nowrap cursor-pointer transition-all ${
                    itemName === preset.name
                      ? 'bg-orange-950/60 border-orange-500 text-orange-200'
                      : 'bg-[#0e0a1b] border-purple-950/70 text-slate-300 hover:border-purple-800'
                  }`}
                >
                  <span>{preset.icon}</span>
                  <span className="font-medium">{preset.name}</span>
                  <span className="font-mono text-slate-400 font-semibold">{currency}{preset.cost}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Inputs */}
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-4">
            
            <div className="sm:col-span-8">
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                What item is haunting your mind?
              </label>
              <input
                type="text"
                value={itemName}
                onChange={(e) => setItemName(e.target.value)}
                placeholder="e.g. Extra Boba, Online Sale Jacket, Gaming Pass"
                className="w-full px-3.5 py-2.5 rounded-lg bg-[#0e0a1b] border border-purple-900/60 text-sm text-slate-100 focus:outline-none focus:border-orange-500 transition-colors"
              />
            </div>

            <div className="sm:col-span-4">
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Cost ({currency})
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-slate-400 font-mono text-sm">{currency}</span>
                <input
                  type="number"
                  inputMode="decimal"
                  step="any"
                  min="1"
                  value={cost}
                  onChange={(e) => setCost(e.target.value)}
                  placeholder="150"
                  className="w-full pl-7 pr-3 py-2.5 rounded-lg bg-[#0e0a1b] border border-purple-900/60 text-sm font-mono tabular-nums text-slate-100 focus:outline-none focus:border-orange-500 transition-colors"
                />
              </div>
              {/* Quick amount adjustment chips on phone */}
              <div className="flex items-center gap-1 mt-1.5 overflow-x-auto">
                {[50, 100, 250, 500].map((quickVal) => (
                  <button
                    key={quickVal}
                    type="button"
                    onClick={() => {
                      setCost(quickVal.toString());
                      sounds.playPumpkinCoin();
                    }}
                    className="min-h-[32px] px-2 py-0.5 rounded bg-[#18122c] border border-purple-900/60 text-[11px] font-mono text-slate-300 hover:text-orange-300"
                  >
                    {currency}{quickVal}
                  </button>
                ))}
              </div>
            </div>

          </div>

          {/* Transfer to Savings Goal Checkbox */}
          {goals.length > 0 && (
            <div className="p-3.5 rounded-xl bg-[#0e0a1b] border border-purple-950/80 space-y-2">
              <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-200">
                <input
                  type="checkbox"
                  checked={depositToGoal}
                  onChange={(e) => setDepositToGoal(e.target.checked)}
                  className="rounded border-purple-900 text-orange-500 focus:ring-0 cursor-pointer"
                />
                <span className="font-semibold text-orange-300">
                  When I 'Trick', instantly transfer this {currency}{parsedCost} into my goal:
                </span>
              </label>

              {depositToGoal && (
                <select
                  value={selectedGoalId}
                  onChange={(e) => setSelectedGoalId(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-[#140f26] border border-purple-900/50 text-xs text-slate-200 focus:outline-none focus:border-orange-500 cursor-pointer"
                >
                  {goals.map((g) => (
                    <option key={g.id} value={g.id}>
                      {g.title} (Saved: {currency}{g.currentAmount} / Target: {currency}{g.targetAmount})
                    </option>
                  ))}
                </select>
              )}
            </div>
          )}

          {/* The Big Dual Decision Buttons */}
          <div className="pt-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            {/* TRICK (Skip & Save) */}
            <div className="space-y-1.5">
              <button
                type="button"
                onClick={handleTrick}
                disabled={loadingAction !== null || !itemName.trim() || parsedCost <= 0}
                className="w-full py-3.5 px-4 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-orange-600 via-amber-600 to-orange-500 hover:from-orange-500 hover:to-amber-500 shadow-xl shadow-orange-950/60 border border-orange-400/40 transition-all cursor-pointer flex flex-col items-center justify-center gap-0.5 active:scale-98 disabled:opacity-50"
              >
                <div className="flex items-center gap-2">
                  <span className="text-lg">🎃</span>
                  <span>TRICK! (Skip Purchase)</span>
                </div>
                <span className="text-[11px] font-mono text-amber-200 font-normal">
                  +{projectedBonusPoints} 🎃 Points & Save {currency}{parsedCost}
                </span>
              </button>
              <p className="text-[11px] text-center text-slate-400">
                Outsmart the impulse and trigger the candy shower celebration!
              </p>
            </div>

            {/* TREAT (Mindful Purchase) */}
            <div className="space-y-1.5">
              <button
                type="button"
                onClick={handleTreat}
                disabled={loadingAction !== null || !itemName.trim() || parsedCost <= 0}
                className="w-full py-3.5 px-4 rounded-xl text-sm font-bold text-slate-100 bg-[#1e1638] hover:bg-[#281d4a] border border-purple-700/60 transition-all cursor-pointer flex flex-col items-center justify-center gap-0.5 active:scale-98 disabled:opacity-50"
              >
                <div className="flex items-center gap-2">
                  <span className="text-lg">🍬</span>
                  <span>TREAT! (Mindful Purchase)</span>
                </div>
                <span className="text-[11px] font-mono text-purple-300 font-normal">
                  Log in budget · +10 🎃 Points
                </span>
              </button>
              <p className="text-[11px] text-center text-slate-400">
                Treat yourself within limits; logged automatically to your ledger.
              </p>
            </div>

          </div>

          {/* Celebration Card Overlay/Box */}
          {showCelebration && lastResult && (
            <div className={`p-4 rounded-xl border animate-fadeIn space-y-2 ${
              lastResult.decision === 'trick'
                ? 'bg-gradient-to-r from-orange-950/70 via-purple-950/60 to-orange-950/70 border-orange-500/60 shadow-lg'
                : 'bg-gradient-to-r from-purple-950/70 via-indigo-950/60 to-purple-950/70 border-purple-500/50'
            }`}>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 text-orange-300">
                  <span>{lastResult.decision === 'trick' ? '🎉 IMPULSE TRICKED!' : '🍬 MINDFUL TREAT LOGGED!'}</span>
                </span>
                <span className="text-xs font-mono font-bold text-amber-300">
                  +{lastResult.points} 🎃 Pumpkin Points
                </span>
              </div>

              <p className="text-xs text-slate-200 italic">
                "{lastResult.remark}"
              </p>

              {lastResult.goalName && (
                <div className="flex items-center gap-1 text-[11px] text-emerald-300 font-medium">
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Transferred {currency}{lastResult.cost} straight to {lastResult.goalName}!</span>
                </div>
              )}
            </div>
          )}

        </div>

        {/* Right Column: Virtual Treat Jar & History (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Virtual Treat Jar Visual Container */}
          <div className="p-6 rounded-2xl bg-[#130f24] border border-purple-900/50 space-y-4 shadow-xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xl">🏺</span>
                <h4 className="text-sm font-bold text-slate-100 font-cinzel">
                  Your Virtual Treat Jar
                </h4>
              </div>
              <span className="text-xs font-mono text-emerald-400 font-bold tabular-nums">
                {currency}{stats.totalTrickedSavings.toLocaleString()} Saved
              </span>
            </div>

            <p className="text-xs text-slate-400">
              Every time you trick an impulse purchase, your phantom jar captures the money before it vanishes into the ether.
            </p>

            {/* Jar visual meter */}
            <div className="p-4 rounded-xl bg-[#0e0a1b] border border-purple-950/60 text-center space-y-2">
              <div className="text-4xl animate-pulse">
                {stats.tricksCount >= 5 ? '👑' : stats.tricksCount >= 2 ? '🎃' : '🏺'}
              </div>
              <div className="text-xs text-slate-300 font-medium">
                {stats.tricksCount >= 5 
                  ? 'Master Trickster Vault! Unyielding Willpower!' 
                  : stats.tricksCount >= 1 
                  ? 'The treat jar is filling with spared gold!' 
                  : 'Jar is waiting for your first trick victory.'}
              </div>
              <div className="text-[11px] text-slate-500">
                Trick Streak: <strong className="text-orange-400">{stats.currentStreak} in a row</strong>
              </div>
            </div>
          </div>

          {/* Recent Trick or Treat History */}
          <div className="p-5 rounded-2xl bg-[#130f24] border border-purple-900/50 space-y-3 shadow-xl">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span className="font-bold uppercase tracking-wider text-slate-300">Recent Decisions</span>
              <span>{history.length} logged</span>
            </div>

            {history.length === 0 ? (
              <p className="text-xs text-slate-500 italic py-2">
                No Trick or Treat decisions recorded yet. Test your willpower above!
              </p>
            ) : (
              <div className="divide-y divide-purple-950/40 text-xs">
                {history.slice(0, 4).map((rec) => (
                  <div key={rec.id} className="py-2.5 flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <div className="text-slate-200 font-medium truncate">{rec.itemName}</div>
                      <div className="text-[11px] text-slate-400 flex items-center gap-1.5 mt-0.5">
                        <span className={`font-semibold ${rec.decision === 'trick' ? 'text-orange-400' : 'text-purple-400'}`}>
                          {rec.decision === 'trick' ? '🎃 Tricked & Saved' : '🍬 Mindful Treat'}
                        </span>
                        <span>·</span>
                        <span>{rec.date}</span>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="font-mono tabular-nums font-bold text-slate-100 text-xs">
                        {currency}{rec.cost}
                      </div>
                      <div className="text-[10px] font-mono text-amber-300">
                        +{rec.pointsAwarded} 🎃
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

      </div>

    </div>
  );
};
