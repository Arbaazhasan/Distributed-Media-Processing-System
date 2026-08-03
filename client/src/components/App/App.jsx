import React, { useState, useCallback } from 'react';
import Navbar from '../Navbar';
import UploadZone from '../UploadZone';
import ProcessingTracker from '../ProcessingTracker';
import VideoGallery from '../VideoGallery';
import VideoPlayerModal from '../VideoPlayerModal';
import { useSocket } from '../../hooks/useSocket';
import { useVideos } from '../../hooks/useVideos';
import './App.scss';

export default function App() {
  const [currentJob, setCurrentJob] = useState(null);
  const [activeStream, setActiveStream] = useState(null);

  const { videos, fetchVideos, updateVideoProgress, deleteVideo } = useVideos();

  const handleProgressEvent = useCallback((data) => {
    setCurrentJob((prev) => ({
      ...prev,
      ...data,
    }));

    updateVideoProgress(data);

    if (data.status === 'completed') {
      setTimeout(fetchVideos, 600);
    }
  }, [updateVideoProgress, fetchVideos]);

  const { isConnected, logs, addLog } = useSocket(handleProgressEvent);

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
