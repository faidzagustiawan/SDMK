/**
 * sdmk-engine.js
 * Seluruh kalkulasi SDMK dijalankan di frontend.
 */
function round4(n) {
  return Math.round(n * 10000) / 10000;
}

export function calcWKT(param) {
  const {
    mode = "standard",
    kerja_perminggu = 5,
    jam_kerja = 8,
    cuti = 12,
    libur = 16,
    pelatihan = 3,
    absen = 2,
    custom_schedule = [],
  } = param;

  let jke;
  let hkt;

  const pengurang = Number(cuti) + Number(libur) + Number(pelatihan) + Number(absen);

  if (mode === "custom") {
    let totalJamKustom = 0;
    let totalHariKustom = 0;

    custom_schedule.forEach((p) => {
      const durasiBulan = Number(p.bulan) || 0;
      const minggu = durasiBulan * 4.33; 
      const jamMinggu = p.weekly_hours.reduce((a, b) => a + (Number(b) || 0), 0);
      const hariMinggu = p.weekly_hours.filter((j) => Number(j) > 0).length;

      totalJamKustom += jamMinggu * minggu;
      totalHariKustom += hariMinggu * minggu;
    });

    const avg = totalHariKustom > 0 ? totalJamKustom / totalHariKustom : 0;
    jke = avg * 0.7; 
    hkt = totalHariKustom - pengurang;
  } else {
    const avg = Number(jam_kerja);
    jke = avg * 0.7;
    const hari_kerja_standar = Number(kerja_perminggu) * 52;
    hkt = hari_kerja_standar - pengurang;
  }

  const safeHKT = Math.max(0, hkt);
  const wkt_jam = safeHKT * jke;
  const wkt_menit = wkt_jam * 60;

  return {
    hari_kerja: mode === "custom" ? "Variabel" : Number(kerja_perminggu) * 52,
    hkt: round4(safeHKT),
    jke: round4(jke),
    wkt_jam: round4(wkt_jam),
    wkt_menit: Math.round(wkt_menit),
  };
}

export function runHitung(param, pokok, penunjang) {
  const w = calcWKT(param);
  const { hkt, jke, wkt_jam, wkt_menit } = w;

  // Validasi WKT sebelum hitung beban kerja
  if (wkt_menit <= 0)
    return {
      ok: false,
      error: "WKT tidak valid. Periksa parameter waktu kerja.",
    };

  const detail_pokok = pokok.map((p, i) => {
    const sbk = wkt_menit / (p.norma_waktu || 1);
    const kebutuhan = (p.capaian_tahun || 0) / sbk;
    return {
      urutan: i + 1,
      kegiatan: p.kegiatan,
      norma_waktu: p.norma_waktu,
      capaian_tahun: p.capaian_tahun,
      sbk: round4(sbk),
      kebutuhan: round4(kebutuhan),
    };
  });
  const jkt = detail_pokok.reduce((s, r) => s + r.kebutuhan, 0);

  const detail_penunjang = penunjang.map((p, i) => {
    const menit_tahun = p.waktu_menit_hari * hkt;
    const ftp = (menit_tahun / wkt_menit) * 100;
    return {
      urutan: i + 1,
      kegiatan: p.kegiatan,
      waktu_menit_hari: p.waktu_menit_hari,
      menit_tahun: Math.round(menit_tahun),
      ftp: round4(ftp),
    };
  });
  const ftp_total = detail_penunjang.reduce((s, r) => s + r.ftp, 0);

  if (ftp_total >= 100)
    return {
      ok: false,
      error: "FTP total >= 100%. Periksa input tugas penunjang.",
    };

  const stp = 1 / (1 - ftp_total / 100);
  const total_raw = jkt * stp;
  const total_sdmk = Math.ceil(total_raw);

  return {
    ok: true,
    hasil: {
      wkt: { hkt, jke, wkt_jam, wkt_menit },
      jkt: round4(jkt),
      ftp_total: round4(ftp_total),
      stp: round4(stp),
      total_raw: round4(total_raw),
      total_sdmk,
      detail_pokok,
      detail_penunjang,
      param,
      dihitung_pada: new Date().toISOString(),
    },
  };
}

export const DEFAULT_PARAM = {
  mode: "standard",
  jam_kerja: 8,
  kerja_perminggu: 5,
  cuti: 12,
  libur: 16,
  pelatihan: 3,
  absen: 2,
  custom_schedule: [],
};