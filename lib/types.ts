export interface User {
  id: string;
  username: string;
  email?: string;
  avatar?: string;
  totalScore: number;
  isGuest: boolean;
  createdAt: Date;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlockedAt?: Date;
}

export interface GameScore {
  id: string;
  userId: string;
  gameId: string;
  gameName: string;
  score: number;
  timestamp: Date;
}

export interface LeaderboardEntry {
  userId: string;
  username: string;
  totalScore: number;
  gameScores: GameScore[];
  achievements: Achievement[];
  rank: number;
}

export interface Game {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  bestScore?: number;
  gamesPlayed: number;
  averageScore: number;
}

export interface AuthState {
  user: User | null;
  isLoading: boolean;
  error: string | null;
  loginAsGuest: (username: string) => Promise<void>;
  logout: () => void;
  setUser: (user: User | null) => void;
}

export interface GameState {
  games: Game[];
  scores: GameScore[];
  achievements: Achievement[];
  addScore: (score: GameScore) => void;
  unlockAchievement: (achievement: Achievement) => void;
  getLeaderboard: () => LeaderboardEntry[];
}
