'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useStore } from '@/lib/store';
import { Gamepad2, Home, ChevronDown } from 'lucide-react';
import ProfileMenu from './ProfileMenu';

export default function Navigation() {
  const pathname = usePathname();
  const { user } = useStore();
  const [showGamesMenu, setShowGamesMenu] = useState(false);
  const { games } = useStore();

  return (
    <nav className="sticky top-0 z-50 bg-slate-900/95 backdrop-blur border-b border-slate-700">
      <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
        <div className="flex items-center gap-6">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent hover:opacity-80 transition">
            <Gamepad2 className="w-8 h-8 text-blue-400" />
            Con Rob's Gamez
          </Link>

          {user && (
            <>
              {/* Home Button */}
              <Link href="/games" className="flex items-center gap-1 px-3 py-2 hover:bg-slate-800 rounded transition font-medium text-slate-300 hover:text-white">
                <Home className="w-4 h-4" />
                Home
              </Link>

              {/* Games Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setShowGamesMenu(!showGamesMenu)}
                  className="flex items-center gap-1 px-3 py-2 hover:bg-slate-800 rounded transition font-medium text-slate-300 hover:text-white"
                >
                  Games
                  <ChevronDown className={`w-4 h-4 transition ${showGamesMenu ? 'rotate-180' : ''}`} />
                </button>

                {showGamesMenu && (
                  <div className="absolute left-0 mt-2 w-48 bg-slate-800 rounded-lg shadow-lg border border-slate-700">
                    {games.map((game, idx) => (
                      <Link
                        key={game.id}
                        href={`/games/${game.id}`}
                        className={`block px-4 py-3 hover:bg-slate-700 transition text-sm font-medium ${
                          idx === 0 ? 'rounded-t-lg' : ''
                        } ${idx === games.length - 1 ? 'rounded-b-lg' : ''}`}
                        onClick={() => setShowGamesMenu(false)}
                      >
                        <span className="mr-2">{game.icon}</span>
                        {game.name}
                      </Link>
                    ))}
                  </div>
                )}
              </div>

              {/* Other Nav Links */}
              <Link href="/leaderboard" className="text-slate-300 hover:text-blue-400 transition font-medium">
                Leaderboard
              </Link>
              <Link href="/achievements" className="text-slate-300 hover:text-blue-400 transition font-medium">
                Achievements
              </Link>
            </>
          )}
        </div>

        <div className="flex gap-6 items-center">
          {user ? (
            <ProfileMenu />
          ) : (
            <Link href="/" className="px-4 py-2 bg-blue-500 hover:bg-blue-600 rounded font-medium transition">
              Login
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
