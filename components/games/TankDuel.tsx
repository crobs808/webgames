'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useStore } from '@/lib/store';
import { GameScore } from '@/lib/types';

export default function TankDuel() {
  const router = useRouter();
  const { user, addScore } = useStore();
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [gameState, setGameState] = useState<'menu' | 'playing' | 'gameOver'>('menu');
  const [score, setScore] = useState(0);

  const gameRef = useRef({
    playerTank: {
      x: 50,
      y: 150,
      width: 30,
      height: 30,
      angle: 0,
      health: 3,
      ammo: 10,
    },
    enemyTank: {
      x: 350,
      y: 150,
      width: 30,
      height: 30,
      angle: Math.PI,
      health: 3,
      ammo: 10,
    },
    projectiles: [] as Array<{ x: number; y: number; vx: number; vy: number; owner: 'player' | 'enemy' }>,
    score: 0,
    gameOver: false,
    keys: { w: false, a: false, d: false, space: false },
  });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const game = gameRef.current;
    let animationId: number;

    const drawGame = () => {
      // Clear canvas
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      if (gameState === 'menu') {
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 40px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('Tank Duel', canvas.width / 2, 80);
        ctx.font = '18px Arial';
        ctx.fillText('W/A/D to Move and Rotate', canvas.width / 2, 140);
        ctx.fillText('SPACE to Shoot', canvas.width / 2, 170);
        ctx.fillText('Click or Press Space to Start', canvas.width / 2, 220);
      } else if (gameState === 'playing') {
        // Update player tank
        if (game.keys.w) {
          game.playerTank.x += Math.cos(game.playerTank.angle) * 2;
          game.playerTank.y += Math.sin(game.playerTank.angle) * 2;
        }
        if (game.keys.a) game.playerTank.angle -= 0.1;
        if (game.keys.d) game.playerTank.angle += 0.1;

        // Keep tanks in bounds
        game.playerTank.x = Math.max(0, Math.min(canvas.width - game.playerTank.width, game.playerTank.x));
        game.playerTank.y = Math.max(0, Math.min(canvas.height - game.playerTank.height, game.playerTank.y));

        // AI Tank movement
        const dx = game.playerTank.x - game.enemyTank.x;
        const dy = game.playerTank.y - game.enemyTank.y;
        const targetAngle = Math.atan2(dy, dx);

        // Turn towards player
        if (Math.abs(targetAngle - game.enemyTank.angle) > 0.1) {
          game.enemyTank.angle += Math.sign(Math.sin(targetAngle - game.enemyTank.angle)) * 0.05;
        }

        // Move towards player if far
        const distance = Math.sqrt(dx * dx + dy * dy);
        if (distance > 100) {
          game.enemyTank.x += Math.cos(game.enemyTank.angle) * 1.5;
          game.enemyTank.y += Math.sin(game.enemyTank.angle) * 1.5;
        }

        game.enemyTank.x = Math.max(0, Math.min(canvas.width - game.enemyTank.width, game.enemyTank.x));
        game.enemyTank.y = Math.max(0, Math.min(canvas.height - game.enemyTank.height, game.enemyTank.y));

        // AI shooting
        if (Math.random() < 0.02 && game.enemyTank.ammo > 0) {
          game.projectiles.push({
            x: game.enemyTank.x + 15,
            y: game.enemyTank.y + 15,
            vx: Math.cos(game.enemyTank.angle) * 4,
            vy: Math.sin(game.enemyTank.angle) * 4,
            owner: 'enemy',
          });
          game.enemyTank.ammo--;
        }

        // Draw tanks
        const drawTank = (tank: any, color: string) => {
          ctx.save();
          ctx.translate(tank.x + tank.width / 2, tank.y + tank.height / 2);
          ctx.rotate(tank.angle);

          ctx.fillStyle = color;
          ctx.fillRect(-tank.width / 2, -tank.height / 2, tank.width, tank.height);

          ctx.fillStyle = '#aaa';
          ctx.fillRect(tank.width / 2 - 3, -3, 15, 6);

          ctx.restore();
        };

        drawTank(game.playerTank, '#3b82f6');
        drawTank(game.enemyTank, '#ef4444');

        // Update and draw projectiles
        game.projectiles = game.projectiles.filter((proj) => {
          proj.x += proj.vx;
          proj.y += proj.vy;

          ctx.fillStyle = proj.owner === 'player' ? '#fbbf24' : '#ff6b6b';
          ctx.beginPath();
          ctx.arc(proj.x, proj.y, 3, 0, Math.PI * 2);
          ctx.fill();

          // Check collision with tanks
          const targetTank = proj.owner === 'player' ? game.enemyTank : game.playerTank;

          if (
            proj.x > targetTank.x &&
            proj.x < targetTank.x + targetTank.width &&
            proj.y > targetTank.y &&
            proj.y < targetTank.y + targetTank.height
          ) {
            targetTank.health--;
            if (proj.owner === 'player') {
              game.score += 10;
              setScore(game.score);
            }
            return false;
          }

          return proj.x > 0 && proj.x < canvas.width && proj.y > 0 && proj.y < canvas.height;
        });

        // Check win/lose
        if (game.playerTank.health <= 0) {
          game.gameOver = true;
          setGameState('gameOver');
        }

        if (game.enemyTank.health <= 0) {
          game.score += 100;
          setScore(game.score);
          game.gameOver = true;
          setGameState('gameOver');
        }
      } else if (gameState === 'gameOver') {
        const playerWon = game.enemyTank.health <= 0;
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 40px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(playerWon ? 'Victory!' : 'Defeat!', canvas.width / 2, 100);
        ctx.font = '24px Arial';
        ctx.fillText(`Score: ${game.score}`, canvas.width / 2, 160);
        ctx.fillText('Click or Press Space to Restart', canvas.width / 2, 220);
      }

      if (gameState === 'playing' && !game.gameOver) {
        animationId = requestAnimationFrame(drawGame);
      }
    };

    drawGame();

    return () => cancelAnimationFrame(animationId);
  }, [gameState]);

  const handleStart = () => {
    if (gameState === 'menu') {
      setGameState('playing');
      gameRef.current = {
        playerTank: {
          x: 50,
          y: 150,
          width: 30,
          height: 30,
          angle: 0,
          health: 3,
          ammo: 10,
        },
        enemyTank: {
          x: 350,
          y: 150,
          width: 30,
          height: 30,
          angle: Math.PI,
          health: 3,
          ammo: 10,
        },
        projectiles: [],
        score: 0,
        gameOver: false,
        keys: { w: false, a: false, d: false, space: false },
      };
      setScore(0);
    } else if (gameState === 'gameOver') {
      setGameState('playing');
      gameRef.current = {
        playerTank: {
          x: 50,
          y: 150,
          width: 30,
          height: 30,
          angle: 0,
          health: 3,
          ammo: 10,
        },
        enemyTank: {
          x: 350,
          y: 150,
          width: 30,
          height: 30,
          angle: Math.PI,
          health: 3,
          ammo: 10,
        },
        projectiles: [],
        score: 0,
        gameOver: false,
        keys: { w: false, a: false, d: false, space: false },
      };
      setScore(0);
    }
  };

  const handleFinish = () => {
    if (user) {
      const gameScore: GameScore = {
        id: `${user.id}_tanks_${Date.now()}`,
        userId: user.id,
        gameId: 'tanks',
        gameName: 'Tank Duel',
        score,
        timestamp: new Date(),
      };
      addScore(gameScore);
    }
    router.push('/games');
  };

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        e.preventDefault();
        if (gameState !== 'playing') {
          handleStart();
        } else {
          const game = gameRef.current;
          if (game.playerTank.ammo > 0) {
            game.projectiles.push({
              x: game.playerTank.x + 15,
              y: game.playerTank.y + 15,
              vx: Math.cos(game.playerTank.angle) * 4,
              vy: Math.sin(game.playerTank.angle) * 4,
              owner: 'player',
            });
            game.playerTank.ammo--;
          }
        }
      }

      if (gameState === 'playing') {
        const game = gameRef.current;
        const code = e.key.toLowerCase();
        if (code === 'w') game.keys.w = true;
        if (code === 'a') game.keys.a = true;
        if (code === 'd') game.keys.d = true;
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      const game = gameRef.current;
      const code = e.key.toLowerCase();
      if (code === 'w') game.keys.w = false;
      if (code === 'a') game.keys.a = false;
      if (code === 'd') game.keys.d = false;
    };

    window.addEventListener('keydown', handleKeyPress);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyPress);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [gameState]);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-3xl font-bold">Tank Duel</h1>
        <button
          onClick={handleFinish}
          className="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded transition"
        >
          Exit Game
        </button>
      </div>

      <div className="flex gap-8 justify-center items-start">
        {/* Stats on the left */}
        <div className="w-32 space-y-6">
          <div className="p-4 bg-slate-800 rounded-lg border border-slate-700">
            <p className="text-slate-400 text-sm font-semibold mb-1">SCORE</p>
            <p className="text-3xl font-bold text-red-400">{score}</p>
          </div>
          
          {gameState === 'playing' && (
            <div className="p-4 bg-slate-800 rounded-lg border border-slate-700">
              <p className="text-slate-400 text-sm font-semibold mb-1">HEALTH</p>
              <p className="text-2xl font-bold text-yellow-400">{gameRef.current.playerTank.health}</p>
            </div>
          )}
        </div>

        {/* Canvas */}
        <canvas
          ref={canvasRef}
          width={400}
          height={300}
          onClick={handleStart}
          className="border-2 border-red-400 rounded cursor-pointer"
        />
      </div>

      <div className="text-center mt-6 text-slate-400">
        <p>W to move, A/D to rotate, SPACE to shoot</p>
      </div>
    </div>
  );
}
