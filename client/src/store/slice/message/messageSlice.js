import { createSlice } from '@reduxjs/toolkit'
import { clearChatThunk, sendMessageThunk } from './messageThunk';

const initialState = {
    buttonLoading: false,       // loading state for sending message button
    liveMessages: [],           // ⬅️ only stores *live* socket messages
    clearChatLoading: false,    // loading state for clearing chat
}

const messageSlice = createSlice({
    name: 'message',
    initialState,
    reducers: {
        // append new socket message
        setNewMessage: (state, action) => {
            state.liveMessages = [...state.liveMessages, action.payload];
        },

        // clear local live messages (e.g. when switching chat or on logout)
        resetLiveMessages: (state) => {
            state.liveMessages = [];
        }
    },
    extraReducers: (builder) => {
        // Send message
        builder.addCase(sendMessageThunk.pending, (state) => {
            state.buttonLoading = true;
        });

        builder.addCase(sendMessageThunk.fulfilled, (state, action) => { 
            // push sent message if API returns it
            state.liveMessages = [...state.liveMessages, action.payload.responseData];
            state.buttonLoading = false;
        });

        builder.addCase(sendMessageThunk.rejected, (state) => {
            state.buttonLoading = false;
        });

        // Clear chat
        builder.addCase(clearChatThunk.pending, (state) => {
            state.clearChatLoading = true;
        });

        builder.addCase(clearChatThunk.fulfilled, (state) => { 
            state.clearChatLoading = false;
            state.liveMessages = [];
        });

        builder.addCase(clearChatThunk.rejected, (state) => { 
            state.clearChatLoading = false;
        });
    },
})

export const { setNewMessage, resetLiveMessages } = messageSlice.actions;
export default messageSlice.reducer;
