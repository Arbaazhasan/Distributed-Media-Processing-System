import { Queue } from 'bullmq';
import connection from '../config/redis.js';

const videoQueue = new Queue('video-processing', { connection });

const addTranscodeJob = async (videoData) => {
  const job = await videoQueue.add('transcode', videoData, {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 2000,
    },
    removeOnComplete: false,
    removeOnFail: false,
  });

  console.log(`[API-Gateway] Transcode job #${job.id} enqueued for video ${videoData.videoId}`);
  return job;
};

const removeVideoJobs = async (videoId) => {
  try {
    const jobs = await videoQueue.getJobs(['active', 'waiting', 'completed', 'failed', 'delayed']);
    for (const job of jobs) {
      if (job.data && job.data.videoId === videoId) {
        await job.remove();
        console.log(`[API-Gateway] Removed BullMQ job #${job.id} for video ${videoId}`);
      }
    }
  } catch (err) {
    console.warn('[API-Gateway] Could not remove BullMQ job:', err.message);
  }
};

export {
  videoQueue,
  addTranscodeJob,
  removeVideoJobs,
};
