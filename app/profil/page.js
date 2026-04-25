'use client';

import { useState, useEffect, useCallback } from 'react';
import { useApp } from '@/contexts/AppContext';
import { useAuth } from '@/hooks/useAuth';
import { api } from '@/lib/api';
import { Modal } from '@/components/ui/Modal';


export default function ProfilPage() {
  const { showLoader, hideLoader, toast } = useApp();
  const { currentUser, updateUser } = useAuth();

  const [profile, setProfile]   = useState(null);
  const [stats, setStats]       = useState({ total:0, selesai:0, draft:0 });
  
  const [showEdit, setShowEdit] = useState(false);
  const [showPw, setShowPw]     = useState(false);

  const [peName, setPeName]     = useState('');
  const [peEmail, setPeEmail]   = useState('');

  
  const [cpOld, setCpOld]       = useState('');
  const [cpNew, setCpNew]       = useState('');
  const [cpConf, setCpConf]     = useState('');

  const load = useCallback(async () => {
    showLoader('Memuat profil…');
    const [profRes, listRes, unitRes] = await Promise.all([
      api({ action:'getProfile' }),
      api({ action:'listPerhitungan' }),
      
    ]);
    hideLoader();
    if (!profRes.ok) { toast(profRes.error,'error'); return; }
    const u = profRes.profile;
    setProfile(u); setPeName(u.name||''); setPeEmail(u.email||'');  
    
    if (listRes.ok) {
      const all = listRes.data;
      setStats({ total:all.length, selesai:all.filter(x=>x.hasil).length, draft:all.filter(x=>!x.hasil).length });
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  function unitLabel(id) { if (!id) return '—'; return units.find(u => u.id === id)?.name || id; }

  async function submitEdit() {
    showLoader('Menyimpan profil…');
    const res = await api({ action:'updateProfile', name:peName, email:peEmail });
    hideLoader();
    if (res.ok) { setShowEdit(false); updateUser({ name:peName }); toast('Profil berhasil diperbarui.','success'); load(); }
    else toast(res.error,'error');
  }

  async function submitPw() {
    if (cpNew !== cpConf) { toast('Konfirmasi password tidak cocok.','error'); return; }
    showLoader('Mengubah password…');
    const res = await api({ action:'changePassword', old_password:cpOld, new_password:cpNew });
    hideLoader();
    if (res.ok) { setShowPw(false); setCpOld(''); setCpNew(''); setCpConf(''); toast('Password berhasil diubah.','success'); }
    else toast(res.error,'error');
  }

  if (!profile) return null;
  const initial = (profile.name||profile.username)[0].toUpperCase();

  return (
    <>
      <div className="view-header">
        <div className="eyebrow">Akun</div>
        <div className="view-title">Profil Saya</div>
      </div>

<div className="card profile-card">
  {/* Konten Utama: Foto + Info */}
  <div className="profile-main">
    <div className="profile-photo-wrapper">
      <div className="profile-avatar-big">{initial}</div>
      <div className="badge-role">
        {profile.role === 'admin' ? '⭐ Administrator' : '👤 Pengguna'}
      </div>
    </div>

    <div className="profile-info">
      <div className="profile-name">{profile.name || '—'}</div>
      <div className="profile-username">@{profile.username}</div>
      
      <div className="profile-details">
        <div className="detail-item">
          <span>Email:</span> {profile.email || '—'}
        </div>
        <div className="detail-item">
          <span>Unit Kerja:</span> {unitLabel(profile.unit_id)}
        </div>
        
        <div className="detail-item">
          <span>Bergabung:</span> {profile.created_at ? new Date(profile.created_at).toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' }) : '—'}
        </div>
        <div className="detail-item">
          <span>Login Terakhir:</span> {profile.last_login ? new Date(profile.last_login).toLocaleString('id-ID') : '—'}
        </div>
      </div>
    </div>
  </div>

  {/* Tombol Aksi */}
  <div className="profile-actions-vertical">
    <button className="btn btn-primary btn-sm" onClick={() => setShowEdit(true)}>
      ✏️ Edit Profil
    </button>
    <button className="btn btn-ghost btn-sm" onClick={() => setShowPw(true)}>
      🔑 Ganti Password
    </button>
  </div>
</div>

      <div className="card">
        <div className="card-title">Statistik</div>
        <div style={{ display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:'1rem' }}>
          {[['total','Total Perhitungan'],['selesai','Selesai Dihitung'],['draft','Belum Dihitung']].map(([k,l]) => (
            <div key={k} className="profile-stat">
              <div className="profile-stat-num">{stats[k]}</div>
              <div className="profile-stat-lbl">{l}</div>
            </div>
          ))}
        </div>
      </div>

      {showEdit && (
        <Modal title="Edit Profil" onClose={()=>setShowEdit(false)}
          actions={<><button className="btn btn-secondary btn-sm" onClick={()=>setShowEdit(false)}>Batal</button><button className="btn btn-primary btn-sm" onClick={submitEdit}>Simpan</button></>}
        >
          <div className="field"><label>Nama Lengkap</label><input type="text" value={peName} onChange={e=>setPeName(e.target.value)} /></div>
          <div className="field"><label>Email</label><input type="email" value={peEmail} onChange={e=>setPeEmail(e.target.value)} /></div>
          <UnitSelect units={units} unitId={peUnit} subUnitId={peSub} onChangeUnit={setPeUnit} onChangeSubUnit={setPeSub} />
        </Modal>
      )}

      {showPw && (
        <Modal title="Ganti Password" onClose={()=>setShowPw(false)}
          actions={<><button className="btn btn-secondary btn-sm" onClick={()=>setShowPw(false)}>Batal</button><button className="btn btn-primary btn-sm" onClick={submitPw}>Simpan</button></>}
        >
          <div className="field"><label>Password Lama</label><input type="password" value={cpOld} onChange={e=>setCpOld(e.target.value)} /></div>
          <div className="field"><label>Password Baru</label><input type="password" value={cpNew} onChange={e=>setCpNew(e.target.value)} /></div>
          <div className="field"><label>Konfirmasi</label><input type="password" value={cpConf} onChange={e=>setCpConf(e.target.value)} /></div>
        </Modal>
      )}
    </>
  );
}
