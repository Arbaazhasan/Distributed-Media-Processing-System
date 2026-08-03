import React from 'react';
import { Cpu, Clock, Terminal, Download, Play } from 'lucide-react';
import { SERVER_HOST } from '../../config/constants';
import './ProcessingTracker.scss';

export default function ProcessingTracker({ currentJob, logs, onStreamSelect }) {
  const targetId = currentJob?.videoId || currentJob?.id || currentJob?._id;
  const isCompleted = currentJob?.status === 'completed';

  const handleStreamClick = (e, res) => {
    e.preventDefault();
    if (onStreamSelect) {
      onStreamSelect({
        title: `${currentJob.title || 'Video'} (${res.resolution})`,
        filepath: res.filepath,
        resolution: res.resolution,
      });
    } else {
      window.open(`${SERVER_HOST}${res.filepath}`, '_blank');
    }
  };

  return (
    <div className="job-tracker">
      <h2 className="job-tracker__header">
        <Cpu size={20} className="job-tracker__header-icon" />
        Distributed Job Monitor
      </h2>

      {currentJob ? (
        <div className="job-tracker__job-details">
          <div className="job-tracker__title-bar">
            <span className="job-tracker__job-title">{currentJob.title || 'Transcoding Task'}</span>
            <span className="job-tracker__resolution-badge">
              {currentJob.currentResolution || 'Queued'}
            </span>
          </div>

          <div className="job-tracker__status-row">
            <span>
              Status:{' '}
              <strong className={`job-tracker__status-text ${isCompleted ? 'job-tracker__status-text--completed' : ''}`}>
                {currentJob.status?.toUpperCase()}
              </strong>
            </span>
            <span>{currentJob.progress || 0}%</span>
          </div>

          <div className="job-tracker__progress-track">
            <div 
              className="job-tracker__progress-fill" 
              style={{ width: `${currentJob.progress || 0}%` }}
            />
          </div>

          {currentJob.outputResolutions && currentJob.outputResolutions.length > 0 && (
            <div className="job-tracker__streams-section">
              <p className="job-tracker__streams-label">Output Streams Ready:</p>
              <div className="job-tracker__streams-grid">
                {currentJob.outputResolutions.map((res, i) => (
                  <div key={i} className="job-tracker__stream-chip">
                    <span className="job-tracker__stream-res">{res.resolution}</span>

                    <button 
                      onClick={(e) => handleStreamClick(e, res)}
                      title="Play / Stream in App Player"
                      className="job-tracker__stream-btn job-tracker__stream-btn--play"
                      style={{ border: 'none', cursor: 'pointer' }}
                    >
                      <Play size={12} /> Stream
                    </button>

                    {targetId && (
                      <a 
                        href={`${SERVER_HOST}/api/videos/download/${targetId}/${res.resolution}`}
                        download
                        title="Download MP4 to Local Machine"
                        className="job-tracker__stream-btn job-tracker__stream-btn--download"
                      >
                        <Download size={12} /> Download
                      </a>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="job-tracker__empty-state">
          <Clock size={36} className="job-tracker__empty-icon" />
          <p>No active transcoding jobs in progress.</p>
          <p className="job-tracker__empty-sub">
            Upload a video file to observe real-time distributed worker logs.
          </p>
        </div>
      )}

      <div className="job-tracker__logs-section">
        <p className="job-tracker__logs-header">
          <Terminal size={14} /> Real-Time Redis Pub/Sub Stream
        </p>
        <div className="job-tracker__log-stream">
          {logs.length === 0 ? (
            <div className="job-tracker__log-item">Awaiting signaling events from Redis Pub/Sub...</div>
          ) : (
            logs.map((log, index) => (
              <div key={index} className="job-tracker__log-item">
                <span className="job-tracker__log-time">[{log.time}]</span> {log.message}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
