import { create } from 'zustand';
import { User, GameScore, Achievement, Game, LeaderboardEntry } from './types';

interface Store {
  user: User | null;
  isLoading: boolean;
  error: string | null;
  games: Game[];
  scores: GameScore[];
  achievements: Achievement[];
  
  // Auth actions
  loginAsGuest: (username: string) => Promise<void>;
  logout: () => void;
  setUser: (user: User | null) => void;
  setError: (error: string | null) => void;
  loadPersistedUser: () => void;
  
  // Game actions
  addScore: (score: GameScore) => void;
  unlockAchievement: (achievement: Achievement) => void;
  getLeaderboard: () => LeaderboardEntry[];
  getUserAchievements: () => Achievement[];
  getGameStats: (gameId: string) => {
    gamesPlayed: number;
    bestScore: number;
    averageScore: number;
  };
}

export const useStore = create<Store>((set, get) => ({
  user: null,
  isLoading: false,
  error: null,
  games: [
    {
      id: 'flappy',
      name: 'Sky Flyer',
      description: 'Navigate through obstacles without crashing',
      icon: '🦅',
      color: 'from-blue-400 to-blue-600',
      gamesPlayed: 0,
      averageScore: 0,
    },
    {
      id: 'snake',
      name: 'Serpent',
      description: 'Grow longer by eating food while avoiding walls',
      icon: '🐍',
      color: 'from-green-400 to-green-600',
      gamesPlayed: 0,
      averageScore: 0,
    },
    {
      id: 'tetris',
      name: 'Block Stack',
      description: 'Arrange falling blocks to complete rows',
      icon: '🧩',
      color: 'from-purple-400 to-purple-600',
      gamesPlayed: 0,
      averageScore: 0,
    },
    {
      id: 'breaker',
      name: 'Brick Breaker',
      description: 'Use the paddle to bounce the ball and break bricks',
      icon: '🔨',
      color: 'from-orange-400 to-orange-600',
      gamesPlayed: 0,
      averageScore: 0,
    },
    {
      id: 'tanks',
      name: 'Tank Duel',
      description: 'Battle against opponents in tactical combat',
      icon: '🎯',
      color: 'from-red-400 to-red-600',
      gamesPlayed: 0,
      averageScore: 0,
    },
  ],
  scores: [],
  achievements: [],

  loginAsGuest: async (username: string) => {
    set({ isLoading: true, error: null });
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 500));
      
      const guestUser: User = {
        id: `guest_${Date.now()}`,
        username,
        isGuest: true,
        totalScore: 0,
        createdAt: new Date(),
      };
      
      // Persist to localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem('guestUser', JSON.stringify(guestUser));
      }
      
      set({ user: guestUser, isLoading: false });
    } catch (error) {
      set({ error: 'Failed to login as guest', isLoading: false });
    }
  },

  logout: () => {
    // Clear localStorage
    if (typeof window !== 'undefined') {
      localStorage.removeItem('guestUser');
    }
    set({ user: null, scores: [], achievements: [] });
  },

  setUser: (user: User | null) => {
    set({ user });
  },

  setError: (error: string | null) => {
    set({ error });
  },

  addScore: (score: GameScore) => {
    set((state) => {
      const newScores = [...state.scores, score];
      const totalScore = newScores.reduce((sum, s) => sum + s.score, 0);
      
      return {
        scores: newScores,
        user: state.user ? { ...state.user, totalScore } : null,
      };
    });
  },

  unlockAchievement: (achievement: Achievement) => {
    set((state) => {
      // Check if already unlocked
      if (state.achievements.some((a) => a.id === achievement.id)) {
        return state;
      }
      return {
        achievements: [...state.achievements, achievement],
      };
    });
  },

  
  loadPersistedUser: () => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('guestUser');
      if (stored) {
        try {
          const user = JSON.parse(stored);
          set({ user });
        } catch (e) {
          console.error('Failed to load persisted user:', e);
        }
      }
    }
  },

  getLeaderboard: () => {
    const { scores, achievements, user } = get();
    
    const leaderboardMap = new Map<string, LeaderboardEntry>();
    
    scores.forEach((score) => {
      if (!leaderboardMap.has(score.userId)) {
        leaderboardMap.set(score.userId, {
          userId: score.userId,
          username: score.userId, // In real app, get from user data
          totalScore: 0,
          gameScores: [],
          achievements: [],
          rank: 0,
        });
      }
      
      const entry = leaderboardMap.get(score.userId)!;
      entry.gameScores.push(score);
      entry.totalScore += score.score;
    });

    // Add achievements to entries
    if (user) {
      const userEntry = leaderboardMap.get(user.id);
      if (userEntry) {
        userEntry.achievements = achievements;
      }
    }

    // Sort by total score and assign ranks
    const sorted = Array.from(leaderboardMap.values())
      .sort((a, b) => b.totalScore - a.totalScore)
      .map((entry, index) => ({
        ...entry,
        rank: index + 1,
      }));

    return sorted;
  },

  getUserAchievements: () => {
    return get().achievements;
  },

  getGameStats: (gameId: string) => {
    const { scores } = get();
    const gameScores = scores.filter((s) => s.gameId === gameId);

    if (gameScores.length === 0) {
      return {
        gamesPlayed: 0,
        bestScore: 0,
        averageScore: 0,
      };
    }

    return {
      gamesPlayed: gameScores.length,
      bestScore: Math.max(...gameScores.map((s) => s.score)),
      averageScore:
        gameScores.reduce((sum, s) => sum + s.score, 0) / gameScores.length,
    };
  },
}));
