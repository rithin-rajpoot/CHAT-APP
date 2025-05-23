import { createSlice } from '@reduxjs/toolkit'
import { getMessagesThunk, sendMessageThunk } from './messageThunk';

const initialState = {
    buttonLoading: false,
    messages: [],
    screenLoading: false,
}

const messageSlice = createSlice({
    name: 'message',
    initialState,
    reducers: {
        setNewMessage:(state, action) => {
            const oldMessages = state.messages ?? []; // if chatting with new user,the messages will be null so prevent it
            state.messages = [...oldMessages, action.payload]
        },
    },
    extraReducers: (builder) => {
        // Send message
        builder.addCase(sendMessageThunk.pending, (state, action) => {
            state.buttonLoading = true;
        });

        builder.addCase(sendMessageThunk.fulfilled, (state, action) => { 
            state.buttonLoading = false;
        });

        builder.addCase(sendMessageThunk.rejected, (state, action) => {
            state.buttonLoading = false;
        });


        // get messages
        builder.addCase(getMessagesThunk.pending, (state, action) => {
            state.buttonLoading = true;
        });

        builder.addCase(getMessagesThunk.fulfilled, (state, action) => { 
            state.buttonLoading = false;
            state.messages = action.payload?.responseData?.messages;
        });

        builder.addCase(getMessagesThunk.rejected, (state, action) => { 
            state.buttonLoading = false;
        });

    },
})
export const { setNewMessage } = messageSlice.actions;

export default messageSlice.reducer