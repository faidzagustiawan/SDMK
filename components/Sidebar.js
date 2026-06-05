'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { useApp } from '@/contexts/AppContext';
import { IconDashboard, IconProfile, IconUsers } from '@/components/ui/Icons';

function SidebarContent({ onClose }) {
  const pathname = usePathname();
  const router = useRouter();
  const { currentUser, logout } = useAuth();
  const { toast, confirm } = useApp();
  const isAdmin = currentUser?.role === 'admin';

  const items = [
    { label: 'Dashboard', icon: <IconDashboard />, href: '/dashboard', exact: true },
    { label: 'Profil Saya', icon: <IconProfile />, href: '/profil', exact: true },
  ];
  const adminItems = [
    { label: 'Kelola Pengguna', icon: <IconUsers />, href: '/admin/users', exact: false },
    
  ];

  function nav(href) { router.push(href); onClose?.(); }
  function isActive(item) { return item.exact ? pathname === item.href : pathname.startsWith(item.href); }

  function handleLogout() {
    confirm(
      'Konfirmasi Keluar',
      'Apakah Anda yakin ingin keluar dari aplikasi?',
      () => {
        logout();
        toast('Berhasil keluar.', 'info');
        router.push('/login');
        onClose?.();
      },
      true // danger color
    );
  }

  return (
    <nav style={{ display: 'flex', flexDirection: 'column', height: '100%', padding: '1.5rem 0' }}>
      <div style={{ flex: 1 }}>
        <div className="sb-section">
          <div className="sb-label">Menu</div>
          {items.map(item => (
            <button key={item.href} className={`sb-item${isActive(item) ? ' active' : ''}`} onClick={() => nav(item.href)}>
              <span className="sb-icon">{item.icon}</span>{item.label}
            </button>
          ))}
        </div>
        
        {isAdmin && (
          <div className="sb-section">
            <div className="sb-label">Admin</div>
            {adminItems.map(item => (
              <button key={item.href} className={`sb-item${isActive(item) ? ' active' : ''}`} onClick={() => nav(item.href)}>
                <span className="sb-icon">{item.icon}</span>{item.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Mobile-only User Profile in Sidebar */}
      <div className="mobile-only" style={{ padding: '1.5rem', borderTop: '1px solid var(--border)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
           <div style={{ width: 36, height: 36, background: 'var(--teal)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 700, color: 'white' }}>
             {currentUser ? (currentUser.name || currentUser.username)[0].toUpperCase() : '?'}
           </div>
           <div>
             <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--ink)', lineHeight: 1.2 }}>{currentUser?.name || currentUser?.username}</div>
             <div style={{ fontSize: 12, color: 'var(--ink-m)', marginTop: 2 }}>{currentUser?.role === 'admin' ? 'Administrator' : 'Pengguna'}</div>
           </div>
        </div>
        <button onClick={handleLogout} className="sb-item logout-btn" style={{ justifyContent: 'center', background: 'var(--red-p)' }}>
          Keluar
        </button>
      </div>

      <style>{`
        .logout-btn { color: var(--red) !important; opacity: 0.9; }
        .logout-btn:hover { background: var(--red-p) !important; color: var(--red) !important; opacity: 1; }
        @media (min-width: 641px) { .mobile-only { display: none; } }
      `}</style>
    </nav>
  );
}

export function Sidebar({ open, onClose }) {
  return (
    <>
      <aside className={`sidebar${open ? ' open' : ''}`}>
        <SidebarContent onClose={onClose} />
      </aside>
      <div className={`sidebar-overlay${open ? ' open' : ''}`} onClick={onClose} />
    </>
  );
}
