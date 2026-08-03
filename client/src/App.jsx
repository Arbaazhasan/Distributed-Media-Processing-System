import React, { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import axios from 'axios';
import Navbar from './components/Navbar';
import UploadZone from './components/UploadZone';
import ProcessingTracker from './components/ProcessingTracker';
import VideoGallery from './components/VideoGallery';

const SIGNALING_URL = 'http://localhost:4000';
const API_URL = 'http://localhost:3000/api/videos';

export default function App() {
  const [socketConnected, setSocketConnected] = useState(false);
  const [currentJob, setCurrentJob] = useState(null);
  const [logs, setLogs] = useState([]);
  const [videos, setVideos] = useState([]);

  useEffect(() => {
    // Initialize Socket.io client to signaling server
    const socket = io(SIGNALING_URL, {
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 5,
    });

    socket.on('connect', () => {
      console.log('[Client] Connected to Signaling Server WebSocket');
      setSocketConnected(true);
      addLog('Connected to Signaling Server WebSocket');
    });

    socket.on('disconnect', () => {
      console.log('[Client] Disconnected from Signaling Server');
      setSocketConnected(false);
      addLog('Disconnected from Signaling Server');
    });

    // Listen for progress updates emitted from signaling server via Redis Pub/Sub
    socket.on('video:progress', (data) => {
      console.log('[Client] Received progress event:', data);
      setCurrentJob((prev) => ({
        ...prev,
        ...data,
      }));

      // Update gallery videos in real-time as progress events arrive
      setVideos((prevVideos) =>
        prevVideos.map((v) => {
          const vId = String(v._id || v.id);
          const targetId = String(data.videoId || data.id);
          if (vId === targetId) {
            return {
              ...v,
              status: data.status,
              progress: data.progress,
              currentResolution: data.currentResolution || v.currentResolution,
              outputResolutions: data.outputResolutions && data.outputResolutions.length > 0 
                ? data.outputResolutions 
                : v.outputResolutions,
            };
          }
          return v;
        })
      );

      const logMsg = `[Job ${data.jobId}] ${data.message || `Status: ${data.status} (${data.progress}%)`}`;
      addLog(logMsg);

      if (data.status === 'completed') {
        setTimeout(fetchVideos, 600);
      }
    });

    // Fetch existing video library
    fetchVideos();

    return () => {
      socket.disconnect();
    };
  }, []);

  const addLog = (message) => {
    const time = new Date().toLocaleTimeString();
    setLogs((prev) => [{ time, message }, ...prev.slice(0, 49)]);
  };

  const fetchVideos = async () => {
    try {
      const res = await axios.get(API_URL);
      setVideos(res.data);
    } catch (err) {
      console.log('[Client] API Gateway not reachable yet');
    }
  };

  const handleUploadSuccess = (videoData) => {
    setCurrentJob({
      videoId: videoData.id,
      jobId: videoData.jobId,
      title: videoData.title,
      status: 'pending',
      progress: 0,
      currentResolution: 'Queued',
    });
    addLog(`Uploaded video "${videoData.title}" - Job #${videoData.jobId} enqueued.`);
    fetchVideos();
  };

  const handleDeleteVideo = async (videoId) => {
    try {
      await axios.delete(`${API_URL}/${videoId}`);
      addLog(`Deleted video record [${videoId}]`);
      if (currentJob && (currentJob.videoId === videoId || currentJob.id === videoId || currentJob._id === videoId)) {
        setCurrentJob(null);
      }
      fetchVideos();
    } catch (err) {
      console.error('[Client] Failed to delete video:', err.message);
      addLog(`Error deleting video: ${err.response?.data?.error || err.message}`);
    }
  };

  return (
    <div className="app-container">
      <Navbar socketConnected={socketConnected} />

      <main className="grid-dashboard">
        <UploadZone onUploadSuccess={handleUploadSuccess} />
        <ProcessingTracker currentJob={currentJob} logs={logs} />
      </main>

      <VideoGallery 
        videos={videos} 
        onSelectVideo={(v) => setCurrentJob(v)} 
        onDeleteVideo={handleDeleteVideo}
      />
    </div>
  );
}
