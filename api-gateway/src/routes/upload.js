import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { v4 as uuidv4 } from 'uuid';
import Video from '../models/Video.js';
import { addTranscodeJob } from '../queues/videoQueue.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

const uploadDir = path.resolve(__dirname, '../../../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const uniqueName = `${uuidv4()}${ext}`;
    cb(null, uniqueName);
  },
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('video/')) {
    cb(null, true);
  } else {
    cb(new Error('Only video files are allowed!'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 500 * 1024 * 1024 }, // 500MB max
});

router.post('/', upload.single('video'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No video file provided' });
    }

    const { title } = req.body;
    const baseTitle = (title && title.trim()) 
      ? title.trim() 
      : req.file.originalname.replace(/\.[^/.]+$/, '');

    // Check existing videos to append a unique number if title already exists
    const escapedBase = baseTitle.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const existingCount = await Video.countDocuments({ 
      title: { $regex: new RegExp(`^${escapedBase}( #\\d+)?$`, 'i') } 
    });

    const videoTitle = existingCount > 0 ? `${baseTitle} #${existingCount + 1}` : baseTitle;

    const video = new Video({
      title: videoTitle,
      originalFilename: req.file.originalname,
      filename: req.file.filename,
      filepath: req.file.path,
      fileSize: req.file.size,
      status: 'pending',
      progress: 0,
    });

    await video.save();

    // Enqueue transcoding job into BullMQ
    const job = await addTranscodeJob({
      videoId: video._id.toString(),
      filename: req.file.filename,
      inputPath: req.file.path,
      title: videoTitle,
    });

    res.status(201).json({
      message: 'Video uploaded successfully and queued for processing',
      video: {
        id: video._id,
        title: video.title,
        filename: video.filename,
        status: video.status,
        jobId: job.id,
        createdAt: video.createdAt,
      },
    });
  } catch (error) {
    console.error('[API-Gateway] Upload error:', error);
    res.status(500).json({ error: error.message || 'Server error uploading video' });
  }
});

export default router;
