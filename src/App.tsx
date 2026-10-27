import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { BudgetAlertBanner } from './components/BudgetAlertBanner';
import { DashboardView } from './components/DashboardView';
import { ExpenseTrackerView } from './components/ExpenseTrackerView';
import { SavingsGoalsView } from './components/SavingsGoalsView';
import { AIMoneyMentorView } from './components/AIMoneyMentorView';
import { HalloweenChallengesView } from './components/HalloweenChallengesView';
import { TrickOrTreatGame } from './components/TrickOrTreatGame';
import { MobileBottomNav } from './components/MobileBottomNav';
import { AddExpenseModal } from './components/AddExpenseModal';
import { DepositGoalModal } from './components/DepositGoalModal';
import { AddGoalModal } from './components/AddGoalModal';
import { EditBudgetModal } from './components/EditBudgetModal';
import { BudgetConfig, Expense, SavingsGoal, Quest, Badge, TrickOrTreatRecord, TrickOrTreatStats } from './types';
import { initialBudget, initialExpenses, initialGoals, initialQuests, initialBadges } from './data/initialData';
import { sounds } from './utils/audio';

export default function App() {
  const [currentTab, setCurrentTab] = useState<string>('dashboard');
  
  // Persistent state
  const [budget, setBudget] = useState<BudgetConfig>(() => {
    const saved = localStorage.getItem('spooky_budget');
    return saved ? JSON.parse(saved) : initialBudget;
  });

  const [expenses, setExpenses] = useState<Expense[]>(() => {
    const saved = localStorage.getItem('spooky_expenses');
    return saved ? JSON.parse(saved) : initialExpenses;
  });

  const [goals, setGoals] = useState<SavingsGoal[]>(() => {
    const saved = localStorage.getItem('spooky_goals');
    return saved ? JSON.parse(saved) : initialGoals;
  });

  const [pumpkinPoints, setPumpkinPoints] = useState<number>(() => {
    const saved = localStorage.getItem('spooky_points');
    return saved ? JSON.parse(saved) : 680;
  });

  const [quests, setQuests] = useState<Quest[]>(() => {
    const saved = localStorage.getItem('spooky_quests');
    return saved ? JSON.parse(saved) : initialQuests;
  });

  const [badges, setBadges] = useState<Badge[]>(() => {
    const saved = localStorage.getItem('spooky_badges');
    return saved ? JSON.parse(saved) : initialBadges;
  });

  const [trickStats, setTrickStats] = useState<TrickOrTreatStats>(() => {
    const saved = localStorage.getItem('spooky_trick_stats');
    return saved ? JSON.parse(saved) : {
      totalTrickedSavings: 420,
      tricksCount: 2,
      treatsCount: 1,
      currentStreak: 2,
    };
  });

  const [trickHistory, setTrickHistory] = useState<TrickOrTreatRecord[]>(() => {
    const saved = localStorage.getItem('spooky_trick_history');
    return saved ? JSON.parse(saved) : [
      {
        id: 't-1',
        itemName: 'Midnight Cafe Donut & Coffee',
        cost: 180,
        decision: 'trick',
        date: 'Oct 25',
        pointsAwarded: 90,
        aiRemark: 'Ha! You cast banishment on the cafe impulse phantom! Your pumpkin stash swells with pride.',
      },
      {
        id: 't-2',
        itemName: 'Pumpkin Cookie Box',
        cost: 240,
        decision: 'trick',
        date: 'Oct 26',
        pointsAwarded: 120,
        aiRemark: 'Masterful willpower! Your pumpkin treasure vault feasts on your self-control.',
      },
    ];
  });

  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);

  // Modals state
  const [isAddExpenseOpen, setIsAddExpenseOpen] = useState(false);
  const [isEditBudgetOpen, setIsEditBudgetOpen] = useState(false);
  const [isAddGoalOpen, setIsAddGoalOpen] = useState(false);
  const [depositGoal, setDepositGoal] = useState<SavingsGoal | null>(null);

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem('spooky_budget', JSON.stringify(budget));
  }, [budget]);

  useEffect(() => {
    localStorage.setItem('spooky_expenses', JSON.stringify(expenses));
  }, [expenses]);

  useEffect(() => {
    localStorage.setItem('spooky_goals', JSON.stringify(goals));
  }, [goals]);

  useEffect(() => {
    localStorage.setItem('spooky_points', JSON.stringify(pumpkinPoints));
  }, [pumpkinPoints]);

  useEffect(() => {
    localStorage.setItem('spooky_quests', JSON.stringify(quests));
  }, [quests]);

  useEffect(() => {
    localStorage.setItem('spooky_badges', JSON.stringify(badges));
  }, [badges]);

  useEffect(() => {
    localStorage.setItem('spooky_trick_stats', JSON.stringify(trickStats));
  }, [trickStats]);

  useEffect(() => {
    localStorage.setItem('spooky_trick_history', JSON.stringify(trickHistory));
  }, [trickHistory]);

  // Evaluate badge unlocks automatically
  useEffect(() => {
    const totalSaved = goals.reduce((a, b) => a + b.currentAmount, 0);
    const hasCompletedGoal = goals.some((g) => g.currentAmount >= g.targetAmount);

    setBadges((prev) =>
      prev.map((b) => {
        if (b.id === 'badge-1' && expenses.length >= 1 && !b.unlocked) {
          return { ...b, unlocked: true, unlockedDate: 'Today' };
        }
        if (b.id === 'badge-2' && totalSaved >= 500 && !b.unlocked) {
          return { ...b, unlocked: true, unlockedDate: 'Today' };
        }
        if (b.id === 'badge-5' && hasCompletedGoal && !b.unlocked) {
          return { ...b, unlocked: true, unlockedDate: 'Today' };
        }
        return b;
      })
    );
  }, [expenses, goals]);

  // Add Expense Handler
  const handleAddExpense = (newExp: Omit<Expense, 'id'>) => {
    const created: Expense = {
      ...newExp,
      id: `exp-${Date.now()}`,
    };
    setExpenses((prev) => [created, ...prev]);
    setPumpkinPoints((p) => p + 10);
  };

  // Delete Expense Handler
  const handleDeleteExpense = (id: string) => {
    setExpenses((prev) => prev.filter((e) => e.id !== id));
  };

  // Add Goal Handler
  const handleAddGoal = (newGoal: Omit<SavingsGoal, 'id' | 'currentAmount'>) => {
    const created: SavingsGoal = {
      ...newGoal,
      id: `goal-${Date.now()}`,
      currentAmount: 0,
    };
    setGoals((prev) => [...prev, created]);
    setPumpkinPoints((p) => p + 30);
  };

  // Delete Goal Handler
  const handleDeleteGoal = (id: string) => {
    setGoals((prev) => prev.filter((g) => g.id !== id));
  };

  // Deposit to Goal Handler
  const handleDeposit = (goalId: string, amount: number) => {
    setGoals((prev) =>
      prev.map((g) => {
        if (g.id === goalId) {
          return { ...g, currentAmount: g.currentAmount + amount };
        }
        return g;
      })
    );
    setPumpkinPoints((p) => p + 50);
  };

  // Complete Quest Handler
  const handleCompleteQuest = (id: string) => {
    setQuests((prev) =>
      prev.map((q) => {
        if (q.id === id && !q.completed) {
          setPumpkinPoints((p) => p + q.pumpkinPoints);
          return { ...q, completed: true };
        }
        return q;
      })
    );
  };

  // Accept Mission from AI Mentor
  const handleAcceptMission = (mission: { title: string; action: string; potentialSavings: string; pumpkinPoints: number }) => {
    const newQuest: Quest = {
      id: `quest-${Date.now()}`,
      title: mission.title,
      action: mission.action,
      potentialSavings: mission.potentialSavings,
      pumpkinPoints: mission.pumpkinPoints,
      completed: false,
      category: 'habits',
    };
    setQuests((prev) => [newQuest, ...prev]);
  };

  // Trick purchase handler (Skipping impulse buy)
  const handleTrickPurchase = async (itemName: string, cost: number, depositGoalId?: string) => {
    let bonusPoints = Math.max(50, Math.min(250, Math.round(cost * 0.5)));
    let remark = `🎃 Masterful trick! You cast banishment on the ${budget.currency}${cost} impulse phantom! Your pumpkin stash swells with pride.`;

    try {
      const res = await fetch('/api/mentor/trick-or-treat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          itemName,
          cost,
          decision: 'trick',
          currency: budget.currency,
          currentStreak: trickStats.currentStreak,
        }),
      });
      const data = await res.json();
      if (data.success && data.data) {
        bonusPoints = data.data.bonusPoints || bonusPoints;
        remark = data.data.remark || remark;
      }
    } catch {
      // Fallback works automatically
    }

    // Award bonus pumpkin points
    setPumpkinPoints((p) => p + bonusPoints);

    // Update stats
    setTrickStats((prev) => ({
      totalTrickedSavings: prev.totalTrickedSavings + cost,
      tricksCount: prev.tricksCount + 1,
      treatsCount: prev.treatsCount,
      currentStreak: prev.currentStreak + 1,
    }));

    // If goal deposit requested, allocate directly
    if (depositGoalId) {
      setGoals((prev) =>
        prev.map((g) => (g.id === depositGoalId ? { ...g, currentAmount: g.currentAmount + cost } : g))
      );
    }

    // Append to history
    const newRecord: TrickOrTreatRecord = {
      id: `tt-${Date.now()}`,
      itemName,
      cost,
      decision: 'trick',
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      pointsAwarded: bonusPoints,
      aiRemark: remark,
    };
    setTrickHistory((prev) => [newRecord, ...prev]);

    return { points: bonusPoints, remark };
  };

  // Treat purchase handler (Mindful splurge within budget)
  const handleTreatPurchase = async (itemName: string, cost: number, category: any) => {
    let remark = `🍬 Mindful treat approved! Enjoy your ${itemName}, but brew your own potions tomorrow to keep the vault guarded.`;

    try {
      const res = await fetch('/api/mentor/trick-or-treat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          itemName,
          cost,
          decision: 'treat',
          currency: budget.currency,
          currentStreak: trickStats.currentStreak,
        }),
      });
      const data = await res.json();
      if (data.success && data.data) {
        remark = data.data.remark || remark;
      }
    } catch {
      // Fallback
    }

    // Log as expense
    handleAddExpense({
      title: `Treat: ${itemName}`,
      amount: cost,
      category: category || 'food',
      type: 'want',
      date: new Date().toISOString().split('T')[0],
      notes: 'Mindfully chosen treat from Trick or Treat game',
    });

    // Update stats (pause/reset streak, increment treatsCount)
    setTrickStats((prev) => ({
      totalTrickedSavings: prev.totalTrickedSavings,
      tricksCount: prev.tricksCount,
      treatsCount: prev.treatsCount + 1,
      currentStreak: 0,
    }));

    // Append to history
    const newRecord: TrickOrTreatRecord = {
      id: `tt-${Date.now()}`,
      itemName,
      cost,
      decision: 'treat',
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      pointsAwarded: 10,
      aiRemark: remark,
    };
    setTrickHistory((prev) => [newRecord, ...prev]);

    return { points: 10, remark };
  };

  // Sound Toggle
  const handleToggleSound = () => {
    const nextState = !soundEnabled;
    setSoundEnabled(nextState);
    sounds.enabled = nextState;
    if (nextState) sounds.playPumpkinCoin();
  };

  // Currency Change
  const handleCurrencyChange = (newCurrency: any) => {
    setBudget((b) => ({ ...b, currency: newCurrency }));
  };

  // Preset Switcher for Demo
  const handleLoadPreset = (presetKey: 'student' | 'pro' | 'minimal') => {
    sounds.playFanfare();
    if (presetKey === 'student') {
      setBudget(initialBudget);
      setExpenses(initialExpenses);
      setGoals(initialGoals);
      setPumpkinPoints(680);
      setQuests(initialQuests);
      setBadges(initialBadges);
      setTrickStats({ totalTrickedSavings: 420, tricksCount: 2, treatsCount: 1, currentStreak: 2 });
    } else if (presetKey === 'pro') {
      setBudget({
        totalBudget: 15000,
        period: 'monthly',
        currency: budget.currency,
        alertThreshold: 80,
      });
      setExpenses([
        { id: 'exp-p1', title: 'Studio Apartment Rent Share', amount: 6200, category: 'utilities', type: 'need', date: '2026-10-20' },
        { id: 'exp-p2', title: 'Weekly Gourmet Groceries', amount: 1850, category: 'food', type: 'need', date: '2026-10-22' },
        { id: 'exp-p3', title: 'Halloween Costume & Party Ticket', amount: 1450, category: 'entertainment', type: 'spooky-splurge', date: '2026-10-24' },
        { id: 'exp-p4', title: 'Gym & Crossfit Subscription', amount: 1200, category: 'utilities', type: 'want', date: '2026-10-25' },
      ]);
      setGoals([
        { id: 'goal-p1', title: '6-Month Emergency Vault', targetAmount: 40000, currentAmount: 18500, category: 'emergency' },
        { id: 'goal-p2', title: 'Tokyo Autumn Trip', targetAmount: 25000, currentAmount: 12000, category: 'travel' },
      ]);
      setPumpkinPoints(1450);
      setTrickStats({ totalTrickedSavings: 2800, tricksCount: 5, treatsCount: 2, currentStreak: 3 });
    } else {
      setBudget({
        totalBudget: 1000,
        period: 'monthly',
        currency: budget.currency,
        alertThreshold: 75,
      });
      setExpenses([]);
      setGoals([{ id: 'goal-m1', title: 'Starter Emergency Fund', targetAmount: 1000, currentAmount: 100, category: 'emergency' }]);
      setPumpkinPoints(100);
      setTrickStats({ totalTrickedSavings: 0, tricksCount: 0, treatsCount: 0, currentStreak: 0 });
    }
  };

  const totalSpent = expenses.reduce((a, b) => a + b.amount, 0);

  return (
    <div className="min-h-screen bg-[#0b0813] text-slate-100 flex flex-col font-sans selection:bg-orange-500/30 selection:text-orange-200">
      
      {/* Top Bar Header */}
      <Header
        currentTab={currentTab}
        onTabChange={setCurrentTab}
        pumpkinPoints={pumpkinPoints}
        onOpenAddExpense={() => setIsAddExpenseOpen(true)}
        soundEnabled={soundEnabled}
        onToggleSound={handleToggleSound}
        currency={budget.currency}
        onCurrencyChange={handleCurrencyChange}
      />

      {/* Main Viewport Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-3.5 sm:px-6 lg:px-8 py-4 sm:py-6 pb-28 md:pb-8 space-y-6">
        
        {/* Dynamic Budget Alert Banner */}
        <BudgetAlertBanner
          totalBudget={budget.totalBudget}
          totalSpent={totalSpent}
          currency={budget.currency}
          period={budget.period}
          alertThreshold={budget.alertThreshold}
          onConsultMentor={() => setCurrentTab('mentor')}
        />

        {/* Tab Views */}
        {currentTab === 'dashboard' && (
          <DashboardView
            budget={budget}
            expenses={expenses}
            goals={goals}
            pumpkinPoints={pumpkinPoints}
            trickStats={trickStats}
            onOpenAddExpense={() => setIsAddExpenseOpen(true)}
            onOpenEditBudget={() => setIsEditBudgetOpen(true)}
            onOpenDeposit={(goal) => setDepositGoal(goal)}
            onNavigateTab={setCurrentTab}
            onLoadPreset={handleLoadPreset}
          />
        )}

        {currentTab === 'trick-or-treat' && (
          <TrickOrTreatGame
            budget={budget}
            totalSpent={totalSpent}
            goals={goals}
            stats={trickStats}
            history={trickHistory}
            onTrickPurchase={handleTrickPurchase}
            onTreatPurchase={handleTreatPurchase}
            onNavigateTab={setCurrentTab}
          />
        )}

        {currentTab === 'expenses' && (
          <ExpenseTrackerView
            expenses={expenses}
            currency={budget.currency}
            onOpenAddExpense={() => setIsAddExpenseOpen(true)}
            onDeleteExpense={handleDeleteExpense}
          />
        )}

        {currentTab === 'goals' && (
          <SavingsGoalsView
            goals={goals}
            currency={budget.currency}
            onOpenAddGoal={() => setIsAddGoalOpen(true)}
            onOpenDeposit={(goal) => setDepositGoal(goal)}
            onDeleteGoal={handleDeleteGoal}
          />
        )}

        {currentTab === 'mentor' && (
          <AIMoneyMentorView
            budget={budget}
            expenses={expenses}
            goals={goals}
            pumpkinPoints={pumpkinPoints}
            onAcceptMission={handleAcceptMission}
          />
        )}

        {currentTab === 'challenges' && (
          <HalloweenChallengesView
            pumpkinPoints={pumpkinPoints}
            quests={quests}
            badges={badges}
            onCompleteQuest={handleCompleteQuest}
          />
        )}

      </main>

      {/* Modals */}
      <AddExpenseModal
        isOpen={isAddExpenseOpen}
        onClose={() => setIsAddExpenseOpen(false)}
        onAddExpense={handleAddExpense}
        currency={budget.currency}
      />

      <DepositGoalModal
        isOpen={!!depositGoal}
        onClose={() => setDepositGoal(null)}
        goal={depositGoal}
        currency={budget.currency}
        onDeposit={handleDeposit}
      />

      <AddGoalModal
        isOpen={isAddGoalOpen}
        onClose={() => setIsAddGoalOpen(false)}
        onAddGoal={handleAddGoal}
        currency={budget.currency}
      />

      <EditBudgetModal
        isOpen={isEditBudgetOpen}
        onClose={() => setIsEditBudgetOpen(false)}
        budgetConfig={budget}
        onSaveBudget={setBudget}
      />

      {/* Subtle Anti-Slop Footer */}
      <footer className="border-t border-purple-950/40 py-6 mt-12 bg-[#08050e] text-xs text-slate-500 mb-16 md:mb-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span>🎃</span>
            <span className="font-cinzel text-slate-400 font-semibold">SpookySaver</span>
            <span>·</span>
            <span>Turning scary spending habits into a fun Halloween quest</span>
          </div>
          <div className="flex items-center gap-4 text-[11px]">
            <span>Mobile iOS & Android Optimized</span>
            <span>·</span>
            <span>Tabular metrics</span>
            <span>·</span>
            <span>Gemini AI Mentor Ready</span>
          </div>
        </div>
      </footer>

      {/* Mobile Fixed Bottom Navigation for iOS & Android Phones */}
      <MobileBottomNav
        currentTab={currentTab}
        onTabChange={setCurrentTab}
        onOpenAddExpense={() => setIsAddExpenseOpen(true)}
      />

    </div>
  );
}
