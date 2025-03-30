import jwt from 'jsonwebtoken';
import { asyncHandler } from '../utilities/asyncHandler.utility.js';
import { errorHandler } from '../utilities/errorHandler.utility.js';

const isAuthenticated = asyncHandler(async (req, res, next) => {
    const token = req.cookies.token || req.headers.authorization?.split(' ')[1]; // we have sent the token in cookie while login and signup
    if (!token) {
        return next(new errorHandler("Token not found. Please log in!", 401)); // if the user is not logged in or token has expired
    }

    const tokenData = jwt.verify(token, process.env.JWT_SECRET); // returns the token data set during login or signup
    // console.log("token data", tokenData?._id);
    req.user = tokenData;
    next();
})

export { isAuthenticated };