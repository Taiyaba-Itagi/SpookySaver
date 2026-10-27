import React, { useState, useMemo } from 'react';
import { 
  Plus, 
  Search, 
  Trash2, 
  Filter, 
  ArrowUpDown, 
  Sparkles, 
  Tag, 
  Calendar, 
  FileSpreadsheet,
  AlertCircle
} from 'lucide-react';
import { Expense, ExpenseCategory, ExpenseType } from '../types';
import { sounds } from '../utils/audio';

interface ExpenseTrackerViewProps {
  expenses: Expense[];
  currency: string;
  onOpenAddExpense: () => void;
  onDeleteExpense: (id: string) => void;
}

export const ExpenseTrackerView: React.FC<ExpenseTrackerViewProps> = ({
  expenses,
  currency,
  onOpenAddExpense,
  onDeleteExpense,
}) => {
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [sortField, setSortField] = useState<'date' | 'amount'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const filteredExpenses = useMemo(() => {
    return expenses
      .filter((exp) => {
        const matchesSearch = 
          exp.title.toLowerCase().includes(search.toLowerCase()) ||
          (exp.notes && exp.notes.toLowerCase().includes(search.toLowerCase()));
        const matchesCategory = categoryFilter === 'all' || exp.category === categoryFilter;
        const matchesType = typeFilter === 'all' || exp.type === typeFilter;
        return matchesSearch && matchesCategory && matchesType;
      })
      .sort((a, b) => {
        if (sortField === 'date') {
          const diff = new Date(b.date).getTime() - new Date(a.date).getTime();
          return sortOrder === 'desc' ? diff : -diff;
        } else {
          return sortOrder === 'desc' ? b.amount - a.amount : a.amount - b.amount;
        }
      });
  }, [expenses, search, categoryFilter, typeFilter, sortField, sortOrder]);

  const totalFiltered = filteredExpenses.reduce((sum, item) => sum + item.amount, 0);

  const handleDelete = (id: string) => {
    onDeleteExpense(id);
    sounds.playSpookyWhoosh();
  };

  const getCategoryEmoji = (cat: ExpenseCategory) => {
    switch (cat) {
      case 'food': return '🍲';
      case 'transport': return '🚆';
      case 'education': return '📚';
      case 'entertainment': return '🎭';
      case 'shopping': return '🛍️';
      case 'utilities': return '⚡';
      default: return '🔮';
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Title & Action Strip */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-100 font-cinzel">
            Haunted Expense Ledger
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Record every spending summon and expose unnecessary phantom leaks
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-xs text-slate-400 font-mono tabular-nums px-3 py-1.5 rounded-lg bg-[#140f26] border border-purple-900/50">
            Filtered Total: <strong className="text-orange-300">{currency}{totalFiltered.toLocaleString()}</strong>
          </div>
          <button
            onClick={onOpenAddExpense}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 rounded-lg shadow-md transition-all cursor-pointer whitespace-nowrap"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Record Expense</span>
          </button>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="p-4 rounded-xl bg-[#130f24] border border-purple-900/50 space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
          
          {/* Search Box */}
          <div className="sm:col-span-5 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by title or notes..."
              className="w-full pl-9 pr-3.5 py-2 rounded-lg bg-[#0e0a1b] border border-purple-900/50 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-orange-500"
            />
          </div>

          {/* Category Filter */}
          <div className="sm:col-span-4">
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-[#0e0a1b] border border-purple-900/50 text-xs text-slate-200 focus:outline-none focus:border-orange-500 cursor-pointer"
            >
              <option value="all">All Categories (All Spells)</option>
              <option value="food">🍲 Food & Treats</option>
              <option value="transport">🚆 Haunted Commute</option>
              <option value="education">📚 Spellbooks & Notes</option>
              <option value="entertainment">🎭 Spooky Entertainment</option>
              <option value="shopping">🛍️ Retail & Gear</option>
              <option value="utilities">⚡ Crypt & Utilities</option>
              <option value="other">🔮 Other Phantoms</option>
            </select>
          </div>

          {/* Type Filter */}
          <div className="sm:col-span-3">
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-[#0e0a1b] border border-purple-900/50 text-xs text-slate-200 focus:outline-none focus:border-orange-500 cursor-pointer"
            >
              <option value="all">All Types</option>
              <option value="need">🛡️ Vital Needs Only</option>
              <option value="want">🕯️ Modest Wants Only</option>
              <option value="spooky-splurge">👻 Spooky Splurges Only</option>
            </select>
          </div>

        </div>

        {/* Quick Segmented Sorting */}
        <div className="flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-purple-950/40">
          <span>Showing {filteredExpenses.length} entries</span>
          <div className="flex items-center gap-2">
            <span>Sort by:</span>
            <button
              onClick={() => {
                if (sortField === 'date') setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                else { setSortField('date'); setSortOrder('desc'); }
              }}
              className={`px-2 py-1 rounded cursor-pointer transition-colors ${sortField === 'date' ? 'bg-orange-950/40 text-orange-300 border border-orange-500/30' : 'text-slate-400 hover:text-slate-200'}`}
            >
              Date {sortField === 'date' && (sortOrder === 'desc' ? '↓' : '↑')}
            </button>
            <button
              onClick={() => {
                if (sortField === 'amount') setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                else { setSortField('amount'); setSortOrder('desc'); }
              }}
              className={`px-2 py-1 rounded cursor-pointer transition-colors ${sortField === 'amount' ? 'bg-orange-950/40 text-orange-300 border border-orange-500/30' : 'text-slate-400 hover:text-slate-200'}`}
            >
              Amount {sortField === 'amount' && (sortOrder === 'desc' ? '↓' : '↑')}
            </button>
          </div>
        </div>
      </div>

      {/* Ledger Table */}
      <div className="rounded-2xl bg-[#130f24] border border-purple-900/50 overflow-hidden shadow-xl">
        {filteredExpenses.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <div className="text-4xl">🎃</div>
            <h3 className="text-base font-semibold text-slate-200 font-cinzel">
              No haunted expenses found
            </h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Your ledger is peaceful. Either clear your filter or record a new expense to earn +10 Pumpkin Points!
            </p>
            <button
              onClick={onOpenAddExpense}
              className="mt-2 inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-orange-600 hover:bg-orange-500 rounded-lg shadow cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Log First Entry</span>
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-purple-950/60 bg-purple-950/20 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  <th className="py-3 px-4">Title & Notes</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Classification</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4 text-right">Amount</th>
                  <th className="py-3 px-4 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-purple-950/30 text-xs">
                {filteredExpenses.map((exp) => (
                  <tr key={exp.id} className="hover:bg-purple-950/20 transition-colors">
                    
                    {/* Title */}
                    <td className="py-3.5 px-4 font-medium text-slate-100 max-w-xs">
                      <div className="truncate">{exp.title}</div>
                      {exp.notes && (
                        <div className="text-[11px] text-slate-400 truncate mt-0.5">
                          {exp.notes}
                        </div>
                      )}
                    </td>

                    {/* Category */}
                    <td className="py-3.5 px-4 text-slate-300">
                      <span className="inline-flex items-center gap-1.5 text-xs">
                        <span>{getCategoryEmoji(exp.category)}</span>
                        <span className="capitalize">{exp.category}</span>
                      </span>
                    </td>

                    {/* Classification */}
                    <td className="py-3.5 px-4">
                      {exp.type === 'need' && (
                        <span className="text-emerald-400 text-xs font-medium">
                          🛡️ Vital Need
                        </span>
                      )}
                      {exp.type === 'want' && (
                        <span className="text-amber-400 text-xs font-medium">
                          🕯️ Modest Want
                        </span>
                      )}
                      {exp.type === 'spooky-splurge' && (
                        <span className="text-rose-400 text-xs font-semibold">
                          👻 Spooky Splurge
                        </span>
                      )}
                    </td>

                    {/* Date */}
                    <td className="py-3.5 px-4 text-slate-400 font-mono tabular-nums text-xs">
                      {exp.date}
                    </td>

                    {/* Amount */}
                    <td className="py-3.5 px-4 text-right font-mono tabular-nums font-bold text-sm text-slate-100">
                      {currency}{exp.amount.toLocaleString()}
                    </td>

                    {/* Delete action */}
                    <td className="py-3.5 px-4 text-center">
                      <button
                        onClick={() => handleDelete(exp.id)}
                        title="Delete expense"
                        aria-label={`Delete ${exp.title}`}
                        className="p-1 text-slate-500 hover:text-rose-400 hover:bg-rose-950/30 rounded transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>

                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
};
