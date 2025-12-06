'use client';

import { useParams, useRouter } from 'next/navigation';
import { useStore } from '@/lib/store';
import SkyFlyer from '@/components/games/SkyFlyer';
import Serpent from '@/components/games/Serpent';
import BlockStack from '@/components/games/BlockStack';
import BrickBreaker from '@/components/games/BrickBreaker';
import TankDuel from '@/components/games/TankDuel';

export default function GamePage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useStore();
  const gameId = params.id as string;

  if (!user) {
    router.push('/');
    return null;
  }

  const renderGame = () => {
    switch (gameId) {
      case 'flappy':
        return <SkyFlyer />;
      case 'snake':
        return <Serpent />;
      case 'tetris':
        return <BlockStack />;
      case 'breaker':
        return <BrickBreaker />;
      case 'tanks':
        return <TankDuel />;
      default:
        return (
          <div className="text-center py-12">
            <h1 className="text-3xl font-bold mb-4">Game Not Found</h1>
            <button
              onClick={() => router.push('/games')}
              className="px-4 py-2 bg-blue-500 hover:bg-blue-600 rounded transition"
            >
              Back to Games
            </button>
          </div>
        );
    }
  };

  return <div className="min-h-[calc(100vh-72px)]">{renderGame()}</div>;
}
