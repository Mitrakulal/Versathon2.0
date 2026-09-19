import React, { useState, useRef } from 'react';
import { UploadCloud, FileText, CheckCircle2, AlertCircle } from 'lucide-react';
import { documentsService } from '../../services/documentsService';
import { useApp } from '../../context/AppContext';
import Button from '../common/Button';

export default function FileUploader({ spaceId, onDocumentAdded }) {
  const { showToast } = useApp();
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  const inputRef = useRef(null);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndSetFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      validateAndSetFile(e.target.files[0]);
    }
  };

  const validateAndSetFile = (file) => {
    const validExtensions = ['pdf', 'docx', 'txt', 'md'];
    const ext = file.name.split('.').pop().toLowerCase();
    if (!validExtensions.includes(ext)) {
      setError(`Unsupported file type .${ext}. Please upload PDF, DOCX, TXT, or MD.`);
      return;
    }
    setError(null);
    setSelectedFile(file);
  };

  const handleUpload = async () => {
    if (!selectedFile || !spaceId) return;

    try {
      setUploading(true);
      setError(null);
      const newDoc = await documentsService.uploadDocument(spaceId, selectedFile);
      showToast(`Uploaded "${selectedFile.name}" successfully! Ingestion processing started.`, 'success');
      setSelectedFile(null);
      if (inputRef.current) inputRef.current.value = '';
      if (onDocumentAdded) onDocumentAdded(newDoc);
    } catch (err) {
      setError(err.detail || 'Upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="glass-card">
      <h3 style={{ fontSize: '1.1rem', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <UploadCloud size={18} color="#818cf8" />
        Upload Study Notes
      </h3>
      <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '1.25rem' }}>
        Upload PDF lecture slides, DOCX syllabi, or Markdown summaries. NoteRecall extracts structured topics automatically.
      </p>

      {error && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.65rem 0.85rem', background: 'rgba(244, 63, 94, 0.15)', border: '1px solid rgba(244, 63, 94, 0.3)', borderRadius: 'var(--radius-md)', color: '#fb7185', marginBottom: '1rem', fontSize: '0.85rem' }}>
          <AlertCircle size={16} />
          <span>{error}</span>
        </div>
      )}

      {/* Drag & Drop Area */}
      <div
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        style={{
          border: `2px dashed ${dragActive ? 'var(--primary-500)' : 'var(--border-card)'}`,
          background: dragActive ? 'rgba(99, 102, 241, 0.08)' : 'rgba(0, 0, 0, 0.2)',
          borderRadius: 'var(--radius-lg)',
          padding: '2.5rem 1.5rem',
          textAlign: 'center',
          cursor: 'pointer',
          transition: 'all var(--transition-fast)',
        }}
      >
        <input
          ref={inputRef}
          type="file"
          accept=".pdf,.docx,.txt,.md"
          onChange={handleFileChange}
          style={{ display: 'none' }}
          id="file-upload-input"
        />

        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.6rem' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'rgba(99, 102, 241, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#818cf8' }}>
            <UploadCloud size={24} />
          </div>
          <div>
            <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>Click to browse</span>
            <span style={{ color: 'var(--text-secondary)' }}> or drag and drop your file</span>
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            Supported formats: PDF, DOCX, TXT, Markdown (Max 25MB)
          </div>
        </div>
      </div>

      {/* Selected file preview & upload button */}
      {selectedFile && (
        <div style={{ marginTop: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.75rem 1rem', background: 'var(--bg-surface-elevated)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-card)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', overflow: 'hidden' }}>
            <FileText size={18} color="#06b6d4" />
            <div style={{ overflow: 'hidden' }}>
              <div style={{ fontSize: '0.85rem', fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {selectedFile.name}
              </div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                {(selectedFile.size / 1024).toFixed(1)} KB
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <Button variant="ghost" size="sm" onClick={() => setSelectedFile(null)} disabled={uploading}>
              Clear
            </Button>
            <Button variant="primary" size="sm" onClick={handleUpload} loading={uploading} id="confirm-upload-btn">
              Ingest & Extract
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
