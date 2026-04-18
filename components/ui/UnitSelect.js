'use client';

/**
 * Dua dropdown berjenjang: Unit Utama → Sub Unit.
 * Props: units[], unitId, subUnitId, onChangeUnit, onChangeSubUnit
 * units[] berasal dari api({ action:'listUnits' })
 */
export function UnitSelect({ units = [], unitId, subUnitId, onChangeUnit, onChangeSubUnit }) {
  const mainUnits = units.filter(u => !u.parent_id);
  const subUnits  = units.filter(u => u.parent_id === unitId);

  function handleUnit(e) {
    onChangeUnit(e.target.value);
    onChangeSubUnit(''); // reset sub-unit saat unit berubah
  }

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
      <div className="field">
        <label>Unit Kerja</label>
        <select value={unitId || ''} onChange={handleUnit}>
          <option value="">— Pilih Unit Kerja —</option>
          {mainUnits.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
        </select>
      </div>

      {unitId && (
        <div className="field">
          <label>Sub Unit</label>
          <select value={subUnitId || ''} onChange={e => onChangeSubUnit(e.target.value)}>
            <option value="">— Pilih Sub Unit (opsional) —</option>
            {subUnits.length === 0
              ? <option disabled>Tidak ada sub unit</option>
              : subUnits.map(u => <option key={u.id} value={u.id}>{u.name}</option>)
            }
          </select>
        </div>
      )}
    </div>
  );
}
