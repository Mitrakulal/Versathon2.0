import React, { useState, useEffect, useCallback } from 'react';
import { BookOpen, Layers, HelpCircle, Sparkles, CheckCircle2, PieChart, FileText } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { documentsService } from '../services/documentsService';
import FileUploader from '../components/upload/FileUploader';
import TextPaster from '../components/upload/TextPaster';
import DocumentList from '../components/upload/DocumentList';
import Button from '../components/common/Button';
import LoadingSpinner from '../components/common/LoadingSpinner';

export default function SpaceOverviewPage() {
  const { currentSpace, navigate } = useApp();
  const [documents, setDocuments] = useState([]);
  const [loadingDocs, setLoadingDocs] = useState(true);

  const fetchDocs = useCallback(async () => {
    if (!currentSpace) return;
    try {
      setLoadingDocs(true);
      const docs = await documentsService.listDocuments(currentSpace.id);
      setDocuments(docs || []);
    } catch (err) {
      console.error('Error fetching documents', err);
    } finally {
      setLoadingDocs(false);
    }
  }, [currentSpace]);

  useEffect(() => {
    fetchDocs();
  }, [fetchDocs]);

  if (!currentSpace) {
    return <LoadingSpinner text="Loading study space..." />;
  }

  const handleDocumentAdded = (newDoc) => {
    setDocuments(prev => [newDoc, ...prev]);
  };

  return (
    <div>
      {/* Space Header Card */}
      <div className="glass-card" style={{ marginBottom: '2rem', padding: '2rem', borderRadius: 'var(--radius-xl)' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.25rem' }}>
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: '#2563eb', fontSize: '0.78rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.4rem' }}>
              <BookOpen size={14} />
              <span>Study Space Overview</span>
            </div>
            <h1 style={{ fontSize: '1.85rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.5rem' }}>
              {currentSpace.title}
            </h1>
            <p style={{ color: '#64748b', maxWidth: '720px', fontSize: '0.95rem', lineHeight: 1.5 }}>
              {currentSpace.description || 'Upload notes or paste transcripts below to extract grounded question banks and practice flashcards.'}
            </p>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            <Button
              variant="secondary"
              icon={Sparkles}
              onClick={() => navigate('flashcards', currentSpace.id)}
              style={{ borderRadius: 'var(--radius-full)' }}
            >
              Flashcards
            </Button>
            <Button
              variant="primary"
              icon={CheckCircle2}
              onClick={() => navigate('quiz', currentSpace.id)}
              style={{ borderRadius: 'var(--radius-full)' }}
            >
              Start Quiz
            </Button>
          </div>
        </div>

        {/* Quick Action Navigation Pills */}
        <div style={{ display: 'flex', gap: '0.65rem', flexWrap: 'wrap', borderTop: '1px solid #f1f5f9', paddingTop: '1.25rem' }}>
          <button
            className="btn btn-ghost btn-sm"
            onClick={() => navigate('topics', currentSpace.id)}
            style={{ border: '1px solid #e2e8f0', background: '#f8fafc', borderRadius: 'var(--radius-full)', color: '#334155', fontWeight: 600 }}
          >
            <Layers size={14} color="#0284c7" />
            <span>Topic Hierarchy</span>
          </button>
          <button
            className="btn btn-ghost btn-sm"
            onClick={() => navigate('questions', currentSpace.id)}
            style={{ border: '1px solid #e2e8f0', background: '#f8fafc', borderRadius: 'var(--radius-full)', color: '#334155', fontWeight: 600 }}
          >
            <HelpCircle size={14} color="#2563eb" />
            <span>Question Bank</span>
          </button>
          <button
            className="btn btn-ghost btn-sm"
            onClick={() => navigate('dashboard', currentSpace.id)}
            style={{ border: '1px solid #e2e8f0', background: '#f8fafc', borderRadius: 'var(--radius-full)', color: '#334155', fontWeight: 600 }}
          >
            <PieChart size={14} color="#10b981" />
            <span>Mastery Dashboard</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Upload Options + Uploaded Documents */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))', gap: '1.75rem', alignItems: 'start' }}>
        {/* Ingestion Methods */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <FileUploader spaceId={currentSpace.id} onDocumentAdded={handleDocumentAdded} />
          <TextPaster spaceId={currentSpace.id} onDocumentAdded={handleDocumentAdded} />
        </div>

        {/* Document Ingestion Status List */}
        <div className="glass-card" style={{ borderRadius: 'var(--radius-xl)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
            <h3 style={{ fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#0f172a' }}>
              <FileText size={18} color="#2563eb" />
              Ingested Documents ({documents.length})
            </h3>
            <button
              className="btn btn-ghost btn-sm"
              onClick={fetchDocs}
              style={{ fontSize: '0.78rem', color: '#2563eb', fontWeight: 600 }}
            >
              Refresh
            </button>
          </div>

          <DocumentList documents={documents} loading={loadingDocs} />
        </div>
      </div>
    </div>
  );
}
