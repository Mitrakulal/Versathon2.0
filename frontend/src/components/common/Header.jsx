import React from 'react';
import { Search, Bell, Plus, ChevronRight, User } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import Button from './Button';

export default function Header({ onOpenCreateSpace }) {
  const { currentSpace, spaces, setCurrentSpace, route, navigate } = useApp();

  return (
    <header className="top-bar">
      {/* Left: Search pill like the reference screenshot */}
      <div style={{ position: 'relative', width: '320px' }}>
        <Search
          size={16}
          style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }}
        />
        <input
          type="text"
          className="form-input"
          placeholder="Search notes, topics, questions..."
          style={{
            paddingLeft: '2.5rem',
            paddingRight: '1rem',
            paddingTop: '0.55rem',
            paddingBottom: '0.55rem',
            borderRadius: 'var(--radius-full)',
            background: '#f8fafc',
            border: '1px solid #e2e8f0',
            width: '100%',
            fontSize: '0.86rem',
          }}
        />
      </div>

      {/* Right: Study Space dropdown, Notifications, User Avatar & New Space */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        {spaces.length > 0 && currentSpace && (
          <select
            className="form-select"
            style={{ 
              padding: '0.45rem 0.9rem', 
              fontSize: '0.84rem', 
              borderRadius: 'var(--radius-full)',
              background: '#f8fafc',
              borderColor: '#e2e8f0',
              fontWeight: 500,
              color: '#1e293b',
              maxWidth: '220px',
              cursor: 'pointer',
            }}
            value={currentSpace.id}
            onChange={(e) => {
              const selected = spaces.find(s => s.id === e.target.value);
              if (selected) {
                setCurrentSpace(selected);
                navigate(route.page === 'spaces' ? 'overview' : route.page, selected.id);
              }
            }}
            id="header-space-dropdown"
          >
            {spaces.map(s => (
              <option key={s.id} value={s.id}>
                {s.title}
              </option>
            ))}
          </select>
        )}

        {/* Notification Bell with alert dot */}
        <button
          className="btn btn-ghost"
          style={{ position: 'relative', padding: '0.5rem', borderRadius: 'var(--radius-full)', color: '#64748b' }}
          title="Notifications"
        >
          <Bell size={18} />
          <span
            style={{
              position: 'absolute',
              top: '6px',
              right: '6px',
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              background: '#ef4444',
              border: '2px solid #ffffff',
            }}
          />
        </button>

        {/* User Profile avatar pill matching the reference */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.6rem',
            padding: '0.35rem 0.75rem 0.35rem 0.35rem',
            background: '#f8fafc',
            border: '1px solid #e2e8f0',
            borderRadius: 'var(--radius-full)',
          }}
        >
          <div
            style={{
              width: '30px',
              height: '30px',
              borderRadius: '50%',
              background: '#e0edff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#2563eb',
              fontWeight: 700,
              fontSize: '0.8rem',
            }}
          >
            AL
          </div>
          <div style={{ lineHeight: 1.2 }}>
            <div style={{ fontSize: '0.8rem', fontWeight: 600, color: '#0f172a' }}>Alex Learner</div>
            <div style={{ fontSize: '0.68rem', color: '#94a3b8' }}>@active_recall</div>
          </div>
        </div>

        <Button
          variant="primary"
          size="sm"
          icon={Plus}
          onClick={onOpenCreateSpace}
          id="header-create-space-btn"
          style={{ borderRadius: 'var(--radius-full)', padding: '0.45rem 1rem' }}
        >
          New Space
        </Button>
      </div>
    </header>
  );
}
