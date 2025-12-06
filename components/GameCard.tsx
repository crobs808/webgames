'use client';

import { Game } from '@/lib/types';
import { ArrowRight, Star, Zap } from 'lucide-react';

interface GameCardProps {
  game: Game;
}

export default function GameCard({ game }: GameCardProps) {
  return (
    <div className={`bg-gradient-to-br ${game.color} rounded-lg overflow-hidden hover:shadow-2xl transition transform hover:scale-105 cursor-pointer group`}>
      <div className="relative h-32 bg-black/20 flex items-center justify-center overflow-hidden">
        <div className="text-6xl group-hover:scale-110 transition">{game.icon}</div>
      </div>

      <div className="p-6">
        <h3 className="text-2xl font-bold mb-2 text-white">{game.name}</h3>
        <p className="text-white/80 text-sm mb-4">{game.description}</p>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="bg-white/10 rounded p-3">
            <div className="text-xs text-white/60 flex items-center gap-1 mb-1">
              <Zap className="w-3 h-3" />
              Games Played
            </div>
            <div className="text-lg font-bold text-white">{game.gamesPlayed}</div>
          </div>
          <div className="bg-white/10 rounded p-3">
            <div className="text-xs text-white/60 flex items-center gap-1 mb-1">
              <Star className="w-3 h-3" />
              Best Score
            </div>
            <div className="text-lg font-bold text-white">{game.bestScore || 0}</div>
          </div>
        </div>

        <button className="w-full bg-white/20 hover:bg-white/30 text-white font-bold py-2 px-4 rounded transition flex items-center justify-center gap-2">
          Play <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
