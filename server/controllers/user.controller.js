import User from '../models/user.model.js'
import {asyncHandler} from '../utilities/asyncHandler.utility.js';
import cloudinary from '../utilities/cloudinary.utilty.js';
import { errorHandler } from '../utilities/errorHandler.utility.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export const register = asyncHandler(
    async (req, res, next) => {
        const { fullName, username, password, gender } = req.body;
        // const user = new User({ fullName, email, password });
        if (!fullName || !username || !password || !gender) {
           return next(new errorHandler("All fields are required",400))
        }

        const user = await User.findOne({username});
        if(user) {
            return next(new errorHandler("User already exists",400))
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = await User.create({ //creates and saves the user
            fullName,
            username,
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
        .json({success: true, responseData: {
            newUser,
            token
        }})
    }
)

export const login = asyncHandler(
    async (req, res, next) => {
        const { username, password } = req.body;
        if (!username || !password) {
           return next(new errorHandler("Your password or username is empty",400))
        }

        const user = await User.findOne({username})
        if(!user) {
            return next(new errorHandler("Your password or username is Invalid!",400))
        }

        const isValidPassword = await bcrypt.compare(password, user.password);
        if(!isValidPassword) {
            return next(new errorHandler("Your password or username is Invalid!",400))
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

// export const delteUser= asyncHandler(
//     async (req, res, next) => {
//         const userId = req.user._id; // this req.user._id is set by the middleware\
//         const user = await User.findByIdAndDelete(userId);
//         if(!user) {
//             return next(new errorHandler("User not found!",404))
//         }
//         res.status(200).json({
//             success: true,
//             message: "User deleted successfully"
//         });

//     }
// )