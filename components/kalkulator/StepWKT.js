"use client";

import { calcWKT } from "@/lib/sdmk-engine";
import { fmt } from "@/lib/utils";
import { useApp } from "@/contexts/AppContext";

export function StepWKT({ param, setParam, onNext, onBack }) {
  const { confirm } = useApp();
  const w = calcWKT(param);
  const totalBulan = (param.custom_schedule || []).reduce(
    (s, p) => s + Number(p.bulan || 0),
    0,
  );

  function set(key, val) {
    setParam((prev) => ({ ...prev, [key]: val }));
  }

  const errStandard = param.mode === 'standard' && (!param.jam_kerja || param.jam_kerja <= 0 || param.jam_kerja > 24 || !param.kerja_perminggu || param.kerja_perminggu < 1 || param.kerja_perminggu > 7);
  const errCustom = param.mode === 'custom' && totalBulan !== 12;
  const errHkt = w.hkt <= 0;
  const hasError = errStandard || errCustom || errHkt;

  const handleModeSwitch = (newMode) => {
    if (newMode === param.mode) return;
    
    // Periksa apakah ada data di mode saat ini
    const hasStandardData = param.mode === 'standard' && (param.jam_kerja !== 8 || param.kerja_perminggu !== 5);
    const hasCustomData = param.mode === 'custom' && (param.custom_schedule || []).length > 0;
    
    if (hasStandardData || hasCustomData) {
      confirm(
        'Ganti Mode Jadwal?',
        'Beralih mode akan mereset data jadwal pada mode sebelumnya. Anda yakin ingin mengganti mode?',
        () => performSwitch(newMode),
        true
      );
      return;
    }

    performSwitch(newMode);
  };

  const performSwitch = (newMode) => {
    if (newMode === 'standard') {
      setParam(prev => ({ ...prev, mode: 'standard', custom_schedule: [], jam_kerja: 8, kerja_perminggu: 5 }));
    } else {
      setParam(prev => ({ ...prev, mode: 'custom', jam_kerja: 0, kerja_perminggu: 0, custom_schedule: [] }));
    }
  };

  const handleNext = () => {
    if (hasError) return;
    onNext();
  };

  return (
    <>
      {/* TAB MODE SELECTION */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ display: 'flex', borderBottom: '1px solid var(--border)' }}>
          <button
            className="tab-btn"
            style={{ flex: 1, padding: '16px', background: param.mode === 'standard' ? 'var(--bg-base)' : 'var(--bg-surface)', borderBottom: param.mode === 'standard' ? '3px solid var(--teal)' : '3px solid transparent', fontWeight: param.mode === 'standard' ? 700 : 500, color: param.mode === 'standard' ? 'var(--teal-d)' : 'var(--ink-l)', borderTop: 'none', borderLeft: 'none', borderRight: 'none', cursor: 'pointer', transition: 'all .2s' }}
            onClick={() => handleModeSwitch('standard')}
          >
            <div style={{ fontSize: 15, marginBottom: 4 }}>Mode Standar</div>
            <div style={{ fontSize: 12, color: 'var(--ink-m)', fontWeight: 400 }}>Rutinitas tetap (8 jam × 5 hari)</div>
          </button>
          <div style={{ width: 1, background: 'var(--border)' }}></div>
          <button
            className="tab-btn"
            style={{ flex: 1, padding: '16px', background: param.mode === 'custom' ? 'var(--bg-base)' : 'var(--bg-surface)', borderBottom: param.mode === 'custom' ? '3px solid var(--teal)' : '3px solid transparent', fontWeight: param.mode === 'custom' ? 700 : 500, color: param.mode === 'custom' ? 'var(--teal-d)' : 'var(--ink-l)', borderTop: 'none', borderLeft: 'none', borderRight: 'none', cursor: 'pointer', transition: 'all .2s' }}
            onClick={() => handleModeSwitch('custom')}
          >
            <div style={{ fontSize: 15, marginBottom: 4 }}>Mode Kustom</div>
            <div style={{ fontSize: 12, color: 'var(--ink-m)', fontWeight: 400 }}>Jadwal fleksibel & shift bulanan</div>
          </button>
        </div>
      </div>

      {/* RENDER MODE */}
      {param.mode === "standard" ? (
        <div className="card">
          <div className="card-title">Pengaturan Standar</div>
          <FieldInput
            field={{ key: "jam_kerja", label: "Jam Kerja per Hari", unit: "jam", min: 1, step: 0.5, max: 24 }}
            value={param.jam_kerja}
            onChange={set}
          />
          <FieldInput
            field={{ key: "kerja_perminggu", label: "Hari Kerja per Minggu", unit: "hari", min: 1, max: 7 }}
            value={param.kerja_perminggu}
            onChange={set}
          />
          {errStandard && (
            <div style={{ marginTop: 12, fontSize: 13, color: 'var(--red)', background: 'var(--red-p)', padding: '8px 12px', borderRadius: 'var(--r-xs)', border: '1px solid #fca5a5' }}>
              ⚠️ Angka tidak masuk akal. Jam kerja harus (1 - 24) dan Hari kerja (1 - 7).
            </div>
          )}
        </div>
      ) : (
        <CustomScheduleBuilder
          param={param}
          setParam={setParam}
          totalBulan={totalBulan}
        />
      )}

      <HariKerjaSection param={param} setParam={setParam} />

      {/* METRICS STRIP */}
      <MetricsStrip w={w} />

      {/* FEEDBACK VISUAL REAL-TIME */}
      {w.hkt <= 0 && (
        <div
          className="alert-warning"
          style={{ textAlign: "center", marginBottom: "1rem" }}
        >
          ⚠️ <strong>Peringatan:</strong> Hari kerja tersedia sudah habis karena
          pengurangan hari.
        </div>
      )}

      <div className="actions">
        <button className="btn btn-secondary" onClick={onBack}>
          ← Kembali
        </button>
        <button 
          className="btn btn-primary" 
          onClick={handleNext}
          disabled={hasError}
          style={hasError ? { opacity: 0.5, cursor: 'not-allowed' } : {}}
        >
          Lanjut →
        </button>
      </div>
    </>
  );
}

