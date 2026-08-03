import mongoose from 'mongoose';

const connectDB = async () => {
  try {
    const mongoUri = process.env.DB_CONNECTION || process.env.MONGO_URI || process.env.MONGODB_URI || 'mongodb://localhost:27017/media_platform';
    const conn = await mongoose.connect(mongoUri);
    const hostType = mongoUri.includes('mongodb+srv://') ? 'MongoDB Atlas Cloud Cluster' : conn.connection.host;
    console.log(`[API-Gateway] MongoDB Connected: ${hostType}`);
  } catch (error) {
    console.error(`[API-Gateway] Database connection error: ${error.message}`);
  }
};

export default connectDB;
