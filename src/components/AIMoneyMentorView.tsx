import React, { useState } from 'react';
import { 
  Sparkles, 
  Send, 
  Flame, 
  AlertTriangle, 
  ShieldCheck, 
  Skull, 
  Plus, 
  Check, 
  HelpCircle,
  MessageSquare,
  Zap,
  TrendingDown,
  RefreshCw
} from 'lucide-react';
import { BudgetConfig, Expense, SavingsGoal, MentorAnalysis, ImpulseAnalysis, Quest } from '../types';
import { sounds } from '../utils/audio';

interface AIMoneyMentorViewProps {
  budget: BudgetConfig;
  expenses: Expense[];
  goals: SavingsGoal[];
  pumpkinPoints: number;
  onAcceptMission: (mission: { title: string; action: string; potentialSavings: string; pumpkinPoints: number }) => void;
}

export const AIMoneyMentorView: React.FC<AIMoneyMentorViewProps> = ({
  budget,
  expenses,
  goals,
  pumpkinPoints,
  onAcceptMission,
}) => {
  const currency = budget.currency;
  const totalSpent = expenses.reduce((a, b) => a + b.amount, 0);

  // Analysis state
  const [analysis, setAnalysis] = useState<MentorAnalysis | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [acceptedMissions, setAcceptedMissions] = useState<string[]>([]);

  // Chat state
  const [chatMessages, setChatMessages] = useState<Array<{ role: 'user' | 'assistant'; text: string }>>([
    {
      role: 'assistant',
      text: `Greetings, mortal saver! 🎃 I am Professor Jack O'Lantern, your financial phantom. I've inspected your ${currency}${budget.totalBudget.toLocaleString()} ${budget.period} ledger. Ask me anything—from curbing terrifying late-night food splurges to harvesting your dream goal!`,
    },
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [chatLoading, setChatLoading] = useState(false);

  // Impulse Oracle state
  const [oracleItem, setOracleItem] = useState('');
  const [oracleCost, setOracleCost] = useState('');
  const [oracleReason, setOracleReason] = useState('');
  const [oracleLoading, setOracleLoading] = useState(false);
  const [oracleResult, setOracleResult] = useState<ImpulseAnalysis | null>(null);

  // Summon AI Analysis
  const handleRunAnalysis = async () => {
    setAnalyzing(true);
    sounds.playSpookyWhoosh();
    try {
      const res = await fetch('/api/mentor/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          budget: budget.totalBudget,
          period: budget.period,
          totalSpent,
          currency,
          expenses,
          goals,
          pumpkinPoints,
        }),
      });
      const json = await res.json();
      if (json.success && json.data) {
        setAnalysis(json.data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setAnalyzing(false);
    }
  };

  // Chat submit
  const handleSendMessage = async (e?: React.FormEvent, customText?: string) => {
    if (e) e.preventDefault();
    const query = customText || inputMessage.trim();
    if (!query || chatLoading) return;

    const newMessages = [...chatMessages, { role: 'user' as const, text: query }];
    setChatMessages(newMessages);
    setInputMessage('');
    setChatLoading(true);

    try {
      const res = await fetch('/api/mentor/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: query,
          history: newMessages.slice(-4).map(m => ({ role: m.role, content: m.text })),
          userContext: {
            budget: budget.totalBudget,
            totalSpent,
            currency,
            goals,
          },
        }),
      });
      const data = await res.json();
      if (data.success && data.reply) {
        setChatMessages(prev => [...prev, { role: 'assistant', text: data.reply }]);
        sounds.playPumpkinCoin();
      }
    } catch {
      setChatMessages(prev => [
        ...prev, 
        { role: 'assistant', text: `👻 The spectral winds whisper: prioritize your essential needs and deposit ${currency}50 into your vault today!` }
      ]);
    } finally {
      setChatLoading(false);
    }
  };

  // Impulse Oracle submit
  const handleRunOracle = async (e: React.FormEvent) => {
    e.preventDefault();
    const costNum = parseFloat(oracleCost);
    if (!oracleItem.trim() || isNaN(costNum) || costNum <= 0) return;

    setOracleLoading(true);
    sounds.playSpookyWhoosh();
    try {
      const res = await fetch('/api/mentor/impulse-check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          itemName: oracleItem.trim(),
          cost: costNum,
          reason: oracleReason.trim(),
          currency,
          budget: budget.totalBudget,
          totalSpent,
        }),
      });
      const data = await res.json();
      if (data.success && data.data) {
        setOracleResult(data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setOracleLoading(false);
    }
  };

  const handleAcceptMissionClick = (m: any) => {
    onAcceptMission(m);
    setAcceptedMissions(prev => [...prev, m.title]);
    sounds.playPumpkinCoin();
  };

  return (
    <div className="space-y-8">
      
      {/* Mentor Hero Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-[#17112b] via-[#1d1338] to-[#17112b] border border-purple-900/50 flex flex-col md:flex-row items-center gap-6 shadow-xl">
        <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl overflow-hidden border-2 border-orange-500/40 shrink-0 shadow-lg shadow-orange-950/40 relative">
          <img
            src="/src/assets/images/spooky_ghost_mentor_1793085117640.jpg"
            alt="Professor Jack O'Lantern"
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover"
          />
          <span className="absolute bottom-1 right-1 text-xs">📜</span>
        </div>

        <div className="flex-1 text-center md:text-left space-y-1">
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
            <h2 className="text-xl font-bold text-slate-100 font-cinzel">
              Professor Jack O'Lantern
            </h2>
            <span className="text-xs text-orange-400 font-semibold px-2 py-0.5 rounded bg-orange-950/50 border border-orange-500/30">
              AI Smart Savings Mentor
            </span>
          </div>
          <p className="text-xs text-slate-300 max-w-xl">
            Trained on disciplined student budgeting and thrifty habits. I detect financial ghouls in your ledger, roast frivolous impulse spending, and curate weekly saving quests.
          </p>
        </div>

        <button
          onClick={handleRunAnalysis}
          disabled={analyzing}
          className="flex items-center gap-2 px-5 py-3 text-xs font-semibold text-white bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 rounded-xl shadow-lg shadow-orange-950/50 transition-all cursor-pointer whitespace-nowrap shrink-0 disabled:opacity-50"
        >
          <Sparkles className="w-4 h-4 text-amber-200" />
          <span>{analyzing ? 'Summoning Spirits...' : 'Generate AI Savings Triage'}</span>
        </button>
      </div>

      {/* AI Analysis Cards (if run) */}
      {analysis && (
        <div className="p-6 rounded-2xl bg-[#130f24] border border-orange-500/40 space-y-6 shadow-xl animate-fadeIn">
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-purple-950/60 pb-4">
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-orange-400">
                AI Budget Diagnostic Report
              </span>
              <h3 className="text-lg font-bold text-slate-100 font-cinzel mt-0.5">
                Financial Health & Leak Triage
              </h3>
            </div>
            
            <div className="flex items-center gap-2 text-xs">
              <span className="text-slate-400">Danger Status:</span>
              <span className="px-2.5 py-1 rounded-md bg-purple-950 border border-purple-800 text-orange-300 font-semibold">
                {analysis.dangerLevel}
              </span>
            </div>
          </div>

          {/* Diagnosis & Roast Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-[#0e0a1b] border border-purple-950/80 space-y-1.5">
              <span className="text-xs uppercase font-bold tracking-wider text-slate-400 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                Spectral Assessment
              </span>
              <p className="text-xs text-slate-200 leading-relaxed">
                {analysis.diagnosis}
              </p>
            </div>

            <div className="p-4 rounded-xl bg-[#0e0a1b] border border-purple-950/80 space-y-1.5">
              <span className="text-xs uppercase font-bold tracking-wider text-rose-400 flex items-center gap-1.5">
                <Skull className="w-3.5 h-3.5 text-rose-400" />
                Playful Spooky Roast
              </span>
              <p className="text-xs text-slate-200 leading-relaxed italic">
                "{analysis.spookyRoast}"
              </p>
            </div>
          </div>

          {/* 3 Actionable Missions */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                Tailored Halloween Saving Missions
              </span>
              <span className="text-xs text-slate-400">
                Complete to earn Pumpkin Points
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {analysis.missions.map((m, idx) => {
                const isAccepted = acceptedMissions.includes(m.title);
                return (
                  <div
                    key={idx}
                    className="p-4 rounded-xl bg-[#17112b] border border-purple-900/60 flex flex-col justify-between space-y-3"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="text-xs font-bold text-orange-300">{m.title}</h4>
                        <span className="text-xs font-mono text-amber-300 font-semibold shrink-0">
                          +{m.pumpkinPoints} 🎃
                        </span>
                      </div>
                      <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                        {m.action}
                      </p>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-purple-950/60 text-xs">
                      <span className="text-slate-400">
                        Saves ~<strong className="text-emerald-400 font-mono tabular-nums">{m.potentialSavings}</strong>
                      </span>
                      <button
                        onClick={() => handleAcceptMissionClick(m)}
                        disabled={isAccepted}
                        className={`flex items-center gap-1 px-2.5 py-1 rounded text-xs font-semibold transition-colors cursor-pointer ${
                          isAccepted
                            ? 'bg-emerald-950/60 text-emerald-300 border border-emerald-500/40'
                            : 'bg-orange-600 hover:bg-orange-500 text-white'
                        }`}
                      >
                        {isAccepted ? <Check className="w-3 h-3" /> : <Plus className="w-3 h-3" />}
                        <span>{isAccepted ? 'Accepted' : 'Accept Quest'}</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>
      )}

      {/* 2-Column Split: Chat Terminal + Impulse Spender Oracle */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Interactive Chat with Professor Jack (7 cols) */}
        <div className="lg:col-span-7 rounded-2xl bg-[#130f24] border border-purple-900/50 overflow-hidden flex flex-col h-[560px] shadow-xl">
          
          {/* Header */}
          <div className="p-4 border-b border-purple-950/60 bg-purple-950/30 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <MessageSquare className="w-4 h-4 text-orange-400" />
              <h3 className="text-sm font-semibold text-slate-100 font-cinzel">
                Financial Ghost Consultation
              </h3>
            </div>
            <span className="text-[11px] text-slate-400">Gemini 3.8 Flash</span>
          </div>

          {/* Quick Prompts Strip */}
          <div className="p-3 bg-[#0e0a1b] border-b border-purple-950/40 flex items-center gap-2 overflow-x-auto text-[11px]">
            {[
              "How to save ₹1,000 this month?",
              "Roast my impulse cafe spending",
              "Food budget hacks for students",
              "How to build an emergency fund?"
            ].map((promptText, i) => (
              <button
                key={i}
                type="button"
                onClick={() => handleSendMessage(undefined, promptText)}
                className="px-2.5 py-1 rounded-full bg-[#18122c] hover:bg-purple-900/40 border border-purple-900/40 text-slate-300 hover:text-orange-300 whitespace-nowrap transition-colors cursor-pointer shrink-0"
              >
                {promptText}
              </button>
            ))}
          </div>

          {/* Messages Container */}
          <div className="flex-1 p-4 overflow-y-auto space-y-4 text-xs">
            {chatMessages.map((msg, i) => (
              <div
                key={i}
                className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.role === 'assistant' && (
                  <div className="w-7 h-7 rounded-full bg-orange-950/80 border border-orange-500/40 flex items-center justify-center text-xs shrink-0">
                    👻
                  </div>
                )}
                <div
                  className={`max-w-[85%] rounded-2xl p-3.5 leading-relaxed whitespace-pre-wrap ${
                    msg.role === 'user'
                      ? 'bg-orange-600 text-white rounded-tr-none'
                      : 'bg-[#18122c] border border-purple-900/60 text-slate-200 rounded-tl-none shadow'
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            ))}
            {chatLoading && (
              <div className="flex gap-3 justify-start">
                <div className="w-7 h-7 rounded-full bg-orange-950/80 border border-orange-500/40 flex items-center justify-center text-xs shrink-0 animate-bounce">
                  👻
                </div>
                <div className="rounded-2xl rounded-tl-none p-3 bg-[#18122c] border border-purple-900/60 text-slate-400 italic">
                  Professor Jack is consulting the ancient ledgers...
                </div>
              </div>
            )}
          </div>

          {/* Chat Input */}
          <form onSubmit={handleSendMessage} className="p-3 border-t border-purple-950/60 bg-[#0e0a1b] flex items-center gap-2">
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="Ask Professor Jack a money question..."
              className="flex-1 px-3.5 py-2 rounded-lg bg-[#140f26] border border-purple-900/50 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-orange-500"
            />
            <button
              type="submit"
              disabled={!inputMessage.trim() || chatLoading}
              className="p-2 rounded-lg bg-orange-600 hover:bg-orange-500 text-white transition-colors cursor-pointer disabled:opacity-40"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>

        </div>

        {/* Right Column: Spooky Impulse Buy Oracle (5 cols) */}
        <div className="lg:col-span-5 rounded-2xl bg-[#130f24] border border-purple-900/50 p-6 space-y-4 shadow-xl">
          
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-orange-950/80 border border-orange-500/30 flex items-center justify-center text-base">
              🔮
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-100 font-cinzel">
                Spooky Impulse Buy Oracle
              </h3>
              <p className="text-xs text-slate-400">
                Will this purchase haunt your wallet? Let the spirits evaluate.
              </p>
            </div>
          </div>

          <form onSubmit={handleRunOracle} className="space-y-3 pt-2">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                What are you tempted to buy?
              </label>
              <input
                type="text"
                required
                value={oracleItem}
                onChange={(e) => setOracleItem(e.target.value)}
                placeholder="e.g. Designer Sneakers, Extra Halloween treats, Gadget case"
                className="w-full px-3 py-2 rounded-lg bg-[#0e0a1b] border border-purple-900/50 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-orange-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Cost ({currency})
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2 text-slate-400 font-mono text-xs">{currency}</span>
                <input
                  type="number"
                  inputMode="decimal"
                  step="any"
                  min="1"
                  required
                  value={oracleCost}
                  onChange={(e) => setOracleCost(e.target.value)}
                  placeholder="450"
                  className="w-full pl-7 pr-3 py-2 rounded-lg bg-[#0e0a1b] border border-purple-900/50 text-xs text-slate-100 font-mono tabular-nums focus:outline-none focus:border-orange-500"
                />
              </div>
              <div className="flex items-center gap-1 mt-1 overflow-x-auto">
                {[100, 250, 500, 1000].map((quick) => (
                  <button
                    key={quick}
                    type="button"
                    onClick={() => setOracleCost(quick.toString())}
                    className="min-h-[30px] px-2 py-0.5 rounded bg-[#18122c] border border-purple-900/60 text-[10px] font-mono text-slate-300 hover:text-orange-300"
                  >
                    {currency}{quick}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Why do you want it right now?
              </label>
              <input
                type="text"
                value={oracleReason}
                onChange={(e) => setOracleReason(e.target.value)}
                placeholder="e.g. Saw an ad, bored study break, looks cool"
                className="w-full px-3 py-2 rounded-lg bg-[#0e0a1b] border border-purple-900/50 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-orange-500"
              />
            </div>

            <button
              type="submit"
              disabled={oracleLoading}
              className="w-full py-2.5 text-xs font-semibold text-white bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 rounded-lg shadow transition-all cursor-pointer disabled:opacity-50"
            >
              {oracleLoading ? 'Scrying the Cauldron...' : 'Summon Oracle Verdict'}
            </button>
          </form>

          {/* Oracle Result */}
          {oracleResult && (
            <div className="p-4 rounded-xl bg-[#0e0a1b] border border-orange-500/40 space-y-3 animate-fadeIn mt-4">
              <div className="flex items-center justify-between">
                <span className={`text-xs font-bold uppercase tracking-wider ${
                  oracleResult.verdict === 'Spooky Trap' ? 'text-rose-400' : 'text-emerald-400'
                }`}>
                  {oracleResult.verdict === 'Spooky Trap' ? '👻 Spooky Trap' : '🎃 Worthy Treat'}
                </span>
                <span className="text-xs text-slate-400">
                  Worth Score: <strong className="text-slate-100 font-mono">{oracleResult.score}/10</strong>
                </span>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed">
                {oracleResult.analysis}
              </p>

              <div className="p-2.5 rounded-lg bg-amber-950/20 border border-amber-500/20 text-xs space-y-1">
                <div className="text-amber-300 font-semibold">Ghost Suggestion:</div>
                <div className="text-slate-300">{oracleResult.alternative}</div>
              </div>

              <div className="text-[11px] text-slate-400">
                💰 {oracleResult.savingsEquivalent}
              </div>
            </div>
          )}

        </div>

      </div>

    </div>
  );
};
