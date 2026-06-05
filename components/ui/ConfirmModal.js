'use client';

import { useApp } from '@/contexts/AppContext';

export function ConfirmModal() {
  const { confirmDialog, closeConfirm } = useApp();

  if (!confirmDialog?.visible) return null;

  return (
    <div className="modal-overlay" style={{ zIndex: 9999 }}>
      <div className="modal-box" style={{ maxWidth: '400px', padding: '1.5rem', textAlign: 'center' }}>
        <div style={{ 
          width: '48px', height: '48px', borderRadius: '50%', 
          background: confirmDialog.danger ? 'var(--red-p)' : 'var(--teal-p)', 
          color: confirmDialog.danger ? 'var(--red)' : 'var(--teal)', 
          display: 'flex', alignItems: 'center', justifyContent: 'center', 
          margin: '0 auto 16px', fontSize: '24px' 
        }}>
          {confirmDialog.danger ? '⚠️' : '❓'}
        </div>
        <div className="modal-title" style={{ fontSize: '18px' }}>{confirmDialog.title}</div>
        <div style={{ fontSize: '14px', color: 'var(--ink-m)', marginBottom: '24px', lineHeight: 1.5 }}>
          {confirmDialog.message}
        </div>
        
        <div style={{ display: 'flex', gap: '12px' }}>
          <button className="btn btn-secondary" style={{ flex: 1 }} onClick={closeConfirm}>
            Batal
          </button>
          <button 
            className={`btn ${confirmDialog.danger ? 'btn-danger' : 'btn-primary'}`} 
            style={{ flex: 1 }} 
            onClick={() => {
              if (confirmDialog.onConfirm) confirmDialog.onConfirm();
              closeConfirm();
            }}
          >
            Ya, Lanjutkan
          </button>
        </div>
      </div>
    </div>
  );
}
