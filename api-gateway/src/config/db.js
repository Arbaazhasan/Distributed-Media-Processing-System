import mongoose from 'mongoose';

export const formatMongoUri = (rawUri) => {
  if (!rawUri) return 'mongodb://localhost:27017/media_platform';
  let uri = rawUri.trim();

  if (uri.includes('.mongodb.net/?')) {
    uri = uri.replace('.mongodb.net/?', '.mongodb.net/media_platform?');
  } else if (uri.match(/\.mongodb\.net\/?$/)) {
    uri = uri.replace(/\.mongodb\.net\/?$/, '.mongodb.net/media_platform');
  }
  return uri;
};

const connectDB = async () => {
  try {
    const rawUri = process.env.DB_CONNECTION || process.env.MONGO_URI || process.env.MONGODB_URI;
    const mongoUri = formatMongoUri(rawUri);

    const conn = await mongoose.connect(mongoUri);
    const hostType = mongoUri.includes('mongodb+srv://') ? `MongoDB Atlas (${conn.connection.name})` : conn.connection.host;
    console.log(`[API-Gateway] MongoDB Connected: ${hostType}`);
  } catch (error) {
    console.error(`[API-Gateway] Database connection error: ${error.message}`);
  }
};

export default connectDB;
