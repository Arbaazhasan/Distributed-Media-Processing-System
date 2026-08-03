import React, { useEffect } from 'react';
import { X, Film } from 'lucide-react';
import { SERVER_HOST } from '../../config/constants';
import './VideoPlayerModal.scss';

export default function VideoPlayerModal({ videoData, onClose }) {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!videoData) return null;

  const fullStreamUrl = videoData.filepath.startsWith('http')
    ? videoData.filepath
    : `${SERVER_HOST}${videoData.filepath}`;

  return (
    <div className="video-modal-backdrop" onClick={onClose}>
      <div className="video-modal" onClick={(e) => e.stopPropagation()}>
        <div className="video-modal__header">
          <div className="video-modal__title-group">
            <Film size={18} color="var(--primary)" />
            <h3 className="video-modal__title">{videoData.title || 'Video Player'}</h3>
            <span className="video-modal__badge">{videoData.resolution || 'HD'}</span>
          </div>

          <button className="video-modal__close-btn" onClick={onClose} title="Close Player">
            <X size={20} />
          </button>
        </div>

        <div className="video-modal__body">
          <video
            className="video-modal__player"
            controls
            autoPlay
            playsInline
            src={fullStreamUrl}
          >
            Your browser does not support HTML5 video playback.
          </video>
        </div>

        <div className="video-modal__footer">
          <span>Stream Source: {videoData.resolution}</span>
          <a
            href={fullStreamUrl}
            target="_blank"
            rel="noreferrer"
            className="video-modal__direct-link"
          >
            Open Original Stream File ↗
          </a>
        </div>
      </div>
    </div>
  );
}
