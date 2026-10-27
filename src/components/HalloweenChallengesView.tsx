import React from 'react';
import { 
  Trophy, 
  Sparkles, 
  Check, 
  Flame, 
  ShieldAlert, 
  Moon, 
  Award,
  Zap,
  ArrowRight
} from 'lucide-react';
import { Quest, Badge } from '../types';
import { sounds } from '../utils/audio';

interface HalloweenChallengesViewProps {
  pumpkinPoints: number;
  quests: Quest[];
  badges: Badge[];
  onCompleteQuest: (questId: string) => void;
}

export const HalloweenChallengesView: React.FC<HalloweenChallengesViewProps> = ({
  pumpkinPoints,
  quests,
  badges,
  onCompleteQuest,
}) => {
  // Rank calculations
  const level = Math.floor(pumpkinPoints / 500) + 1;
  const currentTierPoints = pumpkinPoints % 500;
  const nextTierPoints = 500;
  const progressPercent = Math.min(100, Math.round((currentTierPoints / nextTierPoints) * 100));

  const getRankTitle = (lvl: number) => {
    switch (lvl) {
      case 1: return 'Spooky Novice 🕯️';
      case 2: return 'Pumpkin Apprentice 🎃';
      case 3: return 'Cauldron Master 🧪';
      case 4: return 'Phantom Treasurer 👻';
      default: return 'Jack-o-Lantern Archon 👑';
    }
  };

  const handleClaimQuest = (id: string) => {
    onCompleteQuest(id);
    sounds.playFanfare();
  };

  const getBadgeIcon = (name: string) => {
    switch (name) {
      case 'Flame': return <Flame className="w-5 h-5 text-orange-400" />;
      case 'Moon': return <Moon className="w-5 h-5 text-indigo-400" />;
      case 'ShieldAlert': return <ShieldAlert className="w-5 h-5 text-rose-400" />;
      case 'Trophy': return <Trophy className="w-5 h-5 text-amber-400" />;
      default: return <Sparkles className="w-5 h-5 text-emerald-400" />;
    }
  };

  return (
    <div className="space-y-8">
      
      {/* Title & Action Strip */}
      <div>
        <h2 className="text-xl font-bold text-slate-100 font-cinzel">
          Halloween Quests & Pumpkin Badges
        </h2>
        <p className="text-xs text-slate-400 mt-0.5">
          Turn disciplined saving into a thrilling Halloween quest. Earn pumpkin points and unlock spooky honor badges.
        </p>
      </div>

      {/* Pumpkin Level & Hunter Progression Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-[#17112b] via-[#22163d] to-[#17112b] border border-orange-500/40 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-orange-500 to-amber-600 flex items-center justify-center text-3xl shadow-lg shadow-orange-950/60 shrink-0">
              🎃
            </div>
            <div>
              <div className="text-xs uppercase font-bold tracking-wider text-orange-400">
                Level {level} Hunter
              </div>
              <h3 className="text-xl font-bold text-slate-100 font-cinzel mt-0.5">
                {getRankTitle(level)}
              </h3>
              <p className="text-xs text-slate-400">
                Total Acquired: <strong className="text-amber-300 font-mono tabular-nums">{pumpkinPoints.toLocaleString()} 🎃 Pumpkin Points</strong>
              </p>
            </div>
          </div>

          <div className="text-right hidden sm:block">
            <div className="text-xs text-slate-400">Next Level: {level + 1}</div>
            <div className="text-xs font-mono text-orange-300 mt-0.5 font-semibold">
              {nextTierPoints - currentTierPoints} points to level up
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="space-y-1.5 pt-1">
          <div className="w-full h-3 bg-[#0d0918] rounded-full overflow-hidden border border-purple-950">
            <div
              className="h-full bg-gradient-to-r from-orange-600 via-amber-500 to-yellow-400 rounded-full transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <div className="flex justify-between text-[11px] text-slate-400 font-mono tabular-nums">
            <span>{currentTierPoints} / {nextTierPoints} XP</span>
            <span>{progressPercent}% Complete</span>
          </div>
        </div>
      </div>

      {/* 2-Column Split: Active Quests + Badges Showcase */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Active Quests (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-100 font-cinzel">
              Active Money-Saving Quests
            </h3>
            <span className="text-xs text-slate-400">
              {quests.filter(q => q.completed).length}/{quests.length} Completed
            </span>
          </div>

          <div className="space-y-3">
            {quests.map((quest) => (
              <div
                key={quest.id}
                className={`p-4 rounded-xl bg-[#130f24] border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                  quest.completed 
                    ? 'border-emerald-500/30 bg-emerald-950/10 opacity-75' 
                    : 'border-purple-900/50 hover:border-orange-500/40'
                }`}
              >
                <div className="space-y-1 max-w-md">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-slate-100">{quest.title}</span>
                    <span className="text-xs font-mono text-orange-400 font-semibold tabular-nums">
                      +{quest.pumpkinPoints} 🎃
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    {quest.action}
                  </p>
                  <div className="text-[11px] text-emerald-400 font-medium">
                    Potential Savings: {quest.potentialSavings}
                  </div>
                </div>

                <div className="shrink-0">
                  {quest.completed ? (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-950/50 border border-emerald-500/40 text-xs font-semibold text-emerald-300">
                      <Check className="w-3.5 h-3.5" />
                      <span>Completed</span>
                    </span>
                  ) : (
                    <button
                      onClick={() => handleClaimQuest(quest.id)}
                      className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 rounded-lg shadow transition-all cursor-pointer whitespace-nowrap"
                    >
                      <span>Complete & Claim</span>
                      <Sparkles className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Badges Showcase (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-100 font-cinzel">
              Spooky Honor Badges
            </h3>
            <span className="text-xs text-slate-400">
              {badges.filter(b => b.unlocked).length}/{badges.length} Unlocked
            </span>
          </div>

          <div className="space-y-3">
            {badges.map((badge) => (
              <div
                key={badge.id}
                className={`p-3.5 rounded-xl border flex items-start gap-3.5 transition-all ${
                  badge.unlocked
                    ? 'bg-[#140f26] border-amber-500/40 shadow-sm'
                    : 'bg-[#0f0c1a] border-purple-950/60 opacity-60'
                }`}
              >
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border ${
                    badge.unlocked
                      ? 'bg-amber-950/40 border-amber-500/40 shadow-sm'
                      : 'bg-slate-900 border-slate-800 text-slate-600'
                  }`}
                >
                  {getBadgeIcon(badge.iconName)}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <h4 className="text-xs font-bold text-slate-100 truncate">{badge.title}</h4>
                    {badge.unlocked ? (
                      <span className="text-[10px] text-amber-300 font-semibold px-1.5 py-0.5 rounded bg-amber-950/60 border border-amber-500/30 shrink-0">
                        Unlocked
                      </span>
                    ) : (
                      <span className="text-[10px] text-slate-500 shrink-0">Locked</span>
                    )}
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5 leading-snug">
                    {badge.description}
                  </p>
                  <div className="text-[11px] text-slate-500 mt-1">
                    Criteria: {badge.criteria}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
};
