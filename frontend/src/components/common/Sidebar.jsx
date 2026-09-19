import React from 'react';
import { 
  Home, 
  BookOpen, 
  Layers, 
  HelpCircle, 
  Sparkles, 
  PieChart, 
  CheckCircle2,
  Settings,
  HelpCircle as SupportIcon,
  FolderPlus
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export default function Sidebar({ onOpenCreateSpace }) {
  const { currentSpace, route, navigate } = useApp();

  const isSpaceActive = (page) => {
    return route.spaceId && route.page === page;
  };

  return (
    <aside className="app-sidebar">
      {/* Brand Header */}
      <div className="sidebar-header">
        <div className="logo-badge">
          <BookOpen size={20} />
        </div>
        <div className="logo-text">
          <h2>NoteRecall</h2>
          <span>Active Learning AI</span>
        </div>
      </div>

      {/* Main Navigation */}
      <nav className="sidebar-nav">
        <div
          className={`nav-item ${route.page === 'spaces' ? 'active' : ''}`}
          onClick={() => navigate('spaces')}
          id="nav-spaces-btn"
        >
          <div className="nav-item-content">
            <Home size={18} />
            <span>Home</span>
          </div>
        </div>

        {currentSpace && (
          <>
            <div className="nav-section-title">Current Study Space</div>

            <div
              className={`nav-item ${isSpaceActive('overview') ? 'active' : ''}`}
              onClick={() => navigate('overview', currentSpace.id)}
              id="nav-overview-btn"
            >
              <div className="nav-item-content">
                <BookOpen size={18} />
                <span>Notes & Docs</span>
              </div>
            </div>

            <div
              className={`nav-item ${isSpaceActive('topics') ? 'active' : ''}`}
              onClick={() => navigate('topics', currentSpace.id)}
              id="nav-topics-btn"
            >
              <div className="nav-item-content">
                <Layers size={18} />
                <span>Topic Outline</span>
              </div>
            </div>

            <div
              className={`nav-item ${isSpaceActive('questions') ? 'active' : ''}`}
              onClick={() => navigate('questions', currentSpace.id)}
              id="nav-questions-btn"
            >
              <div className="nav-item-content">
                <HelpCircle size={18} />
                <span>Question Bank</span>
              </div>
            </div>

            <div
              className={`nav-item ${isSpaceActive('flashcards') ? 'active' : ''}`}
              onClick={() => navigate('flashcards', currentSpace.id)}
              id="nav-flashcards-btn"
            >
              <div className="nav-item-content">
                <Sparkles size={18} />
                <span>Flashcards (SM-2)</span>
              </div>
            </div>

            <div
              className={`nav-item ${isSpaceActive('quiz') ? 'active' : ''}`}
              onClick={() => navigate('quiz', currentSpace.id)}
              id="nav-quiz-btn"
            >
              <div className="nav-item-content">
                <CheckCircle2 size={18} />
                <span>Practice Quiz</span>
              </div>
              <span className="nav-ai-badge">AI</span>
            </div>

            <div
              className={`nav-item ${isSpaceActive('dashboard') ? 'active' : ''}`}
              onClick={() => navigate('dashboard', currentSpace.id)}
              id="nav-dashboard-btn"
            >
              <div className="nav-item-content">
                <PieChart size={18} />
                <span>Mastery Stats</span>
              </div>
            </div>
          </>
        )}
      </nav>

      {/* Footer Items matching reference (Support, Settings, New Space) */}
      <div className="sidebar-footer">
        <button
          className="btn btn-secondary btn-sm"
          style={{ width: '100%', justifyContent: 'center', borderRadius: 'var(--radius-full)' }}
          onClick={onOpenCreateSpace}
          id="sidebar-create-space-btn"
        >
          <FolderPlus size={15} color="#2563eb" />
          <span className="footer-text">New Study Space</span>
        </button>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem', marginTop: '0.5rem' }}>
          <div
            className="nav-item"
            style={{ padding: '0.55rem 0.85rem', fontSize: '0.84rem' }}
            onClick={() => alert('NoteRecall Active Recall Assistant — Need help? Check the docs or create a study space to begin!')}
          >
            <div className="nav-item-content">
              <SupportIcon size={16} />
              <span>Support</span>
            </div>
          </div>
          <div
            className="nav-item"
            style={{ padding: '0.55rem 0.85rem', fontSize: '0.84rem' }}
            onClick={() => navigate('dashboard', currentSpace?.id)}
          >
            <div className="nav-item-content">
              <Settings size={16} />
              <span>Settings</span>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
