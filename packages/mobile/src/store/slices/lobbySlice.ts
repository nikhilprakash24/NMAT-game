import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface Player {
  userId: string;
  username: string;
  avatar?: string;
  isHost: boolean;
  isConnected: boolean;
}

interface LobbyState {
  sessionId: string | null;
  sessionCode: string | null;
  hostId: string | null;
  players: Player[];
  isInLobby: boolean;
}

const initialState: LobbyState = {
  sessionId: null,
  sessionCode: null,
  hostId: null,
  players: [],
  isInLobby: false,
};

const lobbySlice = createSlice({
  name: 'lobby',
  initialState,
  reducers: {
    joinedLobby: (state, action: PayloadAction<{ sessionId: string; sessionCode: string; hostId: string }>) => {
      state.sessionId = action.payload.sessionId;
      state.sessionCode = action.payload.sessionCode;
      state.hostId = action.payload.hostId;
      state.isInLobby = true;
    },
    leftLobby: (state) => {
      state.sessionId = null;
      state.sessionCode = null;
      state.hostId = null;
      state.players = [];
      state.isInLobby = false;
    },
    updatePlayers: (state, action: PayloadAction<Player[]>) => {
      state.players = action.payload;
    },
    playerJoined: (state, action: PayloadAction<Player>) => {
      const existing = state.players.find(p => p.userId === action.payload.userId);
      if (!existing) {
        state.players.push(action.payload);
      }
    },
    playerLeft: (state, action: PayloadAction<string>) => {
      state.players = state.players.filter(p => p.userId !== action.payload);
    },
    playerConnectionChanged: (state, action: PayloadAction<{ userId: string; isConnected: boolean }>) => {
      const player = state.players.find(p => p.userId === action.payload.userId);
      if (player) {
        player.isConnected = action.payload.isConnected;
      }
    },
  },
});

export const {
  joinedLobby,
  leftLobby,
  updatePlayers,
  playerJoined,
  playerLeft,
  playerConnectionChanged,
} = lobbySlice.actions;

export default lobbySlice.reducer;
