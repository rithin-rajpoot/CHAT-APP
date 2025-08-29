import { createSlice } from '@reduxjs/toolkit'

const initialState = {
    currTheme: JSON.parse(localStorage.getItem('chat-theme')) || 'dark',
}

const themeSlice = createSlice({
    name: 'theme',
    initialState,
    reducers: {
        setCurrTheme: (state, action) => {
            state.currTheme = action.payload;
        }
    },
    
})
export const { setCurrTheme } = themeSlice.actions;

export default themeSlice.reducer