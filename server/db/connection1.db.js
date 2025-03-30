import mongoose from 'mongoose';

export const connectDB = async () =>{ 
  try {
    const instance = await mongoose.connect(process.env.MONGODB_URL);
    console.log(`Connected to MongoDB: ${instance.connection.host}`);
  } catch(err){
    console.log(err);
  }
}