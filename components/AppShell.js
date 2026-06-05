'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { Navbar } from './Navbar';
import { Sidebar } from './Sidebar';

export function AppShell({ children }) {
  const { isLoggedIn } = useAuth();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (!isLoggedIn) router.replace('/login');
  }, [isLoggedIn]);

  // Close sidebar on route change (mobile)
  useEffect(() => { setSidebarOpen(false); }, []);

  if (!isLoggedIn) return null;

  return (
    <div className="app-shell">
      <Navbar onHamburger={() => setSidebarOpen(p => !p)} />
      <div style={{ display:'flex', flex:1 }}>
        <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <main className="main-content" style={{ paddingBottom: '6rem' }}>
          {children}
        </main>
        
        {/* Fixed Footer */}
        <footer style={{ 
          position: 'fixed', 
          bottom: 0, 
          right: 0, 
          left: 'var(--sidebar-w)', 
          padding: '14px', 
          textAlign: 'center', 
          fontSize: '13px', 
          color: 'var(--ink-m)', 
          borderTop: '1px solid var(--border)', 
          background: 'var(--bg-glass)', 
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          zIndex: 90 
        }}>
          &copy; {new Date().getFullYear()} — Dibuat untuk <strong style={{ color: 'var(--teal-d)', fontWeight: 800 }}>SDMK</strong>
        </footer>
      </div>
    </div>
  );
}
