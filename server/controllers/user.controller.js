import User from '../models/user.model.js'
import {asyncHandler} from '../utilities/asyncHandler.utility.js';
import cloudinary from '../utilities/cloudinary.utilty.js';
import { errorHandler } from '../utilities/errorHandler.utility.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { io } from '../socket/socket.js';

export const register = asyncHandler(
    async (req, res, next) => {
        const { fullName, email, password, gender } = req.body;
        // const user = new User({ fullName, email, password });
        if (!fullName || !email || !password || !gender) {
           return next(new errorHandler("All fields are required",400))
        }

        const user = await User.findOne({email});
        if(user) {
            return next(new errorHandler("User already exists",400))
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = await User.create({ //creates and saves the user
            fullName,
            email,
            password: hashedPassword,
            gender,
        })

        // Generate and send JWT
        const tokenData = {
            _id : newUser?._id,
        }
        const token = jwt.sign(tokenData, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRATION });

        res.status(200)
        .cookie("token",token,{
            expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
            httpOnly: true,
            secure: true,
            sameSite: 'none'
        })
        .json({success: true, message: 'Account created successfully!', responseData: {
            newUser,
            token
        }})
    }
)

export const login = asyncHandler(
    async (req, res, next) => {
        const { email, password } = req.body;
        if (!email || !password) {
           return next(new errorHandler("Your password or email is empty",400))
        }

        const user = await User.findOne({email})
        if(!user) {
            return next(new errorHandler("Your password or email is Invalid!",400))
        }

        const isValidPassword = await bcrypt.compare(password, user.password);
        if(!isValidPassword) {
            return next(new errorHandler("Your password or email is Invalid!",400))
        }

        // Generate and send JWT
        const tokenData = {
            _id : user?._id,
        }
        const token = jwt.sign(tokenData, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRATION });

        res.status(200)
        .cookie("token",token, {
            expires: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
            httpOnly: true,
            secure: true,
            sameSite: 'none'
        })
        .json({success: true, responseData: {
            message: "Login successful",
            user,
            token
        }})
    }
)

export const getProfile = asyncHandler(
    async (req, res, next) => {
        const userId = req.user._id; // this req.user._id is set by the middleware

        const profile = await User.findById(userId).select("-password");

        if(!profile) {
            return next(new errorHandler("User not found!",404))
        }
        res.status(200).json({
            success: true,
            responseData: profile
        });
    }
)

export const logout = asyncHandler(
    async (req, res, next) => {
        
        res.status(200)
        .cookie("token","", {
            expires: new Date(Date.now()),
            httpOnly: true,
            secure: true,
            sameSite: 'none'
        })
        .json({
            success: true,
            message: "User logged out"
        });
    }
)

export const getOtherUsers = asyncHandler(
    async (req, res, next) => {

        // fetch all users except yourself
        const otherUsers = await User.find({_id: { $ne: req.user._id}});
        
        res.status(200)
        .json({
            success: true,
            responseData: otherUsers
        });
    }
)

export const updateProfile = asyncHandler(
    async (req, res, next) => {
        const userId = req.user._id; 
        const { avatar } = req.body;
        if(!avatar) {
            return next(new errorHandler("Please provide an avatar",400))
        }
        
        const uploadRsponse = await cloudinary.uploader.upload(avatar);

        const updatedUser = await User.findByIdAndUpdate(userId, {avatar: uploadRsponse.secure_url}, {new: true});

        res.status(200).json({
            success: true,
            message: "User updated successfully",
            responseData: updatedUser
        });

    }
)

export const deleteUser = asyncHandler(
    async (req, res, next) => {
        const userId = req.user._id; 

        const user = await User.findByIdAndDelete(userId);
        if(!user) {
            return next(new errorHandler("User not found!",404))
        }

        io.emit("userDeleted", userId); // Notify all clients about the user deletion

        res.status(200).json({
            success: true,
            message: "Account deletion successful",
        });

    }
)

export const updatePassword = asyncHandler(
    async (req, res, next) => {
        const userId = req.user._id; 
        const { oldPassword, newPassword } = req.body;

        if(!oldPassword || !newPassword) {
            return next(new errorHandler("Please provide old and new passwords",400))
        }

        const user = await User.findById(userId);
        if(!user) {
            return next(new errorHandler("User not found!",404))
        }

        const isValidPassword = await bcrypt.compare(oldPassword, user.password);
        if(!isValidPassword) {
            return next(new errorHandler("Old password is incorrect",400))
        }

        const hashedNewPassword = await bcrypt.hash(newPassword, 10);
        user.password = hashedNewPassword;
        await user.save();

        res.status(200).json({
            success: true,
            message: "Password updated successfully",
        });
    }
)
