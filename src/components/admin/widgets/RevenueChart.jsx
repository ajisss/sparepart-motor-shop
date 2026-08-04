import { useState } from 'react'
import DeltaChip from './DeltaChip'
import { ChevronDown } from '../icons'
import { formatCurrency } from '../../../utils/formatCurrency'

// Commerly "Revenue Insights" widget: title + total + weekly grouped bars.
// Each day shows this-week revenue (solid, tallest highlighted forest) over a
// faint "last week" ghost bar, with a y-axis and a This/Last week legend.
function rpAxis(n) {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(n % 1_000_000 ? 1 : 0) + 'jt'
  if (n >= 1_000) return Math.round(n / 1_000) + 'rb'
  return String(n)
}

export default function RevenueChart({ weekly, total }) {
  const [hover, setHover] = useState(null)
  const max = Math.max(1, ...weekly.flatMap((d) => [d.revenue, d.prev]))
  // rounded axis ceiling
  const ceil = Math.ceil(max / 100_000) * 100_000 || 100_000
  const ticks = [1, 0.75, 0.5, 0.25, 0].map((f) => Math.round(ceil * f))
  const peakIdx = weekly.reduce((best, d, i) => (d.revenue > weekly[best].revenue ? i : best), 0)

  return (
    <div className="adm-card flex flex-col p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-[var(--adm-text)]">Omzet Mingguan</p>
          <div className="mt-1 flex items-center gap-2">
            <span className="adm-stat-number text-[28px]">{formatCurrency(total)}</span>
            <DeltaChip value={7} />
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="hidden items-center gap-3 text-xs text-[var(--adm-muted)] sm:flex">
            <span className="flex items-center gap-1.5">
              <span className="size-2 rounded-full bg-[var(--adm-forest-500)]" /> Minggu ini
            </span>
            <span className="flex items-center gap-1.5">
              <span className="size-2 rounded-full bg-[var(--adm-white-600)]" /> Minggu lalu
            </span>
          </div>
          <button className="flex items-center gap-1 rounded-lg border border-[var(--adm-border)] px-3 py-1.5 text-xs font-medium text-[var(--adm-text)]">
            Mingguan <ChevronDown className="size-3.5" />
          </button>
        </div>
      </div>

      {/* Chart with y-axis */}
      <div className="mt-6 flex gap-3">
        <div className="flex h-44 w-10 flex-col justify-between py-1 text-[10px] text-[var(--adm-muted)]">
          {ticks.map((t, i) => (
            <span key={i} className="text-right">{rpAxis(t)}</span>
          ))}
        </div>

        <div className="relative flex-1">
          {/* gridlines */}
          <div className="absolute inset-0 flex flex-col justify-between py-1">
            {ticks.map((_, i) => (
              <div key={i} className="h-px w-full bg-[var(--adm-bg)]" />
            ))}
          </div>

          <div className="relative flex h-44 items-stretch justify-between gap-2 py-1">
            {weekly.map((d, i) => {
              const h = Math.max(4, (d.revenue / ceil) * 100)
              const hPrev = Math.max(4, (d.prev / ceil) * 100)
              const isPeak = i === peakIdx && d.revenue > 0
              return (
                <div
                  key={i}
                  className="group relative flex h-full flex-1 items-end justify-center"
                  onMouseEnter={() => setHover(i)}
                  onMouseLeave={() => setHover(null)}
                >
                  {hover === i && (
                    <span className="absolute -top-1 z-10 whitespace-nowrap rounded-md bg-[var(--adm-ink)] px-2 py-1 text-[11px] font-medium text-white">
                      {formatCurrency(d.revenue)}
                    </span>
                  )}
                  {/* ghost last-week bar */}
                  <div
                    className="absolute bottom-1 w-full max-w-[30px] rounded-full bg-[var(--adm-white-600)]"
                    style={{ height: `${hPrev}%`, transform: 'translateX(5px)' }}
                  />
                  {/* this-week bar */}
                  <div
                    className="relative w-full max-w-[26px] rounded-full transition-all"
                    style={{
                      height: `${h}%`,
                      background: isPeak ? 'var(--adm-forest-500)' : 'var(--adm-mint)',
                    }}
                  />
                </div>
              )
            })}
          </div>

          <div className="mt-2 flex justify-between">
            {weekly.map((d, i) => (
              <span key={i} className="flex-1 text-center text-xs text-[var(--adm-muted)]">
                {d.label}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