/* =========================
   CUSTOM BUILDER
========================= */
function CustomScheduleBuilder({ param, setParam, totalBulan }) {
  const schedules = param.custom_schedule || [];

  // helper: sisa bulan yang boleh ditambahkan (>=0)
  const remainingMonths = Math.max(0, 12 - totalBulan);

  function update(idx, key, val) {
    setParam((prev) => {
      const copy = [...(prev.custom_schedule || [])];
      copy[idx] = { ...copy[idx], [key]: val };
      return { ...prev, custom_schedule: copy };
    });
  }

  function updateBulan(idx, val) {
    // val bisa "" atau number
    setParam((prev) => {
      const copy = [...(prev.custom_schedule || [])];
      const current = Number(copy[idx].bulan || 0);
      let newVal = val === "" ? "" : Number(val);

      // jika kosong, simpan kosong (biar user bisa edit)
      if (newVal === "") {
        copy[idx] = { ...copy[idx], bulan: "" };
        return { ...prev, custom_schedule: copy };
      }

      if (Number.isNaN(newVal)) newVal = current;

      // batas minimal 1, maksimal 12
      if (newVal < 1) newVal = 1;
      if (newVal > 12) newVal = 12;

      // hitung sisa jika kita mengganti nilai periode ini
      const totalExceptThis = (prev.custom_schedule || []).reduce(
        (s, p, i) => (i === idx ? s : s + Number(p.bulan || 0)),
        0,
      );
      const remainingIfChange = 12 - totalExceptThis;

      // jika newVal melebihi remainingIfChange, paksa ke remainingIfChange
      if (newVal > remainingIfChange) newVal = remainingIfChange;

      copy[idx] = { ...copy[idx], bulan: newVal };
      return { ...prev, custom_schedule: copy };
    });
  }

  function updateDay(idx, dayIdx, val) {
    setParam((prev) => {
      const copy = [...(prev.custom_schedule || [])];
      const item = { ...copy[idx] };
      const weekly = [...(item.weekly_hours || [])];

      if (val === "") {
        weekly[dayIdx] = "";
      } else {
        let num = Number(val);
        if (Number.isNaN(num)) num = 0;
        // enforce bounds: 0 allowed (libur), otherwise min 1, max 24
        if (num > 24) num = 24;
        if (num > 0 && num < 1) num = 1;
        weekly[dayIdx] = num;
      }

      item.weekly_hours = weekly;
      copy[idx] = item;
      return { ...prev, custom_schedule: copy };
    });
  }

  function add() {
    // prevent adding if already full
    if (remainingMonths <= 0) return;

    // default bulan: 1 but ensure not exceed remainingMonths
    const defaultBulan = Math.min(1, remainingMonths);

    setParam((prev) => ({
      ...prev,
      custom_schedule: [
        ...(prev.custom_schedule || []),
        {
          nama: "Periode Baru",
          bulan: defaultBulan,
          weekly_hours: [8, 8, 8, 8, 8, 0, 0],
        },
      ],
    }));
  }

  function remove(idx) {
    setParam((prev) => ({
      ...prev,
      custom_schedule: (prev.custom_schedule || []).filter((_, i) => i !== idx),
    }));
  }

  return (
    <div className="card">
      <div
        className="card-title"
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <span>Jadwal Kustom</span>
        <span
          className={
            totalBulan !== 12 ? "badge badge-draft" : "badge badge-selesai"
          }
        >
          {totalBulan}/12 Bulan
        </span>
      </div>

      {schedules.map((p, i) => (
        <div
          key={i}
          className="subcard"
          style={{
            marginBottom: "1rem",
            border: "1px solid var(--border)",
            padding: "1rem",
            borderRadius: "var(--r-sm)",
          }}
        >
          <div className="grid2">
            <FieldInput
              type="text"
              field={{ key: "nama", label: "Nama Periode" }}
              value={p.nama}
              onChange={(k, v) => update(i, "nama", v)}
            />
            <FieldInput
              field={{
                key: "bulan",
                label: "Durasi (bulan)",
                unit: "bulan",
                min: 1,
                max: 12,
              }}
              value={p.bulan}
              onChange={(k, v) => updateBulan(i, v)}
            />
          </div>

          <div
            className="grid7"
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(7, 1fr)",
              gap: "6px",
              marginTop: "10px",
            }}
          >
            {["Sen", "Sel", "Rab", "Kam", "Jum", "Sab", "Min"].map((d, di) => (
              <div key={di} style={{ textAlign: "center" }}>
                <label style={{ fontSize: "10px" }}>{d}</label>
                <input
                  type="number"
                  style={{ padding: "6px", width: "100%" }}
                  value={p.weekly_hours[di] ?? ""}
                  min={0}
                  max={24}
                  step={0.5}
                  onChange={(e) => updateDay(i, di, e.target.value)}
                  onBlur={(e) => {
                    // jika kosong saat blur, set ke 0
                    if (e.target.value === "") updateDay(i, di, 0);
                  }}
                />
              </div>
            ))}
          </div>

          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              marginTop: "10px",
            }}
          >
            <button className="btn btn-danger btn-sm" onClick={() => remove(i)}>
              Hapus Periode
            </button>
          </div>
        </div>
      ))}

      <div style={{ marginTop: "8px" }}>
        <button
          className="btn btn-secondary btn-add"
          style={{ width: "100%" }}
          onClick={add}
          disabled={remainingMonths <= 0}
          title={
            remainingMonths <= 0
              ? "Total durasi sudah mencapai 12 bulan"
              : "Tambah periode"
          }
        >
          + Tambah Periode
        </button>
      </div>

      {totalBulan !== 12 && (
        <div style={{ marginTop: 12, fontSize: 13, color: 'var(--red)', background: 'var(--red-p)', padding: '8px 12px', borderRadius: 'var(--r-xs)', border: '1px solid #fca5a5' }}>
          ⚠️ Total durasi periode harus tepat 12 bulan (saat ini {totalBulan} bulan).
        </div>
      )}
    </div>
  );
}

