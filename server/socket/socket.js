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
        }
    }
);

const userSocketMap = {
    //userId : socketId
}

io.on("connection", (socket) =>{
    const userId = socket.handshake.query.userId; // whenever a user connects from frontend, a query containing userId is recieved
    if(!userId) return;

    userSocketMap[userId] = socket.id;

    // console.log(Object.keys(userSocketMap))
    //if any user is connected, we add that user to the userSocketMap, which represents all the connected users(online users)
    io.emit('onlineUsers', Object.keys(userSocketMap))

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