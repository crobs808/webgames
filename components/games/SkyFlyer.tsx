'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useStore } from '@/lib/store';
import { GameScore } from '@/lib/types';

export default function SkyFlyer() {
  const router = useRouter();
  const { user, addScore } = useStore();
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [gameState, setGameState] = useState<'menu' | 'playing' | 'gameOver'>('menu');
  const [score, setScore] = useState(0);
  const [gameRunning, setGameRunning] = useState(false);

  // Game object
  const gameRef = useRef({
    bird: { x: 100, y: 150, width: 30, height: 30, velocity: 0, gravity: 0.4, jumpForce: -8 },
    pipes: [] as Array<{ x: number; gap: number; width: number; gapSize: number; scored?: boolean }>,
    score: 0,
    gameOver: false,
  });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const game = gameRef.current;
    let animationId: number;
    let frameCount = 0;

    const drawGame = () => {
      // Clear canvas
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      if (gameState === 'menu') {
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 40px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('Sky Flyer', canvas.width / 2, 80);
        ctx.font = '20px Arial';
        ctx.fillText('Click or Press Space to Start', canvas.width / 2, 150);
        ctx.fillText('Avoid the obstacles!', canvas.width / 2, 180);
      } else if (gameState === 'playing') {
        // Update bird
        game.bird.velocity += game.bird.gravity;
        game.bird.y += game.bird.velocity;

        // Draw bird
        ctx.fillStyle = '#fbbf24';
        ctx.beginPath();
        ctx.arc(game.bird.x, game.bird.y, game.bird.width / 2, 0, Math.PI * 2);
        ctx.fill();

        // Generate pipes
        frameCount++;
        if (frameCount % 120 === 0) {
          const gapSize = 120;
          const minGap = 50;
          const maxGap = canvas.height - gapSize - 50;
          const randomGap = Math.random() * (maxGap - minGap) + minGap;
          game.pipes.push({
            x: canvas.width,
            gap: randomGap,
            width: 60,
            gapSize,
          });
        }

        // Draw and update pipes
        game.pipes.forEach((pipe, index) => {
          pipe.x -= 4;

          // Draw pipes
          ctx.fillStyle = '#10b981';
          ctx.fillRect(pipe.x, 0, pipe.width, pipe.gap);
          ctx.fillRect(pipe.x, pipe.gap + pipe.gapSize, pipe.width, canvas.height);

          // Check collision
          if (
            game.bird.x + game.bird.width / 2 > pipe.x &&
            game.bird.x - game.bird.width / 2 < pipe.x + pipe.width
          ) {
            if (
              game.bird.y - game.bird.width / 2 < pipe.gap ||
              game.bird.y + game.bird.width / 2 > pipe.gap + pipe.gapSize
            ) {
              game.gameOver = true;
              setGameState('gameOver');
            }
          }

          // Increment score when passing pipe
          if (pipe.x + pipe.width < game.bird.x && !pipe.scored) {
            game.score += 10;
            setScore(game.score);
            (pipe as any).scored = true;
          }

          // Remove off-screen pipes
          if (pipe.x < -pipe.width) {
            game.pipes.splice(index, 1);
          }
        });

        // Check bounds
        if (game.bird.y > canvas.height || game.bird.y < 0) {
          game.gameOver = true;
          setGameState('gameOver');
        }
      } else if (gameState === 'gameOver') {
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 40px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('Game Over', canvas.width / 2, 100);
        ctx.font = '24px Arial';
        ctx.fillText(`Final Score: ${game.score}`, canvas.width / 2, 160);
        ctx.fillText('Click or Press Space to Restart', canvas.width / 2, 220);
      }

      if (gameState === 'playing' && !game.gameOver) {
        animationId = requestAnimationFrame(drawGame);
      }
    };

    drawGame();

    return () => cancelAnimationFrame(animationId);
  }, [gameState]);

  const handleJump = () => {
    if (gameState === 'menu') {
      setGameState('playing');
      gameRef.current.gameOver = false;
      gameRef.current.score = 0;
      setScore(0);
    } else if (gameState === 'playing') {
      gameRef.current.bird.velocity = gameRef.current.bird.jumpForce;
    } else if (gameState === 'gameOver') {
      setGameState('playing');
      gameRef.current = {
        bird: { x: 100, y: 150, width: 30, height: 30, velocity: 0, gravity: 0.4, jumpForce: -8 },
        pipes: [],
        score: 0,
        gameOver: false,
      };
      setScore(0);
    }
  };

  const handleFinish = () => {
    if (user) {
      const gameScore: GameScore = {
        id: `${user.id}_flappy_${Date.now()}`,
        userId: user.id,
        gameId: 'flappy',
        gameName: 'Sky Flyer',
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
        handleJump();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [gameState]);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-3xl font-bold">Sky Flyer</h1>
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
            <p className="text-3xl font-bold text-blue-400">{score}</p>
          </div>
        </div>

        {/* Canvas */}
        <canvas
          ref={canvasRef}
          width={400}
          height={400}
          onClick={handleJump}
          className="border-2 border-blue-400 rounded cursor-pointer"
        />
      </div>

      <div className="text-center mt-6 text-slate-400">
        <p>Click the canvas or press SPACE to jump</p>
      </div>
    </div>
  );
}
