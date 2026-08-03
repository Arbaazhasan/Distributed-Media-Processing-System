import mongoose from 'mongoose';

const VideoSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  originalFilename: {
    type: String,
    required: true,
  },
  filename: {
    type: String,
    required: true,
  },
  filepath: {
    type: String,
    required: true,
  },
  fileSize: {
    type: Number,
    required: true,
  },
  status: {
    type: String,
    enum: ['pending', 'processing', 'completed', 'failed'],
    default: 'pending',
  },
  progress: {
    type: Number,
    default: 0,
  },
  currentResolution: {
    type: String,
    default: 'queued',
  },
  outputResolutions: [{
    resolution: String,
    filepath: String,
  }],
  error: {
    type: String,
    default: null,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Video = mongoose.model('Video', VideoSchema);
export default Video;
