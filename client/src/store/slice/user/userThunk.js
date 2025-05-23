import { createAsyncThunk } from "@reduxjs/toolkit";
import { toast } from 'react-hot-toast'
import { axiosInstance } from '../../../components/utilities/axiosInstance.js'


export const loginUserThunk = createAsyncThunk('user/login',
    async ({ username, password }, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.post('/user/login',{
                username,
                password
            });
            toast.success("Login successful")
            return response.data;

        } catch (error) {
            const errorOutput = error?.response?.data?.errMessage;
            toast.error(errorOutput);
            return rejectWithValue(errorOutput)
        }
    }
);

export const registerUserThunk = createAsyncThunk('user/register',
    async ({ fullName, username, password, confirmPassword, gender }, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.post('/user/register',{
                fullName,
                username,
                password,
                confirmPassword,
                gender
            });
            toast.success("Account Created Successfully!!");
            return response.data;

        } catch (error) {
            const errorOutput = error?.response?.data?.errMessage;
            // console.log(errorOutput)
            toast.error(errorOutput);
            return rejectWithValue(errorOutput)
        }
    }
);

export const logoutUserThunk = createAsyncThunk('user/logout',
    async (_, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.post('/user/logout');
            toast.success("Logged Out Successfully!!");
            return response.data;

        } catch (error) {
            const errorOutput = error?.response?.data?.errMessage;
            // console.log(errorOutput)
            toast.error(errorOutput);
            return rejectWithValue(errorOutput)
        }
    }
);

export const getUserProfileThunk = createAsyncThunk('user/getProfile',
    async (_, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.get('/user/get-profile');
            return response.data;

        } catch (error) {
            const errorOutput = error?.response?.data?.errMessage;
            return rejectWithValue(errorOutput)
        }
    }
);

export const getOtherUsersThunk = createAsyncThunk('user/getOtherUsers',
    async (_, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.get('/user/get-other-users');
            return response.data;

        } catch (error) {
            const errorOutput = error?.response?.data?.errMessage;
            return rejectWithValue(errorOutput)
        }
    }
);

export const updateProfileThunk = createAsyncThunk('user/updateProfile',
    async ({ profilePic }, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.post('/user/update-profile',{
                avatar: profilePic
            });
            toast.success("Profile Updated Successfully!!");
            return response.data;

        } catch (error) {
            const errorOutput = error?.response?.data?.errMessage;
            toast.error(errorOutput);
            return rejectWithValue(errorOutput)
        }
    }
);