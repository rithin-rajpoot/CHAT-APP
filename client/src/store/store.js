import { configureStore } from '@reduxjs/toolkit'
import userReducer from './slice/user/userSlice.js' 
import messageReducer from './slice/message/messageSlice.js'
import socketReducer from'./slice/socket/socketSlice.js';
import themeReducer from './slice/themes/themeSlice.js';
export const store = configureStore({
    reducer: {
        userReducer,
        messageReducer,
        socketReducer,
        themeReducer,
    },
    middleware: (getDefaultMiddleware) => (
        getDefaultMiddleware({
            serializableCheck: {
                ignoredPaths: ["socketReducer.socket"]
            },
        })
        // other middleware goes here
    ),
})
