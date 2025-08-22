import { app, server } from './socket/socket.js'
import express from 'express';
import cookieParser from 'cookie-parser';


// MongoDB connection
import {connectDB} from './db/connection1.db.js';
connectDB();


// integration
import cors from 'cors';
const allowedOrigins = [
  'http://localhost:5173',
  process.env.CLIENT_URL
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
}));


app.use(express.json({ limit: '100mb' }));
app.use(cookieParser());

//routes : 

// user routes : 
import userRoute from './routes/user.route.js';
app.use('/api/v1/user', userRoute)

// message routes : 
import messageRoute from './routes/message.route.js';
app.use('/api/v1/message', messageRoute)

import authRoute from "./routes/auth.route.js";
app.use("/api/v1/auth", authRoute);


//Error handling middleware
import { errorMiddleware } from './middlewares/error.middleware.js';
app.use(errorMiddleware); // Error handling middleware should be placed after all routes

// Start the server
const PORT = process.env.PORT || 3000;
server.listen(PORT, ()  =>{
    console.log(`Server is running on port ${PORT}`);
})