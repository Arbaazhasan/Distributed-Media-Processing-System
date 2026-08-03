import mongoose from 'mongoose';

const VideoSchema = new mongoose.Schema({
  title: String,
  originalFilename: String,
  filename: String,
  filepath: String,
  cloudinaryUrl: String,
  cloudinaryPublicId: String,
  fileSize: Number,
  status: {
    type: String,
    enum: ['pending', 'processing', 'completed', 'failed'],
    default: 'pending',
  },
  progress: { type: Number, default: 0 },
  currentResolution: { type: String, default: 'queued' },
  outputResolutions: [{
    resolution: String,
    filepath: String,
    url: String,
    publicId: String,
  }],
  error: { type: String, default: null },
  createdAt: { type: Date, default: Date.now },
});

const Video = mongoose.models.Video || mongoose.model('Video', VideoSchema);
export default Video;
