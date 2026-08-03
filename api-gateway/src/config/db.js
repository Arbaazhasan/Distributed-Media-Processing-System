import mongoose from 'mongoose';

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/media_platform');
    console.log(`[API-Gateway] MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`[API-Gateway] Database connection error: ${error.message}`);
    // Non-fatal fallback for scaffolding environment
  }
};

export default connectDB;
