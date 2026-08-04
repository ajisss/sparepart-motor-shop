import { ChevronDown, InfoIcon } from '../icons'
import { formatCurrency } from '../../../utils/formatCurrency'

// Commerly "Sales Overview" widget: a segmented semicircular gauge with the
// percent in the center, a goal progress bar, and a Net/Gross/Target legend.
export default function SalesGauge({ pct, periodRevenue, target }) {
  const TICKS = 40
  const filled = Math.round((pct / 100) * TICKS)
  const cx = 130
  const cy = 130
  const rOuter = 118
  const rInner = 92

  const ticks = Array.from({ length: TICKS }, (_, i) => {
    const angle = Math.PI - (i / (TICKS - 1)) * Math.PI
    const x1 = cx + rInner * Math.cos(angle)
    const y1 = cy - rInner * Math.sin(angle)
    const x2 = cx + rOuter * Math.cos(angle)
    const y2 = cy - rOuter * Math.sin(angle)
    const on = i < filled
    return (
      <line
        key={i}
        x1={x1}
        y1={y1}
        x2={x2}
        y2={y2}
        strokeWidth={5}
        strokeLinecap="round"
        stroke={on ? (i < filled * 0.5 ? 'var(--adm-forest-500)' : 'var(--adm-mint)') : 'var(--adm-white-600)'}
      />
    )
  })

  const away = Math.max(0, 100 - pct)

  return (
    <div className="adm-card flex flex-col p-5">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-[var(--adm-text)]">Ringkasan Penjualan</p>
        <button className="flex items-center gap-1 rounded-lg border border-[var(--adm-border)] px-3 py-1.5 text-xs font-medium text-[var(--adm-text)]">
          Bulanan <ChevronDown className="size-3.5" />
        </button>
      </div>

      <div className="relative mx-auto mt-2 w-[240px]">
        <svg viewBox="0 0 260 150" className="w-full">
          {ticks}
        </svg>
        <div className="absolute inset-x-0 bottom-1 flex flex-col items-center">
          <span className="adm-stat-number text-[40px]">{pct}%</span>
          <span className="text-xs text-[var(--adm-muted)]">Pertumbuhan penjualan</span>
        </div>
      </div>

      {/* goal line */}
      <div className="mt-3 flex items-center justify-center gap-1.5 text-xs text-[var(--adm-muted)]">
        <InfoIcon className="size-3.5" />
        <span>Tinggal {away}% lagi menuju target bulanan kamu</span>
      </div>
      <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-[var(--adm-bg)]">
        <div className="h-full rounded-full bg-[var(--adm-forest-500)]" style={{ width: `${pct}%` }} />
      </div>

      {/* legend */}
      <div className="mt-4 flex items-center justify-center gap-4 text-xs text-[var(--adm-text)]">
        <span className="flex items-center gap-1.5">
          <span className="size-2 rounded-full bg-[var(--adm-forest-500)]" /> Laba Bersih
        </span>
        <span className="flex items-center gap-1.5">
          <span className="size-2 rounded-full bg-[var(--adm-mint)]" /> Omzet Kotor
        </span>
        <span className="flex items-center gap-1.5">
          <span className="size-2 rounded-full bg-[var(--adm-white-600)]" /> Target
        </span>
      </div>

      <p className="mt-3 text-center text-[11px] text-[var(--adm-muted)]">
        {formatCurrency(periodRevenue)} dari target {formatCurrency(target)} · 30 hari terakhir
      </p>
    </div>
  )
}
