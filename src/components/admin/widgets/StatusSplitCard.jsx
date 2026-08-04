import DeltaChip from './DeltaChip'

// Commerly "Pending / Shipped / Canceled" card: three columns + a striped
// segmented bar + legend. Mapped to DMB buckets (process / ship / refund).
export default function StatusSplitCard({ buckets }) {
  const cols = [
    { key: 'process', label: 'Perlu Diproses', value: buckets.process, delta: 3, color: 'var(--adm-warning)' },
    { key: 'ship', label: 'Dikirim', value: buckets.ship, delta: 8, color: 'var(--adm-forest-500)' },
    { key: 'refund', label: 'Refund', value: buckets.refund, delta: -2, color: 'var(--adm-danger)' },
  ]
  const total = Math.max(1, cols.reduce((s, c) => s + c.value, 0))

  return (
    <div className="adm-card flex flex-col p-5">
      <div className="grid grid-cols-3 gap-4">
        {cols.map((c) => (
          <div key={c.key}>
            <p className="text-xs font-medium text-[var(--adm-text)]">{c.label}</p>
            <div className="mt-1 flex items-center gap-2">
              <span className="adm-stat-number text-[26px]">{c.value}</span>
            </div>
            <div className="mt-1">
              <DeltaChip value={c.delta} suffix="kemarin" />
            </div>
          </div>
        ))}
      </div>

      {/* Segmented tick bar (Commerly's fine striped bar) */}
      <div className="mt-5 flex h-8 w-full items-stretch gap-[2px] overflow-hidden">
        {cols.flatMap((c) => {
          const n = Math.max(3, Math.round((c.value / total) * 90))
          return Array.from({ length: n }, (_, i) => (
            <span
              key={c.key + i}
              className="flex-1 rounded-full"
              style={{ background: c.color, opacity: 0.9, minWidth: 2 }}
            />
          ))
        })}
      </div>

      <div className="mt-3 flex items-center gap-4">
        {cols.map((c) => (
          <span key={c.key} className="flex items-center gap-1.5 text-xs text-[var(--adm-text)]">
            <span className="size-2 rounded-full" style={{ background: c.color }} />
            {c.label}
          </span>
        ))}
      </div>
    </div>
  )
}
