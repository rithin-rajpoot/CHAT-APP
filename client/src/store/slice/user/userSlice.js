import { createSlice } from '@reduxjs/toolkit'
import { getOtherUsersThunk, getUserProfileThunk, loginUserThunk, logoutUserThunk, registerUserThunk, updateProfileThunk } from './userThunk'

const initialState = {
    isAuthenticated: false,
    userProfile: null,
    buttonLoading: false,
    screenLoading: true,
    otherUsers: [],
    selectedUser: JSON.parse(localStorage.getItem('selectedUser')),
}

const userSlice = createSlice({
    name: 'user',
    initialState,
    reducers: {
        setSelectedUser: (state, action) => {
            localStorage.setItem('selectedUser',JSON.stringify(action.payload))
            state.selectedUser = action.payload;
        }
    },
    extraReducers: (builder) => {
        // Login 
        builder.addCase(loginUserThunk.pending, (state, action) => {
            state.buttonLoading = true;
        });

        builder.addCase(loginUserThunk.fulfilled, (state, action) => { // action.payload => contains the data returned from loginUserThunk after fetching 
            state.userProfile = action.payload?.responseData?.user // store the data fetched from backend
            state.isAuthenticated = true;
            state.buttonLoading = false;
        });

        builder.addCase(loginUserThunk.rejected, (state, action) => { // action.payload => contains the data returned from rejectWithValue()
            //   console.log("rejected")
            //   console.log(action.payload)
            state.buttonLoading = false;
        });


        // Register
        builder.addCase(registerUserThunk.pending, (state, action) => {
            state.buttonLoading = true;
        });

        builder.addCase(registerUserThunk.fulfilled, (state, action) => {
            state.userProfile = action.payload?.responseData?.newUser
            state.buttonLoading = false;
            state.isAuthenticated = true;
        });

        builder.addCase(registerUserThunk.rejected, (state, action) => {
            state.buttonLoading = false;
        });


        // Logout
        builder.addCase(logoutUserThunk.pending, (state, action) => {
            state.buttonLoading = true;
        });

        builder.addCase(logoutUserThunk.fulfilled, (state, action) => {
            state.userProfile = null;
            state.selectedUser = null;
            state.otherUsers = null;
            state.isAuthenticated = false;
            state.buttonLoading = false;
            localStorage.clear();
        });

        builder.addCase(logoutUserThunk.rejected, (state, action) => {
            state.buttonLoading = false;
        });


        // Get user profile
        builder.addCase(getUserProfileThunk.pending, (state, action) => {
        });

        builder.addCase(getUserProfileThunk.fulfilled, (state, action) => {
            state.isAuthenticated = true;
            state.userProfile = action.payload?.responseData;
            state.screenLoading = false;
        });

        builder.addCase(getUserProfileThunk.rejected, (state, action) => {
            state.screenLoading = false;
        });

        // Get Other Users profile
        builder.addCase(getOtherUsersThunk.pending, (state, action) => {
            state.screenLoading = true;
        });

        builder.addCase(getOtherUsersThunk.fulfilled, (state, action) => {
            state.screenLoading = false;
            state.otherUsers = action.payload?.responseData;
        });

        builder.addCase(getOtherUsersThunk.rejected, (state, action) => {
            state.screenLoading = false;
        });

        // update user profile
        builder.addCase(updateProfileThunk.pending, (state, action) => {
            state.screenLoading = true;
        });

        builder.addCase(updateProfileThunk.fulfilled, (state, action) => {
            state.screenLoading = false;
            state.userProfile = action.payload?.responseData;
        });

        builder.addCase(updateProfileThunk.rejected, (state, action) => {
            state.screenLoading = false;
        });
    },
})
export const { setSelectedUser } = userSlice.actions;

export default userSlice.reducer