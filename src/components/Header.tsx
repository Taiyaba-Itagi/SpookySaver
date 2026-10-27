import React from 'react';
import { Sparkles, Plus, Volume2, VolumeX } from 'lucide-react';
import { sounds } from '../utils/audio';

interface HeaderProps {
  currentTab: string;
  onTabChange: (tab: string) => void;
  pumpkinPoints: number;
  onOpenAddExpense: () => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
  currency: string;
  onCurrencyChange: (c: any) => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  onTabChange,
  pumpkinPoints,
  onOpenAddExpense,
  soundEnabled,
  onToggleSound,
  currency,
  onCurrencyChange,
}) => {
  const navLinks = [
    { id: 'dashboard', label: 'Dashboard' },
    { id: 'expenses', label: 'Expenses' },
    { id: 'goals', label: 'Savings Goals' },
    { id: 'trick-or-treat', label: 'Trick or Treat 🍬' },
    { id: 'mentor', label: 'AI Mentor' },
    { id: 'challenges', label: 'Quests' },
  ];

  return (
    <header className="sticky top-0 z-40 bg-[#0c0915]/90 backdrop-blur-md border-b border-purple-950/40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-8">
        
        {/* Zone 1: Single text element wordmark */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-orange-500 to-amber-600 flex items-center justify-center shadow-lg shadow-orange-500/20 text-lg">
            🎃
          </div>
          <span 
            onClick={() => onTabChange('dashboard')} 
            className="text-xl font-bold tracking-tight text-white cursor-pointer select-none font-cinzel hover:text-orange-400 transition-colors whitespace-nowrap"
          >
            SpookySaver
          </span>
        </div>

        {/* Zone 2: 4–5 clean single-line text navigation links */}
        <nav className="hidden md:flex items-center gap-7 text-sm font-medium">
          {navLinks.map((link) => {
            const isActive = currentTab === link.id;
            return (
              <button
                key={link.id}
                onClick={() => {
                  sounds.playSpookyWhoosh();
                  onTabChange(link.id);
                }}
                className={`transition-colors whitespace-nowrap cursor-pointer py-1 relative ${
                  isActive
                    ? 'text-orange-400 font-semibold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {link.label}
                {isActive && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-orange-500 to-amber-400 rounded-full" />
                )}
              </button>
            );
          })}
        </nav>

        {/* Zone 3: 1 primary action + compact essentials */}
        <div className="flex items-center gap-3 shrink-0">
          {/* Pumpkin Points Indicator */}
          <div 
            title="Pumpkin Points earned from smart budgeting"
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-orange-950/40 border border-orange-500/30 text-xs font-semibold text-orange-300 tabular-nums"
          >
            <span>🎃</span>
            <span>{pumpkinPoints.toLocaleString()}</span>
          </div>

          {/* Currency Selector */}
          <select
            value={currency}
            aria-label="Select currency"
            onChange={(e) => onCurrencyChange(e.target.value)}
            className="bg-[#171126] border border-purple-900/60 text-xs text-slate-300 rounded-lg px-2 py-1.5 focus:outline-none focus:border-orange-500 transition-colors cursor-pointer"
          >
            <option value="₹">₹ INR</option>
            <option value="$">$ USD</option>
            <option value="€">€ EUR</option>
            <option value="£">£ GBP</option>
          </select>

          {/* Sound Toggle */}
          <button
            onClick={onToggleSound}
            title={soundEnabled ? 'Mute sound effects' : 'Enable sound effects'}
            className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-purple-950/50 rounded-lg transition-colors cursor-pointer"
          >
            {soundEnabled ? <Volume2 className="w-4 h-4 text-orange-400" /> : <VolumeX className="w-4 h-4" />}
          </button>

          {/* Primary CTA */}
          <button
            onClick={onOpenAddExpense}
            className="flex items-center gap-1.5 px-3 py-1.5 sm:px-3.5 sm:py-1.5 text-xs font-semibold text-white bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 rounded-lg shadow-md shadow-orange-950/50 hover:shadow-orange-500/20 transition-all cursor-pointer whitespace-nowrap active:scale-95"
          >
            <Plus className="w-3.5 h-3.5" />
            <span className="hidden xs:inline">Add Expense</span>
            <span className="xs:hidden">Add</span>
          </button>
        </div>

      </div>
    </header>
  );
};
