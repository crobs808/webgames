'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useStore } from '@/lib/store';
import { GameScore } from '@/lib/types';

const GRID_WIDTH = 10;
const GRID_HEIGHT = 20;
const BLOCK_SIZE = 20;

export default function BlockStack() {
  const router = useRouter();
  const { user, addScore } = useStore();
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [gameState, setGameState] = useState<'menu' | 'playing' | 'gameOver'>('menu');
  const [score, setScore] = useState(0);

  const gameRef = useRef({
    grid: Array(GRID_HEIGHT * GRID_WIDTH).fill(0),
    currentPiece: null as any,
    score: 0,
    gameOver: false,
    level: 1,
  });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const game = gameRef.current;
    let animationId: number;
    let frameCount = 0;

    const TETROMINOES = [
      { shape: [[1, 1, 1, 1]], color: '#3b82f6' }, // I
      { shape: [[1, 1], [1, 1]], color: '#fbbf24' }, // O
      { shape: [[0, 1, 1], [1, 1, 0]], color: '#ef4444' }, // S
      { shape: [[1, 1, 0], [0, 1, 1]], color: '#10b981' }, // Z
      { shape: [[0, 1, 0], [1, 1, 1]], color: '#a855f7' }, // T
      { shape: [[0, 1], [1, 1], [1, 0]], color: '#f97316' }, // L
      { shape: [[1, 0], [1, 1], [0, 1]], color: '#06b6d4' }, // J
    ];

    const spawnPiece = () => {
      const tetromino = TETROMINOES[Math.floor(Math.random() * TETROMINOES.length)];
      return {
        shape: tetromino.shape,
        color: tetromino.color,
        x: Math.floor(GRID_WIDTH / 2) - 1,
        y: 0,
      };
    };

    const canPlace = (piece: any, x: number, y: number) => {
      for (let row = 0; row < piece.shape.length; row++) {
        for (let col = 0; col < piece.shape[row].length; col++) {
          if (piece.shape[row][col]) {
            const gridX = x + col;
            const gridY = y + row;

            if (gridX < 0 || gridX >= GRID_WIDTH || gridY >= GRID_HEIGHT) {
              return false;
            }

            if (gridY >= 0 && game.grid[gridY * GRID_WIDTH + gridX]) {
              return false;
            }
          }
        }
      }
      return true;
    };

    const placePiece = (piece: any, x: number, y: number) => {
      for (let row = 0; row < piece.shape.length; row++) {
        for (let col = 0; col < piece.shape[row].length; col++) {
          if (piece.shape[row][col]) {
            const gridX = x + col;
            const gridY = y + row;

            if (gridY >= 0 && gridY < GRID_HEIGHT) {
              game.grid[gridY * GRID_WIDTH + gridX] = piece.color;
            }
          }
        }
      }
    };

    const clearLines = () => {
      let linesCleared = 0;
      for (let row = GRID_HEIGHT - 1; row >= 0; row--) {
        let isFull = true;
        for (let col = 0; col < GRID_WIDTH; col++) {
          if (!game.grid[row * GRID_WIDTH + col]) {
            isFull = false;
            break;
          }
        }
        if (isFull) {
          game.grid.splice(row * GRID_WIDTH, GRID_WIDTH);
          game.grid.unshift(...Array(GRID_WIDTH).fill(0));
          linesCleared++;
        }
      }
      return linesCleared;
    };

    const drawGame = () => {
      // Clear canvas
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw grid
      ctx.strokeStyle = '#1e293b';
      ctx.lineWidth = 1;
      for (let i = 0; i <= GRID_WIDTH; i++) {
        ctx.beginPath();
        ctx.moveTo(i * BLOCK_SIZE, 0);
        ctx.lineTo(i * BLOCK_SIZE, GRID_HEIGHT * BLOCK_SIZE);
        ctx.stroke();
      }
      for (let i = 0; i <= GRID_HEIGHT; i++) {
        ctx.beginPath();
        ctx.moveTo(0, i * BLOCK_SIZE);
        ctx.lineTo(GRID_WIDTH * BLOCK_SIZE, i * BLOCK_SIZE);
        ctx.stroke();
      }

      if (gameState === 'menu') {
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 32px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('Block Stack', canvas.width / 2, 80);
        ctx.font = '18px Arial';
        ctx.fillText('Press Space or Click to Start', canvas.width / 2, 140);
      } else if (gameState === 'playing') {
        // Draw placed blocks
        for (let i = 0; i < game.grid.length; i++) {
          if (game.grid[i]) {
            const row = Math.floor(i / GRID_WIDTH);
            const col = i % GRID_WIDTH;
            ctx.fillStyle = game.grid[i];
            ctx.fillRect(col * BLOCK_SIZE + 1, row * BLOCK_SIZE + 1, BLOCK_SIZE - 2, BLOCK_SIZE - 2);
          }
        }

        // Draw current piece
        if (game.currentPiece) {
          for (let row = 0; row < game.currentPiece.shape.length; row++) {
            for (let col = 0; col < game.currentPiece.shape[row].length; col++) {
              if (game.currentPiece.shape[row][col]) {
                const x = game.currentPiece.x + col;
                const y = game.currentPiece.y + row;
                if (y >= 0) {
                  ctx.fillStyle = game.currentPiece.color;
                  ctx.fillRect(x * BLOCK_SIZE + 1, y * BLOCK_SIZE + 1, BLOCK_SIZE - 2, BLOCK_SIZE - 2);
                }
              }
            }
          }

          // Move piece down
          frameCount++;
          if (frameCount % (6 - Math.min(game.level - 1, 3)) === 0) {
            if (canPlace(game.currentPiece, game.currentPiece.x, game.currentPiece.y + 1)) {
              game.currentPiece.y++;
            } else {
              // Lock piece
              placePiece(game.currentPiece, game.currentPiece.x, game.currentPiece.y);
              const linesCleared = clearLines();
              game.score += linesCleared * 100;
              setScore(game.score);
              game.currentPiece = spawnPiece();

              // Check if piece doesn't fit
              if (!canPlace(game.currentPiece, game.currentPiece.x, game.currentPiece.y)) {
                game.gameOver = true;
                setGameState('gameOver');
              }
            }
          }
        }

      } else if (gameState === 'gameOver') {
        ctx.fillStyle = 'rgba(0,0,0,0.7)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 32px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('Game Over', canvas.width / 2, 80);
        ctx.font = '20px Arial';
        ctx.fillText(`Score: ${game.score}`, canvas.width / 2, 130);
        ctx.fillText('Click or Press Space to Restart', canvas.width / 2, 170);
      }

      if (gameState === 'playing' && !game.gameOver) {
        animationId = requestAnimationFrame(drawGame);
      }
    };

    if (!game.currentPiece && gameState === 'playing') {
      game.currentPiece = spawnPiece();
    }

    drawGame();

    return () => cancelAnimationFrame(animationId);
  }, [gameState]);

  const handleStart = () => {
    if (gameState === 'menu') {
      setGameState('playing');
      gameRef.current = {
        grid: Array(GRID_HEIGHT * GRID_WIDTH).fill(0),
        currentPiece: null,
        score: 0,
        gameOver: false,
        level: 1,
      };
      setScore(0);
    } else if (gameState === 'gameOver') {
      setGameState('playing');
      gameRef.current = {
        grid: Array(GRID_HEIGHT * GRID_WIDTH).fill(0),
        currentPiece: null,
        score: 0,
        gameOver: false,
        level: 1,
      };
      setScore(0);
    }
  };

  const handleFinish = () => {
    if (user) {
      const gameScore: GameScore = {
        id: `${user.id}_tetris_${Date.now()}`,
        userId: user.id,
        gameId: 'tetris',
        gameName: 'Block Stack',
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

      if (gameState === 'playing' && gameRef.current.currentPiece) {
        const game = gameRef.current;
        const piece = game.currentPiece;

        switch (e.code) {
          case 'ArrowLeft':
            if (canPlace(piece, piece.x - 1, piece.y)) {
              piece.x--;
            }
            break;
          case 'ArrowRight':
            if (canPlace(piece, piece.x + 1, piece.y)) {
              piece.x++;
            }
            break;
          case 'ArrowDown':
            if (canPlace(piece, piece.x, piece.y + 1)) {
              piece.y++;
            }
            break;
          case 'ArrowUp':
            // Rotate piece
            const rotated = piece.shape[0].map((_: any, i: number) =>
              piece.shape.map((row: any) => row[i]).reverse()
            );
            const originalShape = piece.shape;
            piece.shape = rotated;
            if (!canPlace(piece, piece.x, piece.y)) {
              piece.shape = originalShape;
            }
            break;
        }
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [gameState]);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-3xl font-bold">Block Stack</h1>
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
            <p className="text-3xl font-bold text-purple-400">{score}</p>
          </div>
          
          {gameState === 'playing' && (
            <div className="p-4 bg-slate-800 rounded-lg border border-slate-700">
              <p className="text-slate-400 text-sm font-semibold mb-1">LEVEL</p>
              <p className="text-2xl font-bold text-blue-400">1</p>
            </div>
          )}
        </div>

        {/* Canvas */}
        <canvas
          ref={canvasRef}
          width={200 + 80}
          height={400}
          onClick={handleStart}
          className="border-2 border-purple-400 rounded cursor-pointer"
        />
      </div>

      <div className="text-center mt-6 text-slate-400">
        <p>Arrow keys to move, Up arrow to rotate</p>
      </div>
    </div>
  );
}

function canPlace(piece: any, x: number, y: number) {
  for (let row = 0; row < piece.shape.length; row++) {
    for (let col = 0; col < piece.shape[row].length; col++) {
      if (piece.shape[row][col]) {
        const gridX = x + col;
        const gridY = y + row;

        if (gridX < 0 || gridX >= GRID_WIDTH || gridY >= GRID_HEIGHT) {
          return false;
        }
      }
    }
  }
  return true;
}
