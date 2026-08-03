import React from 'react';
import { Film } from 'lucide-react';
import VideoCard from './VideoCard';
import './VideoGallery.scss';

export default function VideoGallery({ videos, onSelectVideo, onDeleteVideo, onStreamSelect }) {
  if (!videos || videos.length === 0) {
    return (
      <div className="video-gallery">
        <h2 className="video-gallery__header">
          <Film size={20} className="video-gallery__header-icon" />
          Media Library
        </h2>
        <p className="video-gallery__empty-text">
          No videos stored in MongoDB yet.
        </p>
      </div>
    );
  }

  return (
    <div className="video-gallery">
      <h2 className="video-gallery__header">
        <Film size={20} className="video-gallery__header-icon" />
        Processed Video Library ({videos.length})
      </h2>

      <div className="video-gallery__grid">
        {videos.map((vid) => (
          <VideoCard 
            key={vid._id || vid.id} 
            video={vid} 
            onSelect={onSelectVideo} 
            onDelete={onDeleteVideo}
            onStreamSelect={onStreamSelect}
          />
        ))}
      </div>
    </div>
  );
}
