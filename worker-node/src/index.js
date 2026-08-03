import { Worker } from 'bullmq';
import mongoose from 'mongoose';
import dotenv from 'dotenv';

import { connection } from './config/redis.js';
import { processVideo } from './transcoder/ffmpeg.js';
import Video from './models/Video.js';

dotenv.config();

const formatMongoUri = (rawUri) => {
  if (!rawUri) return 'mongodb://localhost:27017/media_platform';
  let uri = rawUri.trim();
  if (uri.includes('.mongodb.net/?')) {
    uri = uri.replace('.mongodb.net/?', '.mongodb.net/media_platform?');
  } else if (uri.match(/\.mongodb\.net\/?$/)) {
    uri = uri.replace(/\.mongodb\.net\/?$/, '.mongodb.net/media_platform');
  }
  return uri;
};

const rawUri = process.env.DB_CONNECTION || process.env.MONGO_URI || process.env.MONGODB_URI;
const mongoUri = formatMongoUri(rawUri);

mongoose.connect(mongoUri)
  .then((conn) => console.log(`[Worker-Node] Connected to MongoDB Atlas Cloud Cluster (${conn.connection.name})`))
  .catch((err) => console.log('[Worker-Node] MongoDB connection error:', err.message));

const worker = new Worker(
  'video-processing',
  async (job) => {
    console.log(`[Worker-Node] Picked up job #${job.id}: ${job.name}`);
    
    try {
      await Video.findByIdAndUpdate(job.data.videoId, {
        status: 'processing',
        progress: 5,
      });
    } catch (e) {
      console.warn('[Worker-Node] Could not update DB pending status:', e.message);
    }

    const result = await processVideo(job);

    try {
      await Video.findByIdAndUpdate(job.data.videoId, {
        status: 'completed',
        progress: 100,
        outputResolutions: result.outputFiles,
      });
    } catch (e) {
      console.warn('[Worker-Node] Could not update DB completion status:', e.message);
    }

    return result;
  },
  {
    connection,
    concurrency: 2,
  }
);

worker.on('completed', (job) => {
  console.log(`[Worker-Node] Job #${job.id} completed successfully!`);
});

worker.on('failed', async (job, err) => {
  console.error(`[Worker-Node] Job #${job?.id} failed with error:`, err.message);
  if (job?.data?.videoId) {
    try {
      await Video.findByIdAndUpdate(job.data.videoId, {
        status: 'failed',
        error: err.message,
      });
    } catch (e) {}
  }
});

console.log('[Worker-Node] Listening for transcode jobs on queue "video-processing"...');
