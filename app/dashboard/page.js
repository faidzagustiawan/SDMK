'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '@/contexts/AppContext';
import { useAuth } from '@/hooks/useAuth';
import { api } from '@/lib/api';
import { Modal } from '@/components/ui/Modal';

export default function DashboardPage() {
  const { showLoader, hideLoader, toast } = useApp();
  const { currentUser } = useAuth();
  const router = useRouter();

  const [allData, setAllData]         = useState([]);
  const [filtered, setFiltered]       = useState([]);
  const [units, setUnits]             = useState([]);
  const [search, setSearch]           = useState('');
  const [deleteTarget, setDeleteTarget] = useState(null);

  const load = useCallback(async () => {
    showLoader('Memuat data…');
    const [dRes, uRes] = await Promise.all([ api({ action:'listPerhitungan' }), api({ action:'listUnits' }) ]);
    hideLoader();
    if (dRes.ok) { setAllData(dRes.data); setFiltered(dRes.data); }
    else toast(dRes.error,'error');
    if (uRes.ok) setUnits(uRes.data);
  }, []);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    const q = search.toLowerCase();
    setFiltered(allData.filter(p =>
      (p.judul||'').toLowerCase().includes(q) ||
      unitLabel(p.unit_id).toLowerCase().includes(q) ||
      (p.created_by_name||'').toLowerCase().includes(q)
    ));
  }, [search, allData, units]);

  function unitLabel(id) { return units.find(u => u.id === id)?.name || ''; }
  function subLabel(id)  { return id ? units.find(u => u.id === id)?.name || '' : ''; }
  function fmtDate(s)    { return s ? new Date(s).toLocaleDateString('id-ID',{day:'2-digit',month:'short',year:'numeric'}) : '—'; }
  const isOwner = (p) => p.created_by_id === currentUser?.id || currentUser?.role === 'admin';

  async function doDelete() {
    if (!deleteTarget) return;
    const { id } = deleteTarget;
    setDeleteTarget(null);
    showLoader('Menghapus…');
    const res = await api({ action:'deletePerhitungan', id });
    hideLoader();
    if (res.ok) { toast('Perhitungan dihapus.','success'); load(); }
    else toast(res.error,'error');
  }

  return (
    <>
      <div className="view-header">
        <div className="eyebrow">Beranda</div>
        <div className="view-title">Semua Perhitungan</div>
        <div className="view-desc">Semua perhitungan dapat dilihat dan dimodifikasi oleh seluruh pengguna.</div>
      </div>

      <div className="dash-actions">
        <div className="dash-search">
          <span style={{color:'var(--ink-m)',fontSize:14}}>🔍</span>
          <input type="text" placeholder="Cari judul, unit, atau pembuat…" value={search} onChange={e=>setSearch(e.target.value)} />
        </div>
        <button className="btn btn-primary" onClick={() => router.push('/kalkulator/baru')}>＋ Perhitungan Baru</button>
      </div>

      {filtered.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📋</div>
          <div className="empty-title">{search ? 'Tidak ada hasil' : 'Belum ada perhitungan'}</div>
          <div className="empty-desc" style={{marginBottom:'1rem'}}>{search ? 'Coba kata kunci lain.' : 'Mulai perhitungan pertama.'}</div>
          {!search && <button className="btn btn-primary" onClick={()=>router.push('/kalkulator/baru')}>＋ Perhitungan Baru</button>}
        </div>
      ) : (
        <div className="perhit-list">
          {filtered.map(p => {
            const ul = unitLabel(p.unit_id);
            const sl = subLabel(p.sub_unit_id);
            const unitDisplay = [ul, sl].filter(Boolean).join(' › ');
            return (
              <div key={p.id} className="perhit-row" onClick={()=>router.push(`/kalkulator/${p.id}`)}>
                <div style={{flex:1,minWidth:0}}>
                  <div className="perhit-title">{p.judul}</div>
                  <div className="perhit-meta">
                    {unitDisplay && <><span style={{fontWeight:500}}>{unitDisplay}</span><span>·</span></>}
                    <span>{p.tahun||'—'}</span>
                    <span>·</span>
                    <span style={{display:'flex',alignItems:'center',gap:4}}>
                      <span style={{background:'var(--teal-p)',color:'var(--teal)',borderRadius:99,padding:'1px 7px',fontSize:11,fontWeight:600}}>
                        {p.created_by_name||'—'}
                      </span>
                      <span>{fmtDate(p.created_at)}</span>
                    </span>
                    {p.versi_count > 1 && <>
                      <span>·</span>
                      <span style={{display:'flex',alignItems:'center',gap:4}}>
                        <span style={{background:'var(--amber-p)',color:'var(--amber)',borderRadius:99,padding:'1px 7px',fontSize:11,fontWeight:600}}>
                          v{p.versi_count} {p.last_modified_by}
                        </span>
                        <span>{fmtDate(p.last_modified_at)}</span>
                      </span>
                    </>}
                  </div>
                </div>
                <div style={{display:'flex',alignItems:'center',gap:10}}>
                  <div className="perhit-sdmk">
                    {p.hasil
                      ? <><div className="perhit-sdmk-num">{p.hasil.total_sdmk}</div><div className="perhit-sdmk-label">Orang SDMK</div></>
                      : <div style={{fontSize:12,color:'var(--ink-m)'}}>Belum dihitung</div>}
                  </div>
                  <div style={{display:'flex',gap:6}} onClick={e=>e.stopPropagation()}>
                    <button className="btn-icon edit" onClick={()=>router.push(`/kalkulator/${p.id}`)}>✏️</button>
                    {isOwner(p) && <button className="btn-icon" onClick={()=>setDeleteTarget({id:p.id,judul:p.judul})}>🗑</button>}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {deleteTarget && (
        <Modal title="Hapus Perhitungan" subtitle={`Hapus "${deleteTarget.judul}"? Semua versi akan terhapus.`}
          onClose={()=>setDeleteTarget(null)}
          actions={<><button className="btn btn-secondary btn-sm" onClick={()=>setDeleteTarget(null)}>Batal</button><button className="btn btn-danger btn-sm" onClick={doDelete}>Ya, Hapus</button></>}
        />
      )}
    </>
  );
}
