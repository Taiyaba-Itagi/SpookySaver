import React from 'react';
import { 
  LayoutDashboard, 
  Receipt, 
  Plus, 
  Target, 
  Sparkles, 
  Bot 
} from 'lucide-react';
import { sounds } from '../utils/audio';

interface MobileBottomNavProps {
  currentTab: string;
  onTabChange: (tab: string) => void;
  onOpenAddExpense: () => void;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  currentTab,
  onTabChange,
  onOpenAddExpense,
}) => {
  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'expenses', label: 'Expenses', icon: Receipt },
    { id: 'trick-or-treat', label: 'Trick/Treat', icon: Sparkles },
    { id: 'goals', label: 'Goals', icon: Target },
    { id: 'mentor', label: 'AI Mentor', icon: Bot },
  ];

  return (
    <nav 
      aria-label="Mobile Navigation"
      className="fixed bottom-0 left-0 right-0 z-40 md:hidden bg-[#0c0916]/95 backdrop-blur-xl border-t border-purple-950/60 pb-safe shadow-2xl shadow-black"
    >
      <div className="grid grid-cols-5 items-center h-16 px-1 relative">
        
        {/* Tab 1: Dashboard */}
        <button
          onClick={() => {
            sounds.playSpookyWhoosh();
            onTabChange('dashboard');
          }}
          className={`min-h-[48px] flex flex-col items-center justify-center transition-colors cursor-pointer ${
            currentTab === 'dashboard' ? 'text-orange-400 font-semibold' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <LayoutDashboard className="w-5 h-5" />
          <span className="text-[10px] tracking-tight mt-1">Home</span>
        </button>

        {/* Tab 2: Expenses */}
        <button
          onClick={() => {
            sounds.playSpookyWhoosh();
            onTabChange('expenses');
          }}
          className={`min-h-[48px] flex flex-col items-center justify-center transition-colors cursor-pointer ${
            currentTab === 'expenses' ? 'text-orange-400 font-semibold' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Receipt className="w-5 h-5" />
          <span className="text-[10px] tracking-tight mt-1">Expenses</span>
        </button>

        {/* Center Quick Add Button (Thumb Zone for Phones) */}
        <div className="flex items-center justify-center -mt-5">
          <button
            onClick={() => {
              sounds.playPumpkinCoin();
              onOpenAddExpense();
            }}
            aria-label="Add Expense Amount"
            title="Add Amount"
            className="w-13 h-13 rounded-2xl bg-gradient-to-tr from-orange-600 via-amber-500 to-yellow-400 text-white flex flex-col items-center justify-center shadow-lg shadow-orange-500/30 border-2 border-[#0c0916] active:scale-90 transition-transform cursor-pointer"
          >
            <Plus className="w-6 h-6 stroke-[2.5]" />
          </button>
        </div>

        {/* Tab 3: Trick or Treat */}
        <button
          onClick={() => {
            sounds.playSpookyWhoosh();
            onTabChange('trick-or-treat');
          }}
          className={`min-h-[48px] flex flex-col items-center justify-center transition-colors cursor-pointer ${
            currentTab === 'trick-or-treat' ? 'text-orange-400 font-semibold' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Sparkles className="w-5 h-5" />
          <span className="text-[10px] tracking-tight mt-1">Trick/Treat</span>
        </button>

        {/* Tab 4: AI Mentor */}
        <button
          onClick={() => {
            sounds.playSpookyWhoosh();
            onTabChange('mentor');
          }}
          className={`min-h-[48px] flex flex-col items-center justify-center transition-colors cursor-pointer ${
            currentTab === 'mentor' ? 'text-orange-400 font-semibold' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Bot className="w-5 h-5" />
          <span className="text-[10px] tracking-tight mt-1">AI Mentor</span>
        </button>

      </div>
    </nav>
  );
};
