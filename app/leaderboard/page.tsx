'use client';

import { useStore } from '@/lib/store';
import { Trophy, Medal } from 'lucide-react';

export default function LeaderboardPage() {
  const { getLeaderboard } = useStore();
  const leaderboard = getLeaderboard();

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <div className="mb-12">
        <div className="flex items-center gap-3 mb-4">
          <Trophy className="w-8 h-8 text-yellow-400" />
          <h1 className="text-5xl font-bold">Leaderboard</h1>
        </div>
        <p className="text-xl text-slate-400">
          Top players competing for the highest scores
        </p>
      </div>

      {leaderboard.length === 0 ? (
        <div className="text-center py-12 bg-slate-800 rounded-lg border border-slate-700">
          <p className="text-xl text-slate-400">No scores yet. Start playing to appear on the leaderboard!</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b-2 border-slate-700">
                <th className="px-6 py-4 text-left font-bold text-lg">Rank</th>
                <th className="px-6 py-4 text-left font-bold text-lg">Player</th>
                <th className="px-6 py-4 text-right font-bold text-lg">Total Score</th>
                <th className="px-6 py-4 text-right font-bold text-lg">Games Played</th>
                <th className="px-6 py-4 text-right font-bold text-lg">Achievements</th>
              </tr>
            </thead>
            <tbody>
              {leaderboard.map((entry) => (
                <tr
                  key={entry.userId}
                  className="border-b border-slate-700 hover:bg-slate-800/50 transition"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      {entry.rank === 1 && <Trophy className="w-5 h-5 text-yellow-400" />}
                      {entry.rank === 2 && <Medal className="w-5 h-5 text-slate-300" />}
                      {entry.rank === 3 && <Medal className="w-5 h-5 text-orange-400" />}
                      <span className="font-bold text-lg">#{entry.rank}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 font-semibold">{entry.username}</td>
                  <td className="px-6 py-4 text-right">
                    <span className="text-lg font-bold text-blue-400">{entry.totalScore}</span>
                  </td>
                  <td className="px-6 py-4 text-right text-slate-300">{entry.gameScores.length}</td>
                  <td className="px-6 py-4 text-right text-slate-300">{entry.achievements.length}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 bg-slate-800 rounded-lg border border-slate-700">
          <Trophy className="w-8 h-8 text-yellow-400 mb-3" />
          <h3 className="font-bold mb-2">Top Scorer</h3>
          <p className="text-2xl font-bold text-blue-400">
            {leaderboard[0]?.totalScore || 0}
          </p>
          <p className="text-slate-400 text-sm mt-1">
            by {leaderboard[0]?.username || 'N/A'}
          </p>
        </div>

        <div className="p-6 bg-slate-800 rounded-lg border border-slate-700">
          <Medal className="w-8 h-8 text-slate-300 mb-3" />
          <h3 className="font-bold mb-2">Total Players</h3>
          <p className="text-2xl font-bold text-purple-400">{leaderboard.length}</p>
        </div>

        <div className="p-6 bg-slate-800 rounded-lg border border-slate-700">
          <span className="text-2xl mb-3 block">🎮</span>
          <h3 className="font-bold mb-2">Total Games</h3>
          <p className="text-2xl font-bold text-pink-400">
            {leaderboard.reduce((sum, entry) => sum + entry.gameScores.length, 0)}
          </p>
        </div>
      </div>
    </div>
  );
}
