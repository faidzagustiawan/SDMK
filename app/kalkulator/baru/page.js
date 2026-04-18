'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { useApp } from '@/contexts/AppContext';
import { api } from '@/lib/api';
import { DEFAULT_PARAM, runHitung } from '@/lib/sdmk-engine';
import { Modal } from '@/components/ui/Modal';
import { UnitSelect } from '@/components/ui/UnitSelect';
import { StepWKT } from '@/components/kalkulator/StepWKT';
import { StepPokok } from '@/components/kalkulator/StepPokok';
import { StepPenunjang } from '@/components/kalkulator/StepPenunjang';
import { StepReview } from '@/components/kalkulator/StepReview';
import { HasilView } from '@/components/kalkulator/HasilView';

const STEPS = ['wkt','pokok','penunjang','review'];
const STEP_LABELS = ['Waktu Kerja','Tugas Pokok','Tugas Penunjang','Review & Simpan'];

export default function KalkulatorBaruPage() {
  const { currentUser } = useAuth();
  const { showLoader, hideLoader, toast } = useApp();
  const router = useRouter();

  const [units, setUnits]         = useState([]);
  const [showJudul, setShowJudul] = useState(true);

  // Modal fields
  const [fJudul, setFJudul]   = useState('');
  const [fUnit, setFUnit]     = useState(currentUser?.unit_id || '');
  const [fSub, setFSub]       = useState(currentUser?.sub_unit_id || '');
  const [fTahun, setFTahun]   = useState(String(new Date().getFullYear()));

  const [meta, setMeta]               = useState(null);
  const [param, setParam]             = useState(DEFAULT_PARAM);
  const [pokok, setPokok]             = useState([{id:1,kegiatan:'',norma_waktu:30,capaian_tahun:100}]);
  const [penunjang, setPenunjang]     = useState([]);
  const [step, setStep]               = useState('wkt');
  const [hasil, setHasil]             = useState(null);

  useEffect(() => {
    api({ action:'listUnits' }).then(r => { if (r.ok) setUnits(r.data); });
  }, []);

  function unitLabel(id) { return units.find(u => u.id === id)?.name || '—'; }

  function submitJudul() {
    if (!fJudul.trim()) { toast('Judul wajib diisi.','error'); return; }
    setMeta({ judul:fJudul.trim(), unit_id:fUnit, sub_unit_id:fSub, tahun:fTahun });
    setShowJudul(false);
  }

  async function doHitungDanSimpan() {
    if (!pokok.length || pokok.some(p=>!p.kegiatan||!p.norma_waktu)) {
      toast('Lengkapi semua kegiatan tugas pokok.','error'); return;
    }
    const result = runHitung(param, pokok, penunjang);
    if (!result.ok) { toast(result.error,'error'); return; }
    showLoader('Menyimpan ke server…');
    const res = await api({ action:'createPerhitungan', judul:meta.judul, unit_id:meta.unit_id, sub_unit_id:meta.sub_unit_id, tahun:meta.tahun, param, pokok, penunjang, hasil:result.hasil });
    hideLoader();
    if (res.ok) { setHasil(result.hasil); toast('Perhitungan berhasil disimpan!','success'); }
    else toast(res.error,'error');
  }

  const stepIndex = STEPS.indexOf(step);

  if (hasil) {
    return <HasilView judul={meta?.judul} hasil={hasil} versiNum={1} penulis={currentUser?.username} savedAt={new Date().toISOString()} isLatest={true} onEdit={()=>{setHasil(null);setStep('wkt');}} onDashboard={()=>router.push('/dashboard')} />;
  }

  return (
    <>
      {showJudul && (
        <Modal title="Perhitungan Baru" subtitle="Isi detail perhitungan sebelum memulai." onClose={() => router.push('/dashboard')}
          actions={<>
            <button className="btn btn-secondary btn-sm" onClick={()=>router.push('/dashboard')}>Batal</button>
            <button className="btn btn-primary btn-sm" onClick={submitJudul}>Mulai →</button>
          </>}
        >
          <div className="field"><label>Judul Perhitungan *</label>
            <input type="text" placeholder="cth. Analisis Tenaga Dokter 2025" value={fJudul} onChange={e=>setFJudul(e.target.value)} onKeyDown={e=>e.key==='Enter'&&submitJudul()} autoFocus /></div>
          <UnitSelect units={units} unitId={fUnit} subUnitId={fSub} onChangeUnit={setFUnit} onChangeSubUnit={setFSub} />
          <div className="field"><label>Tahun</label>
            <input type="number" value={fTahun} onChange={e=>setFTahun(e.target.value)} /></div>
        </Modal>
      )}

      {!showJudul && <>
        <div className="view-header">
          <div className="eyebrow">Perhitungan Baru</div>
          <div className="view-title">{meta?.judul}</div>
          <div className="view-desc">
            {unitLabel(meta?.unit_id)}{meta?.sub_unit_id ? ` › ${unitLabel(meta.sub_unit_id)}` : ''}
            {meta?.tahun ? ` · Tahun ${meta.tahun}` : ''}
          </div>
        </div>

        <div className="steps-nav">
          {STEPS.map((s,i) => (
            <button key={s} className={`step-btn${step===s?' active':''}`} onClick={()=>setStep(s)}>
              {i<stepIndex && <span className="step-check">✓</span>}
              <span className="step-num">{String(i+1).padStart(2,'0')}</span>
              <span className="step-label">{STEP_LABELS[i]}</span>
            </button>
          ))}
        </div>

        {step==='wkt'       && <StepWKT param={param} setParam={setParam} onNext={()=>setStep('pokok')} onBack={()=>router.push('/dashboard')} />}
        {step==='pokok'     && <StepPokok pokok={pokok} setPokok={setPokok} onNext={()=>setStep('penunjang')} onBack={()=>setStep('wkt')} />}
        {step==='penunjang' && <StepPenunjang penunjang={penunjang} setPenunjang={setPenunjang} param={param} onNext={()=>setStep('review')} onBack={()=>setStep('pokok')} />}
        {step==='review'    && <StepReview param={param} pokok={pokok} penunjang={penunjang} onBack={()=>setStep('penunjang')} onHitung={doHitungDanSimpan} isNew={true} />}
      </>}
    </>
  );
}
