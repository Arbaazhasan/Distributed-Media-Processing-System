import React from 'react';
import { Cpu, Activity, CheckCircle2, Clock, Terminal, Download, Play } from 'lucide-react';

export default function ProcessingTracker({ currentJob, logs }) {
  const targetId = currentJob?.videoId || currentJob?.id || currentJob?._id;

  return (
    <div className="glass-card">
      <h2 className="section-title">
        <Cpu size={20} color="var(--accent-cyan)" />
        Distributed Job Monitor
      </h2>

      {currentJob ? (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontWeight: 700, fontSize: '1.05rem' }}>{currentJob.title || 'Transcoding Task'}</span>
            <span className="resolution-badge">{currentJob.currentResolution || 'Queued'}</span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '8px' }}>
            <span>Status: <strong style={{ color: currentJob.status === 'completed' ? 'var(--success)' : 'var(--accent-cyan)' }}>{currentJob.status?.toUpperCase()}</strong></span>
            <span>{currentJob.progress || 0}%</span>
          </div>

          <div className="progress-track">
            <div 
              className="progress-fill" 
              style={{ width: `${currentJob.progress || 0}%` }}
            ></div>
          </div>

          {currentJob.outputResolutions && currentJob.outputResolutions.length > 0 && (
            <div style={{ marginTop: '16px' }}>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '8px' }}>Output Streams Ready:</p>
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                {currentJob.outputResolutions.map((res, i) => (
                  <div 
                    key={i} 
                    style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: '6px',
                      background: 'rgba(16, 185, 129, 0.12)', 
                      padding: '6px 12px', 
                      borderRadius: '8px',
                      border: '1px solid rgba(16, 185, 129, 0.25)' 
                    }}
                  >
                    <span style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--success)' }}>
                      {res.resolution}
                    </span>

                    <a 
                      href={`http://localhost:3000${res.filepath}`}
                      target="_blank"
                      rel="noreferrer"
                      title="Play / Stream in Browser"
                      style={{ 
                        display: 'inline-flex', 
                        alignItems: 'center', 
                        gap: '4px',
                        padding: '3px 8px',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        background: 'rgba(99, 102, 241, 0.2)',
                        color: 'var(--primary)',
                        borderRadius: '4px',
                        textDecoration: 'none'
                      }}
                    >
                      <Play size={12} /> Stream
                    </a>

                    {targetId && (
                      <a 
                        href={`http://localhost:3000/api/videos/download/${targetId}/${res.resolution}`}
                        download
                        title="Download MP4 to Local Machine"
                        style={{ 
                          display: 'inline-flex', 
                          alignItems: 'center', 
                          gap: '4px',
                          padding: '3px 8px',
                          fontSize: '0.75rem',
                          fontWeight: 600,
                          background: 'rgba(16, 185, 129, 0.25)',
                          color: '#10b981',
                          borderRadius: '4px',
                          textDecoration: 'none'
                        }}
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
        <div style={{ textAlignment: 'center', padding: '30px 0', color: 'var(--text-muted)', textAlign: 'center' }}>
          <Clock size={36} style={{ marginBottom: '12px', opacity: 0.5 }} />
          <p>No active transcoding jobs in progress.</p>
          <p style={{ fontSize: '0.8rem', marginTop: '4px' }}>Upload a video file to observe real-time distributed worker logs.</p>
        </div>
      )}

      <div style={{ marginTop: '24px' }}>
        <p style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Terminal size={14} /> Real-Time Redis Pub/Sub Stream
        </p>
        <div className="log-stream">
          {logs.length === 0 ? (
            <div className="log-item">Awaiting signaling events from Redis Pub/Sub...</div>
          ) : (
            logs.map((log, index) => (
              <div key={index} className="log-item">
                <span className="time">[{log.time}]</span> {log.message}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
