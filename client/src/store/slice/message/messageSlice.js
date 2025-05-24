import { createSlice } from '@reduxjs/toolkit'
import { clearChatThunk, getMessagesThunk, sendMessageThunk } from './messageThunk';

const initialState = {
    buttonLoading: false,
    messages: [],
    screenLoading: false,
    clearChatLoading: false,
}

const messageSlice = createSlice({
    name: 'message',
    initialState,
    reducers: {
        setNewMessage:(state, action) => {
            const oldMessages = state.messages ?? []; // if chatting with new user,the messages will be null so prevent it
            state.messages = [...oldMessages, action.payload]
        },

        setMessages: (state) => {
            state.messages = []; // if chatting with new user,the messages will be null so prevent it
        }
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
            state.screenLoading = true;
        });

        builder.addCase(getMessagesThunk.fulfilled, (state, action) => { 
            state.screenLoading = false;
            const { responseData } = action.payload;
            state.messages = responseData?.messages || []; // if chatting with new user,the messages will be null so prevent it
        });

        builder.addCase(getMessagesThunk.rejected, (state, action) => { 
            state.screenLoading = false;
        });

        // clear chat
        builder.addCase(clearChatThunk.pending, (state, action) => {
            state.clearChatLoading = true;
        });

        builder.addCase(clearChatThunk.fulfilled, (state, action) => { 
            state.clearChatLoading = false;
            state.messages = [];
        });

        builder.addCase(clearChatThunk.rejected, (state, action) => { 
            state.clearChatLoading = false;
        });

    },
})
export const { setNewMessage, setMessages } = messageSlice.actions;

export default messageSlice.reducer