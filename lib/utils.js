/** Format angka ke locale Indonesia, max 2 desimal, desain beda untuk koma & titik */
export function fmt(n) {
  if (n == null || isNaN(n)) return "0";
  const str = Number(n).toLocaleString('id-ID', { maximumFractionDigits: 2 });
  const parts = str.split('');
  return (
    <>
      {parts.map((char, i) => {
        if (char === '.') return <span key={i} className="num-dot">.</span>;
        if (char === ',') return <span key={i} className="num-comma">,</span>;
        return char;
      })}
    </>
  );
}

/** Escape HTML untuk mencegah XSS */
export function escHtml(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
