'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { useApp } from '@/contexts/AppContext';
import { api } from '@/lib/api';
import { UnitSelect } from '@/components/ui/UnitSelect';

export default function LoginPage() {
  const { login } = useAuth();
  const { showLoader, hideLoader, toast } = useApp();
  const router = useRouter();

  const [tab, setTab]         = useState('login');
  const [units, setUnits]     = useState([]);

  // Login
  const [lUser, setLUser]     = useState('');
  const [lPass, setLPass]     = useState('');

  // Register
  const [rUser, setRUser]     = useState('');
  const [rName, setRName]     = useState('');
  const [rEmail, setREail]    = useState('');
  const [rPass, setRPass]     = useState('');
  const [rUnit, setRUnit]     = useState('');
  const [rSub, setRSub]       = useState('');

  useEffect(() => {
    api({ action:'listUnits' }).then(res => { if (res.ok) setUnits(res.data); });
  }, []);

  async function doLogin() {
    if (!lUser || !lPass) { toast('Isi username dan password.','error'); return; }
    showLoader('Memverifikasi…');
    const res = await api({ action:'login', username:lUser, password:lPass });
    if (res.ok) {
      login(res.token, res.user);
      toast(`Selamat datang, ${res.user.name || res.user.username}!`,'success');
      router.replace('/dashboard');
    } else { hideLoader(); toast(res.error,'error'); }
  }

  async function doRegister() {
    if (!rUser || !rName || !rPass) { toast('Lengkapi data wajib (*)','error'); return; }
    showLoader('Mendaftar…');
    const res = await api({ action:'register', username:rUser, name:rName, email:rEmail, password:rPass, unit_id:rUnit, sub_unit_id:rSub });
    if (res.ok) {
      login(res.token, res.user);
      toast('Akun berhasil dibuat!','success');
      router.replace('/dashboard');
    } else { hideLoader(); toast(res.error,'error'); }
  }

  return (
    <div className="auth-screen">
      <div className="auth-box">
        <div className="auth-logo">S</div>
        <div className="auth-title">Kalkulator SDMK</div>
        <div className="auth-sub">Sistem Analisis Kebutuhan Tenaga Kesehatan</div>

        <div style={{ display:'flex',background:'var(--cream-d)',borderRadius:6,padding:3,marginBottom:'1.5rem',gap:0 }}>
          {['login','register'].map(t => (
            <button key={t} onClick={() => setTab(t)} style={{
              flex:1,padding:'8px',borderRadius:4,cursor:'pointer',fontSize:13.5,fontWeight:500,border:'none',
              background:tab===t?'white':'none',color:tab===t?'var(--teal)':'var(--ink-m)',
              boxShadow:tab===t?'var(--shadow)':'none',transition:'all .15s',fontFamily:"'DM Sans',sans-serif",
            }}>
              {t === 'login' ? 'Masuk' : 'Daftar'}
            </button>
          ))}
        </div>

        {tab === 'login' && (
          <div className="auth-form">
            <div className="field"><label>Username</label>
              <input type="text" placeholder="username" value={lUser} onChange={e=>setLUser(e.target.value)} onKeyDown={e=>e.key==='Enter'&&doLogin()} autoFocus /></div>
            <div className="field"><label>Password</label>
              <input type="password" placeholder="••••••" value={lPass} onChange={e=>setLPass(e.target.value)} onKeyDown={e=>e.key==='Enter'&&doLogin()} /></div>
            <button className="btn btn-primary" style={{width:'100%',justifyContent:'center',marginTop:4}} onClick={doLogin}>Masuk</button>
          </div>
        )}

        {tab === 'register' && (
          <div className="auth-form">
            <div className="field"><label>Username *</label>
              <input type="text" placeholder="huruf kecil, tanpa spasi" value={rUser} onChange={e=>setRUser(e.target.value)} /></div>
            <div className="field"><label>Nama Lengkap *</label>
              <input type="text" placeholder="Nama Anda" value={rName} onChange={e=>setRName(e.target.value)} /></div>
            <div className="field"><label>Email</label>
              <input type="email" placeholder="email@contoh.com" value={rEmail} onChange={e=>setREail(e.target.value)} /></div>
            <div className="field"><label>Password *</label>
              <input type="password" placeholder="min. 6 karakter" value={rPass} onChange={e=>setRPass(e.target.value)} /></div>
            <UnitSelect units={units} unitId={rUnit} subUnitId={rSub} onChangeUnit={setRUnit} onChangeSubUnit={setRSub} />
            <button className="btn btn-primary" style={{width:'100%',justifyContent:'center',marginTop:4}} onClick={doRegister}>Buat Akun</button>
          </div>
        )}
      </div>
    </div>
  );
}
