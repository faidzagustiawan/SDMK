'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { useApp } from '@/contexts/AppContext';

function SidebarContent({ onClose }) {
  const pathname = usePathname();
  const router = useRouter();
  const { currentUser, logout } = useAuth();
  const { toast } = useApp();
  const isAdmin = currentUser?.role === 'admin';

  const items = [
    { label: 'Dashboard', icon: '📊', href: '/dashboard', exact: true },
    { label: 'Profil Saya', icon: '👤', href: '/profil', exact: true },
  ];
  const adminItems = [
    { label: 'Kelola Pengguna', icon: '👥', href: '/admin/users', exact: false },
    
  ];

  function nav(href) { router.push(href); onClose?.(); }
  function isActive(item) { return item.exact ? pathname === item.href : pathname.startsWith(item.href); }

  function handleLogout() {
    if (window.confirm('Apakah Anda yakin ingin keluar dari aplikasi?')) {
      logout();
      toast('Berhasil keluar.', 'info');
      router.push('/login');
      onClose?.();
    }
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


      <style>{`
        .logout-btn { color: var(--red) !important; opacity: 0.8; }
        .logout-btn:hover { background: var(--red-p) !important; color: var(--red) !important; opacity: 1; }
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
