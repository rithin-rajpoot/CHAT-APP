import { createSlice } from '@reduxjs/toolkit';
import { io } from 'socket.io-client';
import { logoutUserThunk } from '../user/userThunk';

const initialState = {
  socket: null,
  onlineUsers: [],
};

const socketSlice = createSlice({
  name: 'socket',
  initialState,
  reducers: {
    initializeSocket: (state, action) => {
      if (!state.socket) {
        const socket = io(import.meta.env.VITE_DB_ORIGIN, {
          query: { userId: action.payload },
        });
        state.socket = socket;
      }
    },
    setOnlineUsers: (state, action) => {
      state.onlineUsers = action.payload;
    },
    disconnectSocket: (state) => {
      if (state.socket) {
        state.socket.disconnect();
        state.socket = null;
      }
    },
  },
  extraReducers: (builder) => {
    // Reset socket state on logout
    builder.addCase(logoutUserThunk.fulfilled, (state) => {
      if (state.socket) {
        state.socket.disconnect();
        state.socket = null;
      }
      state.onlineUsers = [];
    });
  },
});

export const { initializeSocket, setOnlineUsers, disconnectSocket } = socketSlice.actions;
export default socketSlice.reducer;
