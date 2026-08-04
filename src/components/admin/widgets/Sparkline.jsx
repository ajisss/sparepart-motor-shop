// SVG area sparkline used inside stat cards (Commerly "Total Product" style).
export default function Sparkline({ data = [], width = 240, height = 56, color = 'var(--adm-mint)' }) {
  const pts = data.length ? data : [0]
  const max = Math.max(1, ...pts)
  const min = Math.min(...pts)
  const span = Math.max(1, max - min)
  const stepX = width / Math.max(1, pts.length - 1)

  const coords = pts.map((v, i) => {
    const x = i * stepX
    const y = height - 6 - ((v - min) / span) * (height - 12)
    return [x, y]
  })

  const line = coords.map(([x, y], i) => `${i === 0 ? 'M' : 'L'}${x.toFixed(1)} ${y.toFixed(1)}`).join(' ')
  const area = `${line} L${width} ${height} L0 ${height} Z`
  const gid = 'spark-' + Math.round(width) + '-' + pts.length

  return (
    <svg viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none" className="h-full w-full">
      <defs>
        <linearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.35" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={area} fill={`url(#${gid})`} />
      <path d={line} fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}
