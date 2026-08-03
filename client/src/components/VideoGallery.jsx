import React from 'react';
import { Film, CheckCircle, Play, Download, Trash2, Clock } from 'lucide-react';

export default function VideoGallery({ videos, onSelectVideo, onDeleteVideo }) {
  if (!videos || videos.length === 0) {
    return (
      <div className="glass-card" style={{ marginTop: '24px' }}>
        <h2 className="section-title">
          <Film size={20} color="var(--primary)" />
          Media Library
        </h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
          No videos stored in MongoDB yet.
        </p>
      </div>
    );
  }

  return (
    <div className="glass-card" style={{ marginTop: '24px' }}>
      <h2 className="section-title">
        <Film size={20} color="var(--primary)" />
        Processed Video Library ({videos.length})
      </h2>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '16px', marginTop: '16px' }}>
        {videos.map((vid) => {
          const videoId = vid._id || vid.id;
          return (
            <div 
              key={videoId} 
              className="glass-card"
              style={{ 
                padding: '16px', 
                background: 'rgba(15, 23, 42, 0.5)',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-subtle)',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                <span 
                  style={{ fontWeight: 700, fontSize: '0.95rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '170px', cursor: 'pointer' }}
                  onClick={() => onSelectVideo && onSelectVideo(vid)}
                >
                  {vid.title}
                </span>

                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span 
                    className="resolution-badge"
                    style={{ 
                      background: vid.status === 'completed' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(99, 102, 241, 0.15)',
                      color: vid.status === 'completed' ? 'var(--success)' : 'var(--primary)',
                      borderColor: vid.status === 'completed' ? 'rgba(16, 185, 129, 0.3)' : 'rgba(99, 102, 241, 0.3)'
                    }}
                  >
                    {vid.status}
                  </span>

                  {onDeleteVideo && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (window.confirm(`Are you sure you want to delete "${vid.title}"?`)) {
                          onDeleteVideo(videoId);
                        }
                      }}
                      title="Delete video and files"
                      style={{
                        background: 'rgba(239, 68, 68, 0.15)',
                        border: '1px solid rgba(239, 68, 68, 0.3)',
                        color: 'var(--error)',
                        borderRadius: '6px',
                        padding: '4px 8px',
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        transition: 'all 0.2s ease'
                      }}
                    >
                      <Trash2 size={13} />
                    </button>
                  )}
                </div>
              </div>

              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '12px' }}>
                <div>Original: {vid.originalFilename || vid.filename}</div>
                <div>Added: {vid.createdAt ? new Date(vid.createdAt).toLocaleTimeString() : 'Just now'}</div>
              </div>

              {vid.outputResolutions && vid.outputResolutions.length > 0 && (
                <div style={{ marginTop: '12px', paddingTop: '12px', borderTop: '1px solid var(--border-subtle)' }}>
                  <p style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '8px' }}>
                    Available Resolutions & Downloads:
                  </p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    {vid.outputResolutions.map((res, i) => (
                      <div 
                        key={i} 
                        style={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          justify: 'space-between',
                          background: 'rgba(255,255,255,0.03)', 
                          padding: '6px 10px', 
                          borderRadius: '6px',
                          border: '1px solid rgba(255,255,255,0.06)'
                        }}
                      >
                        <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-main)' }}>
                          {res.resolution}
                        </span>

                        <div style={{ display: 'flex', gap: '6px' }}>
                          <a 
                            href={`http://localhost:3000${res.filepath}`}
                            target="_blank"
                            rel="noreferrer"
                            title="Play / Stream Stream"
                            style={{ 
                              display: 'inline-flex', 
                              alignItems: 'center', 
                              gap: '4px',
                              padding: '3px 8px',
                              fontSize: '0.75rem',
                              fontWeight: 600,
                              background: 'rgba(99, 102, 241, 0.15)',
                              color: 'var(--primary)',
                              borderRadius: '4px',
                              textDecoration: 'none'
                            }}
                          >
                            <Play size={12} /> Play
                          </a>

                          <a 
                            href={`http://localhost:3000/api/videos/download/${videoId}/${res.resolution}`}
                            download
                            title="Download MP4 to Computer"
                            style={{ 
                              display: 'inline-flex', 
                              alignItems: 'center', 
                              gap: '4px',
                              padding: '3px 8px',
                              fontSize: '0.75rem',
                              fontWeight: 600,
                              background: 'rgba(16, 185, 129, 0.2)',
                              color: '#10b981',
                              borderRadius: '4px',
                              textDecoration: 'none'
                            }}
                          >
                            <Download size={12} /> Download
                          </a>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
