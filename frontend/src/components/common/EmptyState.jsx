import React from 'react';
import Button from './Button';

export default function EmptyState({
  icon: Icon,
  title,
  description,
  actionText,
  onAction,
  actionIcon,
}) {
  return (
    <div className="empty-state glass-card">
      {Icon && (
        <div className="empty-icon-wrap">
          <Icon size={32} />
        </div>
      )}
      <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>{title}</h3>
      {description && (
        <p style={{ color: 'var(--text-secondary)', maxWidth: '420px', marginBottom: '1.5rem', fontSize: '0.92rem' }}>
          {description}
        </p>
      )}
      {actionText && onAction && (
        <Button variant="primary" icon={actionIcon} onClick={onAction}>
          {actionText}
        </Button>
      )}
    </div>
  );
}
