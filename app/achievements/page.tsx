'use client';

import { useStore } from '@/lib/store';
import { Star, Lock, Zap, Trophy } from 'lucide-react';

const DEFAULT_ACHIEVEMENTS = [
  {
    id: 'first-score',
    name: 'First Steps',
    description: 'Score your first points',
    icon: '🎮',
    locked: true,
  },
  {
    id: 'score-100',
    name: 'Century',
    description: 'Reach 100 total points',
    icon: '💯',
    locked: true,
  },
  {
    id: 'score-1000',
    name: 'Millionaire',
    description: 'Reach 1000 total points',
    icon: '💰',
    locked: true,
  },
  {
    id: 'play-5-games',
    name: 'Warm Up',
    description: 'Play 5 different games',
    icon: '🔥',
    locked: true,
  },
  {
    id: 'snake-50',
    name: 'Serpent Master',
    description: 'Score 50 points in Serpent',
    icon: '🐍',
    locked: true,
  },
  {
    id: 'flappy-20',
    name: 'Sky Guardian',
    description: 'Score 20 points in Sky Flyer',
    icon: '🪶',
    locked: true,
  },
  {
    id: 'blocks-100',
    name: 'Stack Builder',
    description: 'Clear 100 lines in Block Stack',
    icon: '🧩',
    locked: true,
  },
  {
    id: 'comeback',
    name: 'Comeback Kid',
    description: 'Recover from 0 to win',
    icon: '⚡',
    locked: true,
  },
  {
    id: 'perfectionist',
    name: 'Perfectionist',
    description: 'Achieve 100% accuracy in any game',
    icon: '✨',
    locked: true,
  },
  {
    id: 'legend',
    name: 'Legend',
    description: 'Reach #1 on the leaderboard',
    icon: '👑',
    locked: true,
  },
];

export default function AchievementsPage() {
  const { user, achievements } = useStore();
  const unlockedIds = new Set(achievements.map((a) => a.id));

  const displayAchievements = DEFAULT_ACHIEVEMENTS.map((achievement) => ({
    ...achievement,
    locked: !unlockedIds.has(achievement.id),
  }));

  const unlockedCount = displayAchievements.filter((a) => !a.locked).length;

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <div className="mb-12">
        <div className="flex items-center gap-3 mb-4">
          <Star className="w-8 h-8 text-purple-400" />
          <h1 className="text-5xl font-bold">Achievements</h1>
        </div>
        <p className="text-xl text-slate-400">
          Unlock badges by accomplishing special challenges
        </p>
      </div>

      <div className="mb-8 p-6 bg-gradient-to-r from-purple-900/20 to-pink-900/20 rounded-lg border border-purple-700">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold mb-2">Your Progress</h2>
            <p className="text-slate-300">
              {unlockedCount} of {displayAchievements.length} achievements unlocked
            </p>
          </div>
          <div className="text-right">
            <div className="text-4xl font-bold text-purple-400">
              {Math.round((unlockedCount / displayAchievements.length) * 100)}%
            </div>
          </div>
        </div>
        <div className="mt-4 bg-slate-700 rounded-full h-2 overflow-hidden">
          <div
            className="bg-gradient-to-r from-purple-400 to-pink-500 h-full transition-all duration-500"
            style={{ width: `${(unlockedCount / displayAchievements.length) * 100}%` }}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {displayAchievements.map((achievement) => (
          <div
            key={achievement.id}
            className={`p-6 rounded-lg border-2 transition ${
              achievement.locked
                ? 'bg-slate-800/50 border-slate-700 opacity-60'
                : 'bg-gradient-to-br from-purple-900/40 to-pink-900/40 border-purple-600 hover:border-purple-400'
            }`}
          >
            <div className="flex items-start justify-between mb-3">
              <div className="text-4xl">{achievement.icon}</div>
              {achievement.locked && <Lock className="w-5 h-5 text-slate-500" />}
              {!achievement.locked && (
                <Trophy className="w-5 h-5 text-yellow-400" />
              )}
            </div>

            <h3 className="font-bold text-lg mb-1">{achievement.name}</h3>
            <p className="text-sm text-slate-300">{achievement.description}</p>

            {!achievement.locked && (
              <div className="mt-3 text-xs text-green-400 font-semibold">
                ✓ Unlocked
              </div>
            )}
          </div>
        ))}
      </div>

      {unlockedCount === 0 && (
        <div className="mt-12 text-center p-8 bg-slate-800 rounded-lg border border-slate-700">
          <Zap className="w-12 h-12 text-slate-500 mx-auto mb-4" />
          <p className="text-xl text-slate-300">
            Start playing games to unlock achievements!
          </p>
        </div>
      )}
    </div>
  );
}
