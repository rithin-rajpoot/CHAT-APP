import { createAsyncThunk } from "@reduxjs/toolkit";
import { toast } from 'react-hot-toast'
import { axiosInstance } from '../../../components/utilities/axiosInstance.js'


export const sendMessageThunk = createAsyncThunk('message/send',
    async ({ receiverId, message }, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.post(`message/send/${receiverId}`,{
                message,
            });
            return response.data;

        } catch (error) {
            const errorOutput = error?.response?.data?.errMessage;
            // console.log(errorOutput)
            toast.error(errorOutput);
            return rejectWithValue(errorOutput)
        }
    }
);


export const getMessagesThunk = createAsyncThunk('message/getMesssages',
    async ({ receiverId }, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.get(`message/get-messages/${receiverId}`);
            return response.data;

        } catch (error) {
            const errorOutput = error?.response?.data?.errMessage;
            return rejectWithValue(errorOutput)
        }
    }
);
