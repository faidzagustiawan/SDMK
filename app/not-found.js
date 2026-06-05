import Link from 'next/link';

export default function NotFound() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-base)', padding: '2rem', textAlign: 'center' }}>
      <div style={{ fontSize: 'clamp(80px, 15vw, 120px)', fontWeight: 800, color: 'var(--teal-l)', lineHeight: 1, fontFamily: "'Plus Jakarta Sans', sans-serif", marginBottom: '10px' }}>404</div>
      <div style={{ fontSize: 'clamp(20px, 5vw, 28px)', fontWeight: 800, color: 'var(--ink)', fontFamily: "'Plus Jakarta Sans', sans-serif", letterSpacing: '-0.02em' }}>
        Halaman Tidak Ditemukan
      </div>
      <p style={{ color: 'var(--ink-m)', marginTop: '0.75rem', maxWidth: '400px', fontSize: '15px' }}>
        Maaf, halaman yang Anda cari mungkin telah dihapus, diubah namanya, atau tidak pernah ada.
      </p>
      <Link href="/dashboard" className="btn btn-primary" style={{ marginTop: '2rem', padding: '12px 24px' }}>
        ← Kembali ke Dashboard
      </Link>
    </div>
  );
}
