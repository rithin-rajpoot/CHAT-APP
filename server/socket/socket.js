import { Server } from 'socket.io'
import http from 'http';
import express from 'express';

// Import environment variables
import dotenv from 'dotenv';
dotenv.config();

const app = express();

const server = http.createServer(app);
// console.log(process.env.CLIENT_URL)
const io = new Server(server,
    {
        cors: {
            origin: process.env.CLIENT_URL,
            credentials: true,
            
        }
    }
);

const userSocketMap = new Map();

io.on("connection", (socket) =>{
    console.log("User connected : ", socket.id)
    const userId = socket.handshake.query.userId; // whenever a user connects from frontend, a query containing userId is recieved
    if(userId) {
        userSocketMap[userId] = socket.id;
    }

    // console.log(Object.keys(userSocketMap))
    //if any user is connected, we add that user to the userSocketMap, which represents all the connected users(online users)
    io.emit('onlineUsers', Object.keys(userSocketMap))

    // Handle typing events
    socket.on('typing', ({ senderId, receiverId }) => {
        // console.log('Server received typing event:', { senderId, receiverId });
        const receiverSocketId = getSocketId(receiverId);
        if (receiverSocketId) {
            // console.log('Emitting typing to receiver');
            io.to(receiverSocketId).emit('typing', { senderId });
        }
    });

    socket.on('stopTyping', ({ senderId, receiverId }) => {
        // console.log('Server received stopTyping event:', { senderId, receiverId });
        const receiverSocketId = getSocketId(receiverId);
        if (receiverSocketId) {
            // console.log('Emitting stopTyping to receiver');
            io.to(receiverSocketId).emit('stopTyping', { senderId });
        }
    });

    socket.on('disconnect', () => {
        // if a user disconnects, we remove that user from the userSocketMap
        delete userSocketMap[userId];
        io.emit('onlineUsers', Object.keys(userSocketMap));
    });
});

const getSocketId = (userId) =>{
    return userSocketMap[userId];
}


export { io, app, server, getSocketId }