import express from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import Video from '../models/Video.js';
import { removeVideoJobs } from '../queues/videoQueue.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

// Get all videos
router.get('/', async (req, res) => {
  try {
    const videos = await Video.find().sort({ createdAt: -1 });
    res.json(videos);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch videos' });
  }
});

// Get single video status
router.get('/:id', async (req, res) => {
  try {
    const video = await Video.findById(req.params.id);
    if (!video) {
      return res.status(404).json({ error: 'Video not found' });
    }
    res.json(video);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch video' });
  }
});

// Download processed video file by video ID and resolution
router.get('/download/:id/:resolution', async (req, res) => {
  try {
    const { id, resolution } = req.params;

    const video = await Video.findById(id);
    if (!video) {
      return res.status(404).json({ error: 'Video record not found' });
    }

    const filePath = path.resolve(__dirname, `../../../processed/${id}/${resolution}.mp4`);
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: 'Processed video file not found on server' });
    }

    const cleanTitle = (video.title || 'processed_video').replace(/[^a-zA-Z0-9_-]/g, '_');
    const downloadFileName = `${cleanTitle}_${resolution}.mp4`;

    res.download(filePath, downloadFileName);
  } catch (error) {
    console.error('[API-Gateway] Download error:', error);
    res.status(500).json({ error: 'Failed to download video file' });
  }
});

// Delete video record and all associated server files + queues
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const video = await Video.findById(id);
    if (!video) {
      return res.status(404).json({ error: 'Video not found' });
    }

    // 1. Remove raw uploaded video file from disk (/uploads/)
    if (video.filepath && fs.existsSync(video.filepath)) {
      try {
        fs.unlinkSync(video.filepath);
      } catch (err) {
        console.warn('[API-Gateway] Could not remove upload filepath:', err.message);
      }
    }
    if (video.filename) {
      const uploadPathByFilename = path.resolve(__dirname, `../../../uploads/${video.filename}`);
      if (fs.existsSync(uploadPathByFilename)) {
        try {
          fs.unlinkSync(uploadPathByFilename);
        } catch (err) {}
      }
    }

    // 2. Remove all processed resolution streams from disk (/processed/<id>/)
    const processedDir = path.resolve(__dirname, `../../../processed/${id}`);
    if (fs.existsSync(processedDir)) {
      try {
        fs.rmSync(processedDir, { recursive: true, force: true });
      } catch (err) {
        console.warn('[API-Gateway] Could not remove processed directory:', err.message);
      }
    }

    // 3. Remove active or historical BullMQ transcoding jobs from Redis
    await removeVideoJobs(id);

    // 4. Delete MongoDB document metadata record
    await Video.findByIdAndDelete(id);

    res.json({ message: 'Video and all associated files/data completely deleted', id });
  } catch (error) {
    console.error('[API-Gateway] Delete video error:', error);
    res.status(500).json({ error: 'Failed to delete video' });
  }
});

export default router;