/* =========================
   HARI KERJA
========================= */

function HariKerjaSection({ param, setParam }) {
  function set(key, val) {
    setParam((prev) => ({
      ...prev,
      [key]: val,
    }));
  }

  return (
    <div className="card">
      <div className="card-title">Pengurangan Hari Kerja</div>

      <div className="grid3">
        {hariKerjaFields.map((f) => (
          <FieldInput
            key={f.key}
            field={f}
            value={param[f.key]}
            onChange={set}
          />
        ))}
      </div>
    </div>
  );
}

/* =========================
   FIELD
========================= */

function FieldInput({ field, value, onChange, type = "number" }) {
  const { key, label, unit, min, max, step } = field;

  return (
    <div className="field">
      <label>{label}</label>
      <div className="input-wrap">
        <input
          type={type}
          value={value ?? ""}
          min={min}
          max={max}
          step={step}
          onChange={(e) => {
            const val = e.target.value;
            if (val === "") {
              onChange(key, "");
              return;
            }

            if (type === "number") {
              const num = Number(val);
              if (Number.isNaN(num)) return;

              // enforce min/max
              let out = num;
              if (max !== undefined && out > max) out = max;
              if (min !== undefined && out < min) out = min;

              onChange(key, out);
            } else {
              // text
              onChange(key, val);
            }
          }}
          onBlur={(e) => {
            if (e.target.value === "" && type === "number") onChange(key, 0);
          }}
        />
        {unit && <span className="input-unit">{unit}</span>}
      </div>
    </div>
  );
}

/* =========================
   METRICS
========================= */

function MetricsStrip({ w }) {
  const metrics = [
    { value: Math.round(w.hkt), label: "Hari Kerja Tersedia" },
    { value: w.jke.toFixed(2), label: "Jam Efektif / Hari" },
    { value: w.wkt_jam.toFixed(2), label: "WKT (jam/tahun)" },
    { value: fmt(w.wkt_menit), label: "WKT (menit/tahun)" },
  ];

  return (
    <div className="metrics-strip">
      {metrics.map((m, i) => (
        <div key={i} className="metric-cell">
          <div className="metric-val">{m.value}</div>
          <div className="metric-lbl">{m.label}</div>
        </div>
      ))}
    </div>
  );
}

/* ========================= */

const hariKerjaFields = [
  { key: "cuti", label: "Cuti Tahunan", unit: "hari", min: 0, max: 365 },
  { key: "libur", label: "Libur Nasional", unit: "hari", min: 0, max: 365 },
  { key: "pelatihan", label: "Pelatihan", unit: "hari", min: 0, max: 365 },
  { key: "absen", label: "Absen", unit: "hari", min: 0, max: 365 },
];
