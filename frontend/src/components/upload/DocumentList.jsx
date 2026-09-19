import React from 'react';
import { FileText, CheckCircle2, Clock, AlertTriangle, Layers } from 'lucide-react';

export default function DocumentList({ documents, loading }) {
  if (loading) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center', color: '#64748b' }}>
        <div className="spinner" style={{ margin: '0 auto 0.75rem auto' }} />
        <span>Loading study materials...</span>
      </div>
    );
  }

  if (!documents || documents.length === 0) {
    return (
      <div style={{ padding: '2.5rem 1rem', textAlign: 'center', color: '#94a3b8', fontSize: '0.9rem' }}>
        No documents uploaded yet in this study space. Upload a PDF or paste lecture notes above to start!
      </div>
    );
  }

  const getStatusBadge = (status) => {
    switch (status) {
      case 'completed':
        return (
          <span className="badge badge-strong" style={{ gap: '0.3rem' }}>
            <CheckCircle2 size={12} />
            <span>Ready</span>
          </span>
        );
      case 'processing':
        return (
          <span className="badge badge-developing" style={{ gap: '0.3rem' }}>
            <Clock size={12} />
            <span>Processing...</span>
          </span>
        );
      case 'failed':
        return (
          <span className="badge badge-weak" style={{ gap: '0.3rem' }}>
            <AlertTriangle size={12} />
            <span>Failed</span>
          </span>
        );
      default:
        return (
          <span className="badge badge-neutral" style={{ gap: '0.3rem' }}>
            <Clock size={12} />
            <span>Pending</span>
          </span>
        );
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
      {documents.map((doc) => (
        <div
          key={doc.id}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '1rem 1.25rem',
            background: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: 'var(--radius-md)',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.02)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
            <div
              style={{
                width: '38px',
                height: '38px',
                borderRadius: 'var(--radius-md)',
                background: '#eff6ff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#2563eb',
              }}
            >
              <FileText size={18} />
            </div>
            <div>
              <div style={{ fontWeight: 600, fontSize: '0.92rem', color: '#0f172a', marginBottom: '0.15rem' }}>
                {doc.filename}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.75rem', color: '#64748b' }}>
                <span style={{ fontWeight: 600, color: '#475569' }}>{doc.file_type?.toUpperCase()}</span>
                <span>•</span>
                <span>Uploaded {new Date(doc.uploaded_at).toLocaleDateString()}</span>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            {doc.chunk_count !== undefined && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.8rem', color: '#64748b' }}>
                <Layers size={13} color="#0284c7" />
                <span>{doc.chunk_count} chunks</span>
              </div>
            )}
            {getStatusBadge(doc.status)}
          </div>
        </div>
      ))}
    </div>
  );
}
