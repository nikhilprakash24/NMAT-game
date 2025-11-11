import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface UserState {
  userId: string | null;
  username: string | null;
  avatar?: string;
  isConnected: boolean;
}

const initialState: UserState = {
  userId: null,
  username: null,
  avatar: undefined,
  isConnected: false,
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<{ userId: string; username: string; avatar?: string }>) => {
      state.userId = action.payload.userId;
      state.username = action.payload.username;
      state.avatar = action.payload.avatar;
    },
    setConnected: (state, action: PayloadAction<boolean>) => {
      state.isConnected = action.payload;
    },
    clearUser: (state) => {
      state.userId = null;
      state.username = null;
      state.avatar = undefined;
      state.isConnected = false;
    },
  },
});

export const { setUser, setConnected, clearUser } = userSlice.actions;
export default userSlice.reducer;
