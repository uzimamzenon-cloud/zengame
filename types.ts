
export interface Personality {
  id: string;
  name: string;
  description: string;
  instruction: string;
  avatar: string;
  color: string;
  voiceName: 'Puck' | 'Charon' | 'Kore' | 'Fenrir' | 'Zephyr';
}

export interface TriviaQuestion {
  question: string;
  options: string[];
  answer: string;
  explanation: string;
  sourceUrls?: string[];
}

export interface Message {
  role: 'user' | 'model';
  text: string;
  timestamp: number;
}

export interface GameState {
  currentQuestionIndex: number;
  score: number;
  questions: TriviaQuestion[];
  isGameOver: boolean;
  status: 'idle' | 'loading' | 'playing' | 'thinking';
}
