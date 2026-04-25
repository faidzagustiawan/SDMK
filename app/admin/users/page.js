'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useApp } from '@/contexts/AppContext';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';

export default function AdminUsersPage() {
  const { currentUser } = useAuth();
  const { showLoader, hideLoader, toast } = useApp();
  const router = useRouter();

  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState('');
  const [confirm, setConfirm] = useState(null); // { user, newRole }

  const load = useCallback(async () => {
    showLoader('Memuat data pengguna…');

    const uRes = await api({ action: 'listUsers' });

    hideLoader();

    if (uRes.ok) {
      setUsers(uRes.data);
    } else {
      toast(uRes.error, 'error');
    }
  }, [showLoader, hideLoader, toast]);

  useEffect(() => {
    if (currentUser && currentUser.role !== 'admin') {
      router.replace('/dashboard');
      return;
    }

    if (currentUser) load();
  }, [currentUser, load, router]);

  function fmtDate(s) {
    return s
      ? new Date(s).toLocaleDateString('id-ID', {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
        })
      : '—';
  }

  async function changeRole(target_id, role) {
    setConfirm(null);

    showLoader('Mengubah role…');

    const res = await api({ action: 'setUserRole', target_id, role });

    hideLoader();

    if (res.ok) {
      toast('Role berhasil diubah.', 'success');
      load();
    } else {
      toast(res.error, 'error');
    }
  }

  const filtered = users.filter((u) =>
    (u.username || '').toLowerCase().includes(search.toLowerCase()) ||
    (u.name || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <>
      <div className="view-header">
        <div className="eyebrow">Admin</div>
        <div className="view-title">Kelola Pengguna</div>
        <div className="view-desc">
          Lihat semua akun, aktivitas, dan kelola role pengguna.
        </div>
      </div>

      {/* Stats */}
      <div className="metrics-strip" style={{ marginBottom: '1.25rem' }}>
        <div className="metric-cell">
          <div className="metric-val">{users.length}</div>
          <div className="metric-lbl">Total Pengguna</div>
        </div>

        <div className="metric-cell">
          <div className="metric-val">
            {users.filter((u) => u.role === 'admin').length}
          </div>
          <div className="metric-lbl">Administrator</div>
        </div>

        <div className="metric-cell">
          <div className="metric-val">
            {users.reduce((s, u) => s + (u.total_perhitungan || 0), 0)}
          </div>
          <div className="metric-lbl">Total Perhitungan</div>
        </div>

        <div className="metric-cell">
          <div className="metric-val">
            {users.reduce((s, u) => s + (u.total_modifikasi || 0), 0)}
          </div>
          <div className="metric-lbl">Total Modifikasi</div>
        </div>
      </div>

      <div className="dash-actions">
        <div className="dash-search" style={{ maxWidth: 280 }}>
          <span style={{ color: 'var(--ink-m)', fontSize: 14 }}>🔍</span>
          <input
            type="text"
            placeholder="Cari username atau nama…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Pengguna</th>
              <th>Role</th>
              <th style={{ textAlign: 'right' }}>Perhitungan</th>
              <th style={{ textAlign: 'right' }}>Modifikasi</th>
              <th>Bergabung</th>
              <th>Login Terakhir</th>
              <th></th>
            </tr>
          </thead>

          <tbody>
            {filtered.length === 0 && (
              <tr>
                <td
                  colSpan={7}
                  style={{
                    textAlign: 'center',
                    color: 'var(--ink-m)',
                    padding: '2rem',
                  }}
                >
                  Tidak ada pengguna.
                </td>
              </tr>
            )}

            {filtered.map((u) => (
              <tr key={u.id}>
                <td>
                  <div style={{ fontWeight: 500 }}>{u.name || '—'}</div>

                  <div style={{ fontSize: 12, color: 'var(--ink-m)' }}>
                    @{u.username}
                  </div>

                  {u.email && (
                    <div style={{ fontSize: 11, color: 'var(--ink-m)' }}>
                      {u.email}
                    </div>
                  )}
                </td>

                <td>
                  <span
                    className={`badge ${
                      u.role === 'admin' ? 'badge-admin' : 'badge-user'
                    }`}
                  >
                    {u.role === 'admin' ? '⭐ Admin' : '👤 User'}
                  </span>
                </td>

                <td
                  style={{
                    textAlign: 'right',
                    fontFamily: "'DM Serif Display',serif",
                    fontSize: 18,
                    color: 'var(--teal)',
                  }}
                >
                  {u.total_perhitungan || 0}
                </td>

                <td
                  style={{
                    textAlign: 'right',
                    fontSize: 13,
                    color: 'var(--ink-m)',
                  }}
                >
                  {u.total_modifikasi || 0}
                </td>

                <td style={{ fontSize: 12, color: 'var(--ink-m)' }}>
                  {fmtDate(u.created_at)}
                </td>

                <td style={{ fontSize: 12, color: 'var(--ink-m)' }}>
                  {fmtDate(u.last_login)}
                </td>

                <td>
                  {u.id !== currentUser?.id && (
                    <button
                      className={`btn btn-sm ${
                        u.role === 'admin' ? 'btn-danger' : 'btn-ghost'
                      }`}
                      style={{ whiteSpace: 'nowrap' }}
                      onClick={() =>
                        setConfirm({
                          user: u,
                          newRole: u.role === 'admin' ? 'user' : 'admin',
                        })
                      }
                    >
                      {u.role === 'admin'
                        ? '↓ Jadikan User'
                        : '↑ Jadikan Admin'}
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {confirm && (
        <div
          className="modal-overlay"
          onClick={(e) =>
            e.target === e.currentTarget && setConfirm(null)
          }
        >
          <div className="modal-box">
            <div className="modal-title">Ubah Role</div>

            <div className="modal-sub">
              Ubah role{' '}
              <strong>
                {confirm.user.name || confirm.user.username}
              </strong>{' '}
              menjadi{' '}
              <strong>
                {confirm.newRole === 'admin'
                  ? 'Administrator'
                  : 'User'}
              </strong>
              ?
            </div>

            <div className="modal-actions">
              <button
                className="btn btn-secondary btn-sm"
                onClick={() => setConfirm(null)}
              >
                Batal
              </button>

              <button
                className={`btn btn-sm ${
                  confirm.newRole === 'admin'
                    ? 'btn-primary'
                    : 'btn-danger'
                }`}
                onClick={() =>
                  changeRole(confirm.user.id, confirm.newRole)
                }
              >
                Ya, Ubah
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
                      }
