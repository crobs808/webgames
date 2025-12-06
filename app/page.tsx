'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useStore } from '@/lib/store';
import { ArrowRight, Star, Trophy, Zap } from 'lucide-react';

export default function Home() {
  const router = useRouter();
  const { user, loginAsGuest, isLoading, loadPersistedUser } = useStore();
  const [username, setUsername] = useState('');
  const [showGuestForm, setShowGuestForm] = useState(false);

  useEffect(() => {
    loadPersistedUser();
  }, [loadPersistedUser]);

  const handleGuestLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (username.trim()) {
      await loginAsGuest(username);
      router.push('/games');
    }
  };

  if (user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-72px)] px-4">
        <div className="text-center mb-12">
          <h1 className="text-6xl font-bold mb-4 bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-transparent">
            Welcome back, {user.username}!
          </h1>
          <p className="text-xl text-slate-300 mb-8">
            Ready to play some games and climb the leaderboard?
          </p>
          <button
            onClick={() => router.push('/games')}
            className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 rounded-lg font-bold text-lg transition transform hover:scale-105"
          >
            Play Games <ArrowRight className="w-5 h-5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl">
          <div className="p-6 bg-slate-800 rounded-lg border border-slate-700 hover:border-blue-500 transition">
            <Trophy className="w-12 h-12 text-yellow-400 mb-4" />
            <h3 className="text-lg font-bold mb-2">Current Score</h3>
            <p className="text-3xl font-bold text-blue-400">{user.totalScore}</p>
          </div>

          <div className="p-6 bg-slate-800 rounded-lg border border-slate-700 hover:border-purple-500 transition">
            <Star className="w-12 h-12 text-purple-400 mb-4" />
            <h3 className="text-lg font-bold mb-2">Games Played</h3>
            <p className="text-3xl font-bold text-purple-400">0</p>
          </div>

          <div className="p-6 bg-slate-800 rounded-lg border border-slate-700 hover:border-pink-500 transition">
            <Zap className="w-12 h-12 text-pink-400 mb-4" />
            <h3 className="text-lg font-bold mb-2">Achievements</h3>
            <p className="text-3xl font-bold text-pink-400">0</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-72px)] px-4">
      <div className="text-center mb-12">
        <h1 className="text-6xl md:text-7xl font-bold mb-4 bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-transparent">
          Con Rob's Gamez
        </h1>
        <p className="text-2xl text-slate-300 mb-2">
          Play. Compete. Achieve. Dominate.
        </p>
        <p className="text-lg text-slate-400">
          A collection of fun, challenging, and addictive games
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mb-12">
        <div className="p-6 bg-slate-800/50 rounded-lg border border-slate-700 hover:border-blue-500 transition backdrop-blur">
          <Trophy className="w-12 h-12 text-yellow-400 mb-4 mx-auto" />
          <h3 className="text-lg font-bold mb-2 text-center">Leaderboards</h3>
          <p className="text-slate-300 text-center">
            Compete globally and climb the rankings
          </p>
        </div>

        <div className="p-6 bg-slate-800/50 rounded-lg border border-slate-700 hover:border-purple-500 transition backdrop-blur">
          <Star className="w-12 h-12 text-purple-400 mb-4 mx-auto" />
          <h3 className="text-lg font-bold mb-2 text-center">Achievements</h3>
          <p className="text-slate-300 text-center">
            Unlock badges and special challenges
          </p>
        </div>

        <div className="p-6 bg-slate-800/50 rounded-lg border border-slate-700 hover:border-pink-500 transition backdrop-blur">
          <Zap className="w-12 h-12 text-pink-400 mb-4 mx-auto" />
          <h3 className="text-lg font-bold mb-2 text-center">Multiplayer</h3>
          <p className="text-slate-300 text-center">
            Battle friends and players worldwide
          </p>
        </div>
      </div>

      <div className="space-y-4 w-full max-w-md">
        {!showGuestForm ? (
          <>
            <button
              onClick={() => setShowGuestForm(true)}
              className="w-full px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 rounded-lg font-bold text-lg transition transform hover:scale-105"
            >
              Play as Guest
            </button>
            <button
              className="w-full px-8 py-4 bg-slate-700 hover:bg-slate-600 rounded-lg font-bold text-lg transition"
              disabled
            >
              Sign in with Google (Coming Soon)
            </button>
            <button
              className="w-full px-8 py-4 bg-slate-700 hover:bg-slate-600 rounded-lg font-bold text-lg transition"
              disabled
            >
              Sign in with Discord (Coming Soon)
            </button>
          </>
        ) : (
          <form onSubmit={handleGuestLogin} className="space-y-4">
            <input
              type="text"
              placeholder="Enter your username..."
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              maxLength={20}
              className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg focus:border-blue-500 focus:outline-none text-white placeholder-slate-500"
              autoFocus
            />
            <button
              type="submit"
              disabled={!username.trim() || isLoading}
              className="w-full px-8 py-3 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 disabled:opacity-50 rounded-lg font-bold transition"
            >
              {isLoading ? 'Loading...' : 'Enter GameHub'}
            </button>
            <button
              type="button"
              onClick={() => setShowGuestForm(false)}
              className="w-full px-8 py-3 bg-slate-700 hover:bg-slate-600 rounded-lg font-bold transition"
            >
              Cancel
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
