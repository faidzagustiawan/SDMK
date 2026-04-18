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
        <main className="main-content">{children}</main>
      </div>
    </div>
  );
}
