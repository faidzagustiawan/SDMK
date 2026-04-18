'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { useApp } from '@/contexts/AppContext';

export function Navbar({ onHamburger }) {
  const { currentUser, logout } = useAuth();
  const { toast } = useApp();
  const router = useRouter();
  const [open, setOpen] = useState(false);

  function handleLogout() {
    if (confirm('Apakah Anda yakin ingin keluar?')) {
      logout();
      toast('Berhasil keluar.', 'info');
      router.push('/login');
    }
  }

  const initial = currentUser ? (currentUser.name || currentUser.username)[0].toUpperCase() : '?';
  const displayName = currentUser?.name || currentUser?.username || '—';

  return (
    <header className="app-header">
      {/* BRAND (Kiri) */}
      <div className="brand">
        <div className="brand-logo">S</div>
        <div>
          <div className="brand-name">Kalkulator SDMK</div>
          <div className="brand-sub">Analisis Kebutuhan Tenaga</div>
        </div>
      </div>

      {/* RIGHT CONTROLS (Kanan) */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        {/* User Dropdown */}
        <div style={{ position: 'relative' }}>
          <button 
            onClick={() => setOpen(p => !p)}
            className="nav-user-btn"
            style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', padding: '6px 10px', borderRadius: 6, background: 'none', border: 'none', color: '#ccc' }}
          >
            <div style={{ width: 30, height: 30, background: 'var(--teal)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 600, color: 'white', flexShrink: 0 }}>
              {initial}
            </div>
            <span className="user-name-text" style={{ fontSize: 13 }}>{displayName}</span>
            <span style={{ fontSize: 10 }}>▾</span>
          </button>

          {open && (
            <>
              <div style={{ position: 'fixed', inset: 0, zIndex: 199 }} onClick={() => setOpen(false)} />
              <div style={{ position: 'absolute', top: 'calc(100% + 6px)', right: 0, background: 'white', border: '.5px solid var(--border)', borderRadius: 'var(--r)', boxShadow: 'var(--shadow-l)', minWidth: 140, overflow: 'hidden', zIndex: 200 }}>
                <button className="h-drop-item danger" onClick={() => { setOpen(false); handleLogout(); }}>
                  ← Keluar
                </button>
              </div>
            </>
          )}
        </div>

        {/* Hamburger (Pindah ke paling kanan saat mobile) */}
        <button className="hamburger" onClick={onHamburger} aria-label="Menu" style={{ marginLeft: '5px' }}>☰</button>
      </div>

      <style>{`
        .h-drop-item { padding:10px 14px;font-size:13.5px;cursor:pointer;color:var(--ink-l);display:flex;align-items:center;gap:8px;transition:background .1s;border:none;background:none;width:100%;text-align:left;font-family:'DM Sans',sans-serif; }
        .h-drop-item:hover { background:var(--cream); }
        .h-drop-item.danger { color:var(--red); }
        .h-drop-item.danger:hover { background:var(--red-p); }
        
        @media (max-width: 640px) {
          .user-name-text { display: none; } /* Sembunyikan nama di mobile, hanya icon avatar */
          .nav-user-btn { display:none }
        }
      `}</style>
    </header>
  );
}