'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useStore } from '@/lib/store';
import { GameScore } from '@/lib/types';
import { useSwipe } from '@/lib/hooks/useSwipe';
import { isMobileDevice } from '@/lib/canvasUtils';

export default function Serpent() {
  const router = useRouter();
  const { user, addScore } = useStore();
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [gameState, setGameState] = useState<'menu' | 'playing' | 'gameOver'>('menu');
  const [score, setScore] = useState(0);

  const gameRef = useRef({
    snake: [{ x: 160, y: 160 }] as Array<{ x: number; y: number }>,
    food: { x: 300, y: 300 },
    direction: { x: 0, y: 0 },
    nextDirection: { x: 0, y: 0 },
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

      // Draw grid
      ctx.strokeStyle = '#1e293b';
      ctx.lineWidth = 0.5;
      for (let i = 0; i <= canvas.width; i += 20) {
        ctx.beginPath();
        ctx.moveTo(i, 0);
        ctx.lineTo(i, canvas.height);
        ctx.stroke();
      }
      for (let i = 0; i <= canvas.height; i += 20) {
        ctx.beginPath();
        ctx.moveTo(0, i);
        ctx.lineTo(canvas.width, i);
        ctx.stroke();
      }

      if (gameState === 'menu') {
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 40px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('Serpent', canvas.width / 2, 80);
        ctx.font = '20px Arial';
        ctx.fillText('Use Arrow Keys to Move', canvas.width / 2, 150);
        ctx.fillText('Click or Press Space to Start', canvas.width / 2, 180);
      } else if (gameState === 'playing') {
        frameCount++;
        
        // Calculate speed based on snake length (increases every 3 segments)
        // Start at 10 frames per move, decrease by 1 every time snake grows by 3
        const speedDivisor = Math.max(5, 10 - Math.floor((game.snake.length - 1) / 3));
        
        // Only update snake movement based on calculated speed
        if (frameCount % speedDivisor === 0) {
          // Update direction
          game.direction = { ...game.nextDirection };

          // Move snake
          const head = game.snake[game.snake.length - 1];
          const newHead = { x: head.x + game.direction.x * 20, y: head.y + game.direction.y * 20 };

          // Check bounds
          if (newHead.x < 0 || newHead.x >= canvas.width || newHead.y < 0 || newHead.y >= canvas.height) {
            game.gameOver = true;
            setGameState('gameOver');
          }

          // Check self collision
          if (game.snake.some((segment) => segment.x === newHead.x && segment.y === newHead.y)) {
            game.gameOver = true;
            setGameState('gameOver');
          }

          game.snake.push(newHead);

          // Check food collision
          if (newHead.x === game.food.x && newHead.y === game.food.y) {
            game.score += 10;
            setScore(game.score);
            // Spawn new food on the grid
            let newFood: { x: number; y: number };
            do {
              newFood = {
                x: Math.floor(Math.random() * (canvas.width / 20)) * 20,
                y: Math.floor(Math.random() * (canvas.height / 20)) * 20,
              };
            } while (game.snake.some((segment) => segment.x === newFood.x && segment.y === newFood.y));
            game.food = newFood;
          } else {
            game.snake.shift();
          }
        }

        // Draw snake
        game.snake.forEach((segment, index) => {
          if (index === game.snake.length - 1) {
            ctx.fillStyle = '#3b82f6';
          } else {
            ctx.fillStyle = '#10b981';
          }
          ctx.fillRect(segment.x, segment.y, 20, 20);
        });

        // Draw food
        ctx.fillStyle = '#f97316';
        ctx.beginPath();
        ctx.arc(game.food.x + 10, game.food.y + 10, 8, 0, Math.PI * 2);
        ctx.fill();

        // Draw score (outside canvas, on the left)
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 24px Arial';
        ctx.textAlign = 'left';
        // This will be drawn outside canvas bounds, we'll handle it differently
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

  const handleStart = () => {
    if (gameState === 'menu') {
      setGameState('playing');
      gameRef.current = {
        snake: [{ x: 160, y: 160 }],
        food: {
          x: Math.floor(Math.random() * (canvasRef.current?.width || 400) / 20) * 20,
          y: Math.floor(Math.random() * (canvasRef.current?.height || 400) / 20) * 20,
        },
        direction: { x: 1, y: 0 },
        nextDirection: { x: 1, y: 0 },
        score: 0,
        gameOver: false,
      };
      setScore(0);
    } else if (gameState === 'gameOver') {
      setGameState('playing');
      gameRef.current = {
        snake: [{ x: 160, y: 160 }],
        food: {
          x: Math.floor(Math.random() * (canvasRef.current?.width || 400) / 20) * 20,
          y: Math.floor(Math.random() * (canvasRef.current?.height || 400) / 20) * 20,
        },
        direction: { x: 1, y: 0 },
        nextDirection: { x: 1, y: 0 },
        score: 0,
        gameOver: false,
      };
      setScore(0);
    }
  };

  const handleFinish = () => {
    if (user) {
      const gameScore: GameScore = {
        id: `${user.id}_snake_${Date.now()}`,
        userId: user.id,
        gameId: 'snake',
        gameName: 'Serpent',
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

      // Prevent page scrolling for arrow keys regardless of game state
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.code)) {
        e.preventDefault();
      }

      if (gameState === 'playing') {
        const game = gameRef.current;
        switch (e.code) {
          case 'ArrowUp':
            if (game.direction.y === 0) game.nextDirection = { x: 0, y: -1 };
            break;
          case 'ArrowDown':
            if (game.direction.y === 0) game.nextDirection = { x: 0, y: 1 };
            break;
          case 'ArrowLeft':
            if (game.direction.x === 0) game.nextDirection = { x: -1, y: 0 };
            break;
          case 'ArrowRight':
            if (game.direction.x === 0) game.nextDirection = { x: 1, y: 0 };
            break;
        }
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [gameState]);

  // Add swipe controls for mobile
  useSwipe(canvasRef, {
    onTap: handleStart,
    onSwipeUp: () => {
      if (gameState === 'playing') {
        const game = gameRef.current;
        if (game.direction.y === 0) game.nextDirection = { x: 0, y: -1 };
      }
    },
    onSwipeDown: () => {
      if (gameState === 'playing') {
        const game = gameRef.current;
        if (game.direction.y === 0) game.nextDirection = { x: 0, y: 1 };
      }
    },
    onSwipeLeft: () => {
      if (gameState === 'playing') {
        const game = gameRef.current;
        if (game.direction.x === 0) game.nextDirection = { x: -1, y: 0 };
      }
    },
    onSwipeRight: () => {
      if (gameState === 'playing') {
        const game = gameRef.current;
        if (game.direction.x === 0) game.nextDirection = { x: 1, y: 0 };
      }
    },
  });

  const isMobile = typeof window !== 'undefined' && isMobileDevice();

  return (
    <div className="max-w-4xl mx-auto px-2 sm:px-4 py-4 sm:py-8">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl sm:text-3xl font-bold">Serpent</h1>
        <button
          onClick={handleFinish}
          className="px-3 py-1.5 sm:px-4 sm:py-2 bg-slate-700 hover:bg-slate-600 rounded transition text-sm sm:text-base"
        >
          Exit Game
        </button>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 sm:gap-8 justify-center items-center">
        {/* Stats on the left (or top on mobile) */}
        <div className="w-full sm:w-32 flex sm:flex-col gap-4 sm:gap-6">
          <div className="flex-1 sm:flex-none p-3 sm:p-4 bg-slate-800 rounded-lg border border-slate-700">
            <p className="text-slate-400 text-xs sm:text-sm font-semibold mb-1">SCORE</p>
            <p className="text-2xl sm:text-3xl font-bold text-green-400">{score}</p>
          </div>
          
          {gameState === 'playing' && (
            <div className="flex-1 sm:flex-none p-3 sm:p-4 bg-slate-800 rounded-lg border border-slate-700">
              <p className="text-slate-400 text-xs sm:text-sm font-semibold mb-1">SPEED</p>
              <p className="text-xl sm:text-2xl font-bold text-blue-400">
                {(10 - Math.floor((gameRef.current.snake.length - 1) / 3) * 0.5).toFixed(1)} MPH
              </p>
            </div>
          )}
        </div>

        {/* Canvas */}
        <canvas
          ref={canvasRef}
          width={400}
          height={400}
          onClick={handleStart}
          className="border-2 border-green-400 rounded cursor-pointer max-w-full touch-none"
          style={{ 
            width: isMobile ? 'min(90vw, 400px)' : '400px',
            height: isMobile ? 'min(90vw, 400px)' : '400px',
          }}
        />
      </div>

      <div className="text-center mt-4 sm:mt-6 text-slate-400 text-sm sm:text-base">
        <p>{isMobile ? 'Swipe to move the serpent' : 'Use Arrow Keys to move the serpent'}</p>
        {gameState !== 'playing' && (
          <p className="mt-2 text-slate-300">Score: {score}</p>
        )}
      </div>
    </div>
  );
}
