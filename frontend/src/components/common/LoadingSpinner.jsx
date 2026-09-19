import React from 'react';

export default function LoadingSpinner({ text = 'Loading...', size = 'md' }) {
  const dimension = size === 'sm' ? '20px' : size === 'lg' ? '48px' : '32px';
  
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '3rem 1rem', gap: '1rem' }}>
      <div 
        className="spinner" 
        style={{ width: dimension, height: dimension }} 
      />
      {text && <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>{text}</p>}
    </div>
  );
}
