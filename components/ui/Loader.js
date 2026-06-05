'use client';

import { useApp } from '@/contexts/AppContext';

export function Loader() {
  const { loader } = useApp();
  if (!loader.visible) return null;

  return (
    <div style={{
      position: 'fixed', inset: 0,
      background: 'var(--bg-glass)',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      zIndex: 9999, backdropFilter: 'blur(4px)',
    }}>
      <div style={{
        width: 36, height: 36,
        border: '3px solid var(--border)',
        borderTopColor: 'var(--teal)',
        borderRadius: '50%',
        animation: 'spin .7s linear infinite',
      }} />
      <div style={{ marginTop: 12, fontSize: 13, color: 'var(--ink-m)', fontWeight: 500 }}>{loader.text}</div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
