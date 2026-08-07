import DeltaChip from './DeltaChip'
import { InfoIcon } from '../icons'

export default function StatCard({
  icon: Icon,
  label,
  value,
  sub,
  delta,
  lastWeek,
  lastWeekLabel,
  info,
}) {
  return (
    <div className="adm-card flex flex-col gap-4 p-5">
      {/* Label row */}
      <div className="flex items-center gap-2.5">
        <span className="flex size-9 items-center justify-center rounded-xl bg-[var(--adm-bg)] text-[var(--adm-ink)]">
          {Icon && <Icon className="size-[18px]" />}
        </span>
        <span className="flex-1 text-[14px] font-medium text-[var(--adm-text)]">{label}</span>
        {info && <InfoIcon className="size-4 text-[var(--adm-muted)]" />}
      </div>

      {/* Big number + optional inline sub */}
      <div className="flex items-baseline justify-between gap-3">
        <span className="adm-stat-number text-[32px] leading-none">{value}</span>
        {sub && <span className="shrink-0 text-[13px] text-[var(--adm-muted)]">{sub}</span>}
      </div>

      {/* Optional last-week + delta (kept for other callers) */}
      {lastWeek != null && (
        <div className="flex items-center gap-2 text-[12px] text-[var(--adm-muted)]">
          <span>Minggu lalu: <span className="font-medium text-[var(--adm-ink)]">{lastWeekLabel || lastWeek.toLocaleString('id-ID')}</span></span>
          {delta != null && <DeltaChip value={delta} />}
        </div>
      )}
    </div>
  )
}
