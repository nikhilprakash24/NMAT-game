import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RoundAnswers } from '@nmat/game-engine';

interface GameState {
  isPlaying: boolean;
  currentRound: number;
  currentLetter: string | null;
  roundDuration: number;
  timeRemaining: number | null;
  categories: any[];
  myAnswers: RoundAnswers;
  allAnswers: Record<string, RoundAnswers> | null;
  scores: Record<string, number>;
  totalScores: Record<string, number>;
  isFinished: boolean;
  winner: any | null;
}

const initialState: GameState = {
  isPlaying: false,
  currentRound: 0,
  currentLetter: null,
  roundDuration: 60,
  timeRemaining: null,
  categories: [],
  myAnswers: {},
  allAnswers: null,
  scores: {},
  totalScores: {},
  isFinished: false,
  winner: null,
};

const gameSlice = createSlice({
  name: 'game',
  initialState,
  reducers: {
    gameStarted: (state) => {
      state.isPlaying = true;
      state.currentRound = 0;
      state.isFinished = false;
    },
    roundStarted: (state, action: PayloadAction<{
      roundNumber: number;
      letter: string;
      duration: number;
      categories: any[];
    }>) => {
      state.currentRound = action.payload.roundNumber;
      state.currentLetter = action.payload.letter;
      state.roundDuration = action.payload.duration;
      state.timeRemaining = action.payload.duration;
      state.categories = action.payload.categories;
      state.myAnswers = {};
      state.allAnswers = null;
    },
    updateMyAnswers: (state, action: PayloadAction<RoundAnswers>) => {
      state.myAnswers = action.payload;
    },
    tickTimer: (state) => {
      if (state.timeRemaining !== null && state.timeRemaining > 0) {
        state.timeRemaining -= 1;
      }
    },
    roundEnded: (state) => {
      state.timeRemaining = 0;
    },
    answersRevealed: (state, action: PayloadAction<Record<string, RoundAnswers>>) => {
      state.allAnswers = action.payload;
    },
    roundScores: (state, action: PayloadAction<{
      scores: Record<string, number>;
      totalScores: Record<string, number>;
    }>) => {
      state.scores = action.payload.scores;
      state.totalScores = action.payload.totalScores;
    },
    gameFinished: (state, action: PayloadAction<{
      finalScores: Record<string, number>;
      winner: any;
    }>) => {
      state.isFinished = true;
      state.isPlaying = false;
      state.totalScores = action.payload.finalScores;
      state.winner = action.payload.winner;
    },
    resetGame: (state) => {
      return initialState;
    },
  },
});

export const {
  gameStarted,
  roundStarted,
  updateMyAnswers,
  tickTimer,
  roundEnded,
  answersRevealed,
  roundScores,
  gameFinished,
  resetGame,
} = gameSlice.actions;

export default gameSlice.reducer;
