import { useState, useEffect, useCallback } from 'react';
import { videoService } from '../services/api';

export function useVideos() {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchVideos = useCallback(async () => {
    setLoading(true);
    try {
      const data = await videoService.getAll();
      setVideos(data);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchVideos();
  }, [fetchVideos]);

  const updateVideoProgress = useCallback((data) => {
    setVideos((prevVideos) => {
      const targetId = String(data.videoId || data.id);
      const exists = prevVideos.some((v) => String(v._id || v.id) === targetId);

      if (!exists && data.videoId) {
        return [
          {
            _id: data.videoId,
            id: data.videoId,
            title: data.title || 'Transcoding Task',
            status: data.status || 'processing',
            progress: data.progress || 0,
            currentResolution: data.currentResolution || 'Queued',
            outputResolutions: data.outputResolutions || [],
            createdAt: new Date(),
          },
          ...prevVideos,
        ];
      }

      return prevVideos.map((v) => {
        const vId = String(v._id || v.id);
        if (vId === targetId) {
          return {
            ...v,
            status: data.status || v.status,
            progress: typeof data.progress === 'number' ? data.progress : v.progress,
            currentResolution: data.currentResolution || v.currentResolution,
            outputResolutions:
              data.outputResolutions && data.outputResolutions.length > 0
                ? data.outputResolutions
                : v.outputResolutions,
          };
        }
        return v;
      });
    });
  }, []);

  const deleteVideo = useCallback(async (videoId) => {
    await videoService.delete(videoId);
    await fetchVideos();
  }, [fetchVideos]);

  return {
    videos,
    loading,
    error,
    fetchVideos,
    updateVideoProgress,
    deleteVideo,
  };
}
