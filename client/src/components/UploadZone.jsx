import React, { useState } from 'react';
import { UploadCloud, FileVideo, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import axios from 'axios';

const API_URL = 'http://localhost:3000/api/upload';

export default function UploadZone({ onUploadSuccess }) {
  const [selectedFile, setSelectedFile] = useState(null);
  const [title, setTitle] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState(null);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      setError(null);
      // Always set title to current selected file name (without extension)
      setTitle(file.name.replace(/\.[^/.]+$/, ''));
      // Reset input value to allow selecting same file again if needed
      e.target.value = '';
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!selectedFile) {
      setError('Please select a video file first');
      return;
    }

    setUploading(true);
    setUploadProgress(0);
    setError(null);

    const videoTitle = title.trim() || selectedFile.name.replace(/\.[^/.]+$/, '');

    const formData = new FormData();
    formData.append('video', selectedFile);
    formData.append('title', videoTitle);

    try {
      const res = await axios.post(API_URL, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (progressEvent) => {
          const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setUploadProgress(percent);
        },
      });

      setUploading(false);
      setSelectedFile(null);
      setTitle('');

      if (onUploadSuccess && res.data && res.data.video) {
        onUploadSuccess(res.data.video);
      }
    } catch (err) {
      setUploading(false);
      setError(err.response?.data?.error || err.message || 'Upload failed');
    }
  };

  return (
    <div className="glass-card">
      <h2 className="section-title">
        <UploadCloud size={20} color="var(--primary)" />
        Upload Media Content
      </h2>

      <form onSubmit={handleUpload}>
        <div 
          className="dropzone"
          onClick={() => document.getElementById('video-input').click()}
        >
          <FileVideo size={48} color={selectedFile ? 'var(--primary)' : 'var(--text-muted)'} />
          {selectedFile ? (
            <div>
              <p style={{ fontWeight: 700, color: 'var(--text-main)' }}>{selectedFile.name}</p>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
              </p>
            </div>
          ) : (
            <div>
              <p style={{ fontWeight: 600, color: 'var(--text-main)' }}>
                Click or Drag video to upload
              </p>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                Supports MP4, MOV, AVI, MKV (Up to 500MB)
              </p>
            </div>
          )}
          <input
            id="video-input"
            type="file"
            accept="video/*"
            style={{ display: 'none' }}
            onChange={handleFileChange}
          />
        </div>

        {selectedFile && (
          <div>
            <input
              type="text"
              className="upload-input-field"
              placeholder="Video Title / Description"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>
        )}

        {error && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--error)', marginTop: '12px', fontSize: '0.9rem' }}>
            <AlertCircle size={16} />
            {error}
          </div>
        )}

        {uploading && (
          <div style={{ marginTop: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '4px' }}>
              <span>Uploading to API Gateway...</span>
              <span>{uploadProgress}%</span>
            </div>
            <div className="progress-track">
              <div className="progress-fill" style={{ width: `${uploadProgress}%` }}></div>
            </div>
          </div>
        )}

        <button
          type="submit"
          className="btn-primary"
          disabled={!selectedFile || uploading}
        >
          {uploading ? (
            <>
              <Loader2 size={18} className="spin" style={{ animation: 'spin 1s linear infinite' }} />
              Uploading Video...
            </>
          ) : (
            <>
              <UploadCloud size={18} />
              Submit to Transcode Queue
            </>
          )}
        </button>
      </form>
    </div>
  );
}
