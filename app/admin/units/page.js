'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useApp } from '@/contexts/AppContext';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { Modal } from '@/components/ui/Modal';

export default function AdminUnitsPage() {
  const { currentUser } = useAuth();
  const { showLoader, hideLoader, toast } = useApp();
  const router = useRouter();

  const [units, setUnits]         = useState([]);
  const [addModal, setAddModal]   = useState(null); // null | 'main' | parentId (string = sub)
  const [editModal, setEditModal] = useState(null); // unit object
  const [delModal, setDelModal]   = useState(null); // unit object
  const [formName, setFormName]   = useState('');

  useEffect(() => {
    if (currentUser && currentUser.role !== 'admin') { router.replace('/dashboard'); return; }
    load();
  }, [currentUser]);

  const load = useCallback(async () => {
    showLoader('Memuat unit…');
    const res = await api({ action:'listUnits' });
    hideLoader();
    if (res.ok) setUnits(res.data);
    else toast(res.error,'error');
  }, []);

  const mainUnits = units.filter(u => !u.parent_id).sort((a,b) => (a.urutan||0)-(b.urutan||0));
  const subOf = (pid) => units.filter(u => u.parent_id === pid).sort((a,b) => (a.urutan||0)-(b.urutan||0));

  async function doAdd() {
    if (!formName.trim()) { toast('Nama unit wajib diisi.','error'); return; }
    showLoader('Menambahkan…');
    const res = await api({ action:'addUnit', name:formName.trim(), parent_id: addModal === 'main' ? '' : addModal });
    hideLoader();
    if (res.ok) { toast('Unit berhasil ditambahkan.','success'); setAddModal(null); setFormName(''); load(); }
    else toast(res.error,'error');
  }

  async function doEdit() {
    if (!formName.trim()) { toast('Nama wajib diisi.','error'); return; }
    showLoader('Menyimpan…');
    const res = await api({ action:'updateUnit', id:editModal.id, name:formName.trim() });
    hideLoader();
    if (res.ok) { toast('Berhasil diperbarui.','success'); setEditModal(null); setFormName(''); load(); }
    else toast(res.error,'error');
  }

  async function doDelete() {
    showLoader('Menghapus…');
    const res = await api({ action:'deleteUnit', id:delModal.id });
    hideLoader();
    if (res.ok) { toast('Berhasil dihapus.','success'); setDelModal(null); load(); }
    else toast(res.error,'error');
  }

  function openEdit(u) { setEditModal(u); setFormName(u.name); }
  function openAdd(type) { setAddModal(type); setFormName(''); }

  const addTitle = addModal === 'main' ? 'Tambah Unit Utama' : `Tambah Sub Unit`;
  const addSub   = addModal === 'main' ? 'Unit baru sebagai unit utama.' : `Sub unit dari ${units.find(u=>u.id===addModal)?.name || '…'}.`;

  return (
    <>
      <div className="view-header">
        <div className="eyebrow">Admin</div>
        <div className="view-title">Kelola Unit & Sub Unit</div>
        <div className="view-desc">Atur daftar unit kerja dan sub unit yang bisa dipilih pengguna.</div>
      </div>

      <div style={{ display:'flex', justifyContent:'flex-end', marginBottom:'1.25rem' }}>
        <button className="btn btn-primary" onClick={() => openAdd('main')}>＋ Tambah Unit Utama</button>
      </div>

      {mainUnits.length === 0 && (
        <div className="empty-state">
          <div className="empty-icon">🏢</div>
          <div className="empty-title">Belum ada unit</div>
          <div className="empty-desc" style={{marginBottom:'1rem'}}>Tambahkan unit utama terlebih dahulu.</div>
        </div>
      )}

      {mainUnits.map(unit => (
        <div key={unit.id} className="card" style={{ padding:0, overflow:'hidden' }}>
          {/* Unit utama row */}
          <div className="unit-item" style={{ background:'var(--cream)', borderBottom:'.5px solid var(--border)' }}>
            <div>
              <div className="unit-name" style={{ fontWeight:600, color:'var(--ink)', fontSize:14 }}>🏢 {unit.name}</div>
              <div style={{ fontSize:11, color:'var(--ink-m)', marginTop:2 }}>{subOf(unit.id).length} sub unit</div>
            </div>
            <div style={{ display:'flex', gap:6 }}>
              <button className="btn btn-add btn-sm" onClick={() => openAdd(unit.id)}>＋ Sub Unit</button>
              <button className="btn-icon edit" onClick={() => openEdit(unit)}>✏️</button>
              <button className="btn-icon" onClick={() => setDelModal(unit)} title="Hapus">🗑</button>
            </div>
          </div>

          {/* Sub units */}
          {subOf(unit.id).map(sub => (
            <div key={sub.id} className="unit-item sub">
              <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                <span style={{ color:'var(--border)', fontSize:16 }}>└</span>
                <span className="unit-name">📍 {sub.name}</span>
              </div>
              <div style={{ display:'flex', gap:6 }}>
                <button className="btn-icon edit" onClick={() => openEdit(sub)}>✏️</button>
                <button className="btn-icon" onClick={() => setDelModal(sub)} title="Hapus">🗑</button>
              </div>
            </div>
          ))}

          {subOf(unit.id).length === 0 && (
            <div style={{ padding:'10px 14px 10px 2.5rem', fontSize:12, color:'var(--ink-m)' }}>
              Belum ada sub unit.
            </div>
          )}
        </div>
      ))}

      {/* Modal tambah */}
      {addModal !== null && (
        <Modal title={addTitle} subtitle={addSub} onClose={() => setAddModal(null)}
          actions={<><button className="btn btn-secondary btn-sm" onClick={() => setAddModal(null)}>Batal</button><button className="btn btn-primary btn-sm" onClick={doAdd}>Tambahkan</button></>}
        >
          <div className="field"><label>Nama {addModal === 'main' ? 'Unit' : 'Sub Unit'} *</label>
            <input type="text" placeholder="cth. Puskesmas Dinoyo" value={formName} onChange={e=>setFormName(e.target.value)} onKeyDown={e=>e.key==='Enter'&&doAdd()} autoFocus /></div>
        </Modal>
      )}

      {/* Modal edit */}
      {editModal && (
        <Modal title="Edit Nama" onClose={() => setEditModal(null)}
          actions={<><button className="btn btn-secondary btn-sm" onClick={() => setEditModal(null)}>Batal</button><button className="btn btn-primary btn-sm" onClick={doEdit}>Simpan</button></>}
        >
          <div className="field"><label>Nama *</label>
            <input type="text" value={formName} onChange={e=>setFormName(e.target.value)} onKeyDown={e=>e.key==='Enter'&&doEdit()} autoFocus /></div>
        </Modal>
      )}

      {/* Modal hapus */}
      {delModal && (
        <Modal title="Hapus Unit" subtitle={`Hapus "${delModal.name}"? Aksi ini tidak bisa dibatalkan.`} onClose={() => setDelModal(null)}
          actions={<><button className="btn btn-secondary btn-sm" onClick={() => setDelModal(null)}>Batal</button><button className="btn btn-danger btn-sm" onClick={doDelete}>Ya, Hapus</button></>}
        />
      )}
    </>
  );
}
