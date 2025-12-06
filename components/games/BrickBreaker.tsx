'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useStore } from '@/lib/store';
import { GameScore } from '@/lib/types';

export default function BrickBreaker() {
  const router = useRouter();
  const { user, addScore } = useStore();
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [gameState, setGameState] = useState<'menu' | 'playing' | 'gameOver'>('menu');
  const [score, setScore] = useState(0);

  const gameRef = useRef({
    paddle: { x: 150, y: 350, width: 100, height: 10, speed: 5 },
    ball: { x: 200, y: 330, radius: 5, vx: 3, vy: -4 },
    bricks: [] as Array<{ x: number; y: number; width: number; height: number; active: boolean; color: string }>,
    score: 0,
    gameOver: false,
    keys: { left: false, right: false },
  });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const game = gameRef.current;
    let animationId: number;

    // Initialize bricks
    if (game.bricks.length === 0 && gameState === 'playing') {
      const colors = ['#3b82f6', '#10b981', '#f97316', '#ef4444', '#a855f7'];
      for (let row = 0; row < 4; row++) {
        for (let col = 0; col < 6; col++) {
          game.bricks.push({
            x: col * 65 + 5,
            y: row * 20 + 20,
            width: 60,
            height: 15,
            active: true,
            color: colors[row],
          });
        }
      }
    }

    const drawGame = () => {
      // Clear canvas
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      if (gameState === 'menu') {
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 40px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('Brick Breaker', canvas.width / 2, 80);
        ctx.font = '20px Arial';
        ctx.fillText('Use Arrow Keys to Move', canvas.width / 2, 150);
        ctx.fillText('Click or Press Space to Start', canvas.width / 2, 180);
      } else if (gameState === 'playing') {
        // Draw bricks
        game.bricks.forEach((brick) => {
          if (brick.active) {
            ctx.fillStyle = brick.color;
            ctx.fillRect(brick.x, brick.y, brick.width, brick.height);
            ctx.strokeStyle = '#fff';
            ctx.lineWidth = 1;
            ctx.strokeRect(brick.x, brick.y, brick.width, brick.height);
          }
        });

        // Move paddle
        if (game.keys.left && game.paddle.x > 0) {
          game.paddle.x -= game.paddle.speed;
        }
        if (game.keys.right && game.paddle.x + game.paddle.width < canvas.width) {
          game.paddle.x += game.paddle.speed;
        }

        // Draw paddle
        ctx.fillStyle = '#3b82f6';
        ctx.fillRect(game.paddle.x, game.paddle.y, game.paddle.width, game.paddle.height);

        // Move ball
        game.ball.x += game.ball.vx;
        game.ball.y += game.ball.vy;

        // Ball collision with walls
        if (game.ball.x - game.ball.radius < 0 || game.ball.x + game.ball.radius > canvas.width) {
          game.ball.vx *= -1;
          game.ball.x = Math.max(game.ball.radius, Math.min(canvas.width - game.ball.radius, game.ball.x));
        }

        if (game.ball.y - game.ball.radius < 0) {
          game.ball.vy *= -1;
          game.ball.y = game.ball.radius;
        }

        // Ball collision with paddle
        if (
          game.ball.y + game.ball.radius > game.paddle.y &&
          game.ball.y - game.ball.radius < game.paddle.y + game.paddle.height &&
          game.ball.x > game.paddle.x &&
          game.ball.x < game.paddle.x + game.paddle.width
        ) {
          game.ball.vy *= -1;
          game.ball.y = game.paddle.y - game.ball.radius;
        }

        // Ball collision with bricks
        game.bricks.forEach((brick) => {
          if (brick.active) {
            if (
              game.ball.x > brick.x &&
              game.ball.x < brick.x + brick.width &&
              game.ball.y > brick.y &&
              game.ball.y < brick.y + brick.height
            ) {
              brick.active = false;
              game.ball.vy *= -1;
              game.score += 10;
              setScore(game.score);
            }
          }
        });

        // Draw ball
        ctx.fillStyle = '#fbbf24';
        ctx.beginPath();
        ctx.arc(game.ball.x, game.ball.y, game.ball.radius, 0, Math.PI * 2);
        ctx.fill();

        // Game over if ball falls
        if (game.ball.y > canvas.height) {
          game.gameOver = true;
          setGameState('gameOver');
        }

        // Win condition
        if (game.bricks.every((b) => !b.active)) {
          game.score += 100;
          setScore(game.score);
          game.gameOver = true;
          setGameState('gameOver');
        }
      } else if (gameState === 'gameOver') {
        const allBroken = game.bricks.every((b) => !b.active);
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 40px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(allBroken ? 'You Won!' : 'Game Over', canvas.width / 2, 100);
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
        paddle: { x: 150, y: 350, width: 100, height: 10, speed: 5 },
        ball: { x: 200, y: 330, radius: 5, vx: 3, vy: -4 },
        bricks: [],
        score: 0,
        gameOver: false,
        keys: { left: false, right: false },
      };
      setScore(0);
    } else if (gameState === 'gameOver') {
      setGameState('playing');
      gameRef.current = {
        paddle: { x: 150, y: 350, width: 100, height: 10, speed: 5 },
        ball: { x: 200, y: 330, radius: 5, vx: 3, vy: -4 },
        bricks: [],
        score: 0,
        gameOver: false,
        keys: { left: false, right: false },
      };
      setScore(0);
    }
  };

  const handleFinish = () => {
    if (user) {
      const gameScore: GameScore = {
        id: `${user.id}_breaker_${Date.now()}`,
        userId: user.id,
        gameId: 'breaker',
        gameName: 'Brick Breaker',
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
        handleStart();
      }

      if (gameState === 'playing') {
        const game = gameRef.current;
        switch (e.code) {
          case 'ArrowLeft':
            game.keys.left = true;
            break;
          case 'ArrowRight':
            game.keys.right = true;
            break;
        }
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      const game = gameRef.current;
      if (e.code === 'ArrowLeft') game.keys.left = false;
      if (e.code === 'ArrowRight') game.keys.right = false;
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
        <h1 className="text-3xl font-bold">Brick Breaker</h1>
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
            <p className="text-3xl font-bold text-orange-400">{score}</p>
          </div>
        </div>

        {/* Canvas */}
        <canvas
          ref={canvasRef}
          width={400}
          height={400}
          onClick={handleStart}
          className="border-2 border-orange-400 rounded cursor-pointer"
        />
      </div>

      <div className="text-center mt-6 text-slate-400">
        <p>Use Arrow Keys to move the paddle</p>
      </div>
    </div>
  );
}
