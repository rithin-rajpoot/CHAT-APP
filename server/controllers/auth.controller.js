// import { OAuth2Client } from "google-auth-library";
import User from "../models/user.model.js";
import jwt from "jsonwebtoken";
import { asyncHandler } from "../utilities/asyncHandler.utility.js";
import axios from "axios";

// const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// Controller for Google OAuth
export const googleAuth = asyncHandler(
  async (req, res, next) => {
    const { credential } = req.body; // frontend sends 'credential', not 'token'

    // // Verify the token with Google
    // const ticket = await client.verifyIdToken({
    //   idToken: credential,
    //   audience: process.env.GOOGLE_CLIENT_ID,
    // });

    // const payload = ticket.getPayload();
    // // console.log(payload);
    // const { sub: googleId, email, name, picture } = payload;

    // Fetch profile from Google
    const { data: payload } = await axios.get("https://www.googleapis.com/oauth2/v3/userinfo", {
      headers: { Authorization: `Bearer ${credential}` },
    });

    const { sub: googleId, email, name, picture } = payload;


    // Check if user already exists
    let user = await User.findOne({ email });

    if (!user) {
      // Create new user if doesn't exist
      user = await User.create({
        fullName: name,
        email,
        googleId,
        avatar: picture,
        password: "", // no password for Google users
      });
    } else if (!user.googleId) {
      // User exists but hasn't used Google login before - link the account
      user.googleId = googleId;
      if (!user.avatar && picture) {
        user.avatar = picture;
      }
      await user.save();
    }

    // Create JWT - match the structure used in regular login
    const tokenData = {
      _id: user._id,
    };
    const authToken = jwt.sign(
      tokenData,
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRATION || "7d" }
    );

    // Set cookie like in regular login
    res.status(200)
      .cookie("token", authToken, {
        expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        httpOnly: true,
        secure: true,
        sameSite: 'none'
      })
      .json({
        success: true,
        message: "Google login successful",
        responseData: {
          user,
          token: authToken
        }
      });
  }
);
