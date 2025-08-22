import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
    fullName: {
        type: String,
        required: true
    },
    username: {
        type: String,
        unique: true, // still unique, but might not always be required for OAuth
        sparse: true  // allows some docs to skip username if login is via OAuth
    },
    password: {
        type: String,
        // required only if it's normal signup
    },
    gender: {
        type: String,
        // optional for OAuth users (since Google won’t give gender)
    },
    avatar: {
        type: String,
        default: ''
    },

    // 🔑 OAuth-specific fields
    googleId: {
        type: String,
        unique: true,
        sparse: true
    },
    githubId: {
        type: String,
        unique: true,
        sparse: true
    },
    email: {
        type: String,
        unique: true,
        sparse: true
    }
}, { timestamps: true });

const User = mongoose.model('User', userSchema);
export default User;
