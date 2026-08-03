import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';

import subscriber from './config/redis.js';

dotenv.config();

const app = express();
app.use(cors());

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
});

const PORT = process.env.PORT || 4000;

// Socket.io connection handling
io.on('connection', (socket) => {
  console.log(`[Signaling-Server] Client connected: ${socket.id}`);

  socket.on('join:video', (videoId) => {
    socket.join(`video:${videoId}`);
    console.log(`[Signaling-Server] Socket ${socket.id} joined room video:${videoId}`);
  });

  socket.on('disconnect', () => {
    console.log(`[Signaling-Server] Client disconnected: ${socket.id}`);
  });
});

// Subscribe to Redis Pub/Sub channel
const CHANNEL = 'video-progress';

subscriber.subscribe(CHANNEL, (err, count) => {
  if (err) {
    console.error(`[Signaling-Server] Failed to subscribe to channel ${CHANNEL}:`, err.message);
  } else {
    console.log(`[Signaling-Server] Subscribed to Redis channel "${CHANNEL}". Listening for video progress...`);
  }
});

subscriber.on('message', (channel, message) => {
  if (channel === CHANNEL) {
    try {
      const data = JSON.parse(message);
      console.log(`[Signaling-Server] Received progress for video ${data.videoId}: ${data.progress}% (${data.currentResolution})`);
      
      // Broadcast to all clients or specific video room
      io.emit('video:progress', data);
      if (data.videoId) {
        io.to(`video:${data.videoId}`).emit('video:progress', data);
      }
    } catch (err) {
      console.error('[Signaling-Server] Failed to parse Redis message:', err.message);
    }
  }
});

app.get('/health', (req, res) => {
  res.json({ service: 'signaling-server', status: 'healthy', timestamp: new Date() });
});

server.listen(PORT, () => {
  console.log(`[Signaling-Server] Running on http://localhost:${PORT}`);
});
