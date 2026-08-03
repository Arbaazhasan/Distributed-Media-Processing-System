import React from 'react';
import { Play, Download, Trash2 } from 'lucide-react';
import { SERVER_HOST } from '../../config/constants';

export default function VideoCard({ video, onSelect, onDelete, onStreamSelect }) {
  const videoId = video._id || video.id;
  const isCompleted = video.status === 'completed';

  const handleDelete = (e) => {
    e.stopPropagation();
    if (window.confirm(`Are you sure you want to delete "${video.title}"?`)) {
      onDelete(videoId);
    }
  };

  const getStreamUrl = (res) => {
    if (res.url && res.url.startsWith('http')) return res.url;
    if (res.filepath && res.filepath.startsWith('http')) return res.filepath;
    return `${SERVER_HOST}${res.filepath}`;
  };

  const handlePlayStream = (e, res) => {
    e.preventDefault();
    const streamUrl = getStreamUrl(res);
    if (onStreamSelect) {
      onStreamSelect({
        title: `${video.title} (${res.resolution})`,
        filepath: streamUrl,
        resolution: res.resolution,
      });
    } else {
      window.open(streamUrl, '_blank');
    }
  };

  return (
    <div className="video-card">
      <div className="video-card__header">
        <span 
          className="video-card__title"
          onClick={() => onSelect && onSelect(video)}
        >
          {video.title}
        </span>

        <div className="video-card__actions">
          <span className={`video-card__status-badge ${isCompleted ? 'video-card__status-badge--completed' : ''}`}>
            {video.status}
          </span>

          {onDelete && (
            <button
              onClick={handleDelete}
              title="Delete video and files"
              className="video-card__delete-btn"
            >
              <Trash2 size={13} />
            </button>
          )}
        </div>
      </div>

      <div className="video-card__meta">
        <div>Original: {video.originalFilename || video.filename}</div>
        <div>Added: {video.createdAt ? new Date(video.createdAt).toLocaleTimeString() : 'Just now'}</div>
      </div>

      {video.outputResolutions && video.outputResolutions.length > 0 && (
        <div className="video-card__outputs">
          <p className="video-card__outputs-title">Available Resolutions & Downloads:</p>
          <div className="video-card__outputs-list">
            {video.outputResolutions.map((res, i) => {
              const streamUrl = getStreamUrl(res);
              const downloadUrl = (res.url && res.url.startsWith('http')) 
                ? res.url 
                : `${SERVER_HOST}/api/videos/download/${videoId}/${res.resolution}`;

              return (
                <div key={i} className="video-card__output-item">
                  <span className="video-card__resolution">{res.resolution}</span>

                  <div className="video-card__output-actions">
                    <button 
                      onClick={(e) => handlePlayStream(e, res)}
                      title="Play / Stream in App Player"
                      className="video-card__link-btn video-card__link-btn--play"
                      style={{ border: 'none', cursor: 'pointer' }}
                    >
                      <Play size={12} /> Play
                    </button>

                    <a 
                      href={downloadUrl}
                      download
                      target="_blank"
                      rel="noreferrer"
                      title="Download MP4 Video"
                      className="video-card__link-btn video-card__link-btn--download"
                    >
                      <Download size={12} /> Download
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
