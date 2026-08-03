import React, { useState, useEffect, useCallback } from 'react';
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

  // Active Job Polling Fallback (Polls every 2s while job is active)
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

          if (updated.status === 'completed') {
            fetchVideos();
          }
        }
      } catch (err) {
        // Polling notice ignored if server temporarily busy
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [currentJob, updateVideoProgress, fetchVideos]);

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
    addLog(`Uploaded video "${videoData.title}" - Job #${videoData.jobId} enqueued.`);
    fetchVideos();
  };

  const handleDeleteVideo = async (videoId) => {
    try {
      await deleteVideo(videoId);
      addLog(`Deleted video record [${videoId}]`);
      if (currentJob && (currentJob.videoId === videoId || currentJob.id === videoId || currentJob._id === videoId)) {
        setCurrentJob(null);
      }
    } catch (err) {
      addLog(`Error deleting video: ${err.message}`);
    }
  };

  return (
    <div className="app-layout">
      <Navbar socketConnected={isConnected} />

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
