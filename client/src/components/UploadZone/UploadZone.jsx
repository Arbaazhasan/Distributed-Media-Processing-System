import React, { useState, useRef } from 'react';
import { UploadCloud, FileVideo, AlertCircle, Loader2 } from 'lucide-react';
import { videoService } from '../../services/api';
import './UploadZone.scss';

export default function UploadZone({ onUploadSuccess }) {
  const [selectedFile, setSelectedFile] = useState(null);
  const [title, setTitle] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      setError(null);
      setTitle(file.name.replace(/\.[^/.]+$/, ''));
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
      const res = await videoService.upload(formData, (percent) => {
        setUploadProgress(percent);
      });

      setUploading(false);
      setSelectedFile(null);
      setTitle('');

      if (onUploadSuccess && res?.video) {
        onUploadSuccess(res.video);
      }
    } catch (err) {
      setUploading(false);
      setError(err.response?.data?.error || err.message || 'Upload failed');
    }
  };

  return (
    <div className="upload-card">
      <h2 className="upload-card__header">
        <UploadCloud size={20} className="upload-card__icon" />
        Upload Media Content
      </h2>

      <form onSubmit={handleUpload}>
        <div 
          className="upload-card__dropzone"
          onClick={() => fileInputRef.current?.click()}
        >
          <FileVideo 
            size={48} 
            className={`upload-card__file-icon ${selectedFile ? 'upload-card__file-icon--selected' : ''}`}
          />

          {selectedFile ? (
            <div>
              <p className="upload-card__filename">{selectedFile.name}</p>
              <p className="upload-card__filesize">
                {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
              </p>
            </div>
          ) : (
            <div>
              <p className="upload-card__prompt-main">Click or Drag video to upload</p>
              <p className="upload-card__prompt-sub">Supports MP4, MOV, AVI, MKV (Up to 500MB)</p>
            </div>
          )}

          <input
            ref={fileInputRef}
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
              className="upload-card__input-field"
              placeholder="Video Title / Description"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>
        )}

        {error && (
          <div className="upload-card__error-message">
            <AlertCircle size={16} />
            {error}
          </div>
        )}

        {uploading && (
          <div className="upload-card__progress-wrapper">
            <div className="upload-card__progress-info">
              <span>Uploading to API Gateway...</span>
              <span>{uploadProgress}%</span>
            </div>
            <div className="upload-card__progress-track">
              <div 
                className="upload-card__progress-fill" 
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
          </div>
        )}

        <button
          type="submit"
          className="upload-card__submit-btn"
          disabled={!selectedFile || uploading}
        >
          {uploading ? (
            <>
              <Loader2 size={18} className="upload-card__spinner" />
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
