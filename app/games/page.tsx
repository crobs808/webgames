'use client';

import Link from 'next/link';
import { useStore } from '@/lib/store';
import GameCard from '@/components/GameCard';

export default function GamesPage() {
  const { games } = useStore();

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <div className="mb-12">
        <h1 className="text-5xl font-bold mb-4">Games</h1>
        <p className="text-xl text-slate-400">
          Choose a game and start playing. Every win earns points and achievements!
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {games.map((game) => (
          <Link key={game.id} href={`/games/${game.id}`}>
            <GameCard game={game} />
          </Link>
        ))}
      </div>
    </div>
  );
}
