import React, { useState, useEffect, useCallback, useRef } from 'react';
import Navbar from '../Navbar';
import UploadZone from '../UploadZone';
import ProcessingTracker from '../ProcessingTracker';
import VideoGallery from '../VideoGallery';
import VideoPlayerModal from '../VideoPlayerModal';
import { useSocket } from '../../hooks/useSocket';
import { useVideos } from '../../hooks/useVideos';
import { videoService } from '../../services/api';
import './App.scss';

export default function App() {
  const [currentJob, setCurrentJob] = useState(null);
  const [activeStream, setActiveStream] = useState(null);
  const lastLoggedProgressRef = useRef(null);

  const { videos, fetchVideos, updateVideoProgress, deleteVideo } = useVideos();

  const handleProgressEvent = useCallback((data) => {
    setCurrentJob((prev) => ({
      ...prev,
      ...data,
      videoId: data.videoId || data.id || prev?.videoId,
    }));

    updateVideoProgress(data);

    if (data.status === 'completed') {
      setTimeout(fetchVideos, 500);
    }
  }, [updateVideoProgress, fetchVideos]);

  const { isConnected, logs, addLog } = useSocket(handleProgressEvent);

  // Synchronize logs & job state via polling fallback if WebSocket is offline or on Vercel
  useEffect(() => {
    if (!currentJob || currentJob.status === 'completed' || currentJob.status === 'failed') {
      return;
    }

    const targetId = currentJob.videoId || currentJob.id || currentJob._id;
    if (!targetId) return;

    const interval = setInterval(async () => {
      try {
        const updated = await videoService.getById(targetId);
        if (updated) {
          setCurrentJob((prev) => ({
            ...prev,
            ...updated,
            videoId: updated._id || updated.id,
          }));

          updateVideoProgress({
            videoId: updated._id || updated.id,
            status: updated.status,
            progress: updated.progress,
            currentResolution: updated.currentResolution,
            outputResolutions: updated.outputResolutions,
          });

          // Log progress step into Real-Time Redis Pub/Sub Stream box
          const logKey = `${updated.status}-${updated.progress}-${updated.currentResolution}`;
          if (lastLoggedProgressRef.current !== logKey) {
            lastLoggedProgressRef.current = logKey;
            const logMessage = `[Redis Pub/Sub] Transcode step: ${updated.currentResolution || updated.status} (${updated.progress}%)`;
            addLog(logMessage);
          }

          if (updated.status === 'completed') {
            fetchVideos();
          }
        }
      } catch (err) {}
    }, 1500);

    return () => clearInterval(interval);
  }, [currentJob, updateVideoProgress, fetchVideos, addLog]);

  const handleUploadSuccess = (videoData) => {
    const jobPayload = {
      videoId: videoData.id,
      jobId: videoData.jobId,
      title: videoData.title,
      status: 'pending',
      progress: 0,
      currentResolution: 'Queued',
    };
    setCurrentJob(jobPayload);
    updateVideoProgress(jobPayload);
    addLog(`[Upload Success] Enqueued video "${videoData.title}" into Redis BullMQ processing queue (Job #${videoData.jobId})`);
    fetchVideos();
  };

  const handleDeleteVideo = async (videoId) => {
    try {
      await deleteVideo(videoId);
      addLog(`[Storage Sync] Purged video record & Cloudinary assets for [${videoId}]`);
      if (currentJob && (currentJob.videoId === videoId || currentJob.id === videoId || currentJob._id === videoId)) {
        setCurrentJob(null);
      }
    } catch (err) {
      addLog(`[Storage Warning] Error deleting video: ${err.message}`);
    }
  };

  const isSignalingActive = isConnected || (currentJob && currentJob.status === 'processing');

  return (
    <div className="app-layout">
      <Navbar socketConnected={isSignalingActive} />

      <main className="app-layout__dashboard">
        <UploadZone onUploadSuccess={handleUploadSuccess} />
        <ProcessingTracker 
          currentJob={currentJob} 
          logs={logs} 
          onStreamSelect={setActiveStream}
        />
      </main>

      <VideoGallery 
        videos={videos} 
        onSelectVideo={setCurrentJob} 
        onDeleteVideo={handleDeleteVideo}
        onStreamSelect={setActiveStream}
      />

      {activeStream && (
        <VideoPlayerModal 
          videoData={activeStream} 
          onClose={() => setActiveStream(null)} 
        />
      )}
    </div>
  );
}
