import DeltaChip from './DeltaChip'
import { InfoIcon } from '../icons'

export default function StatCard({
  icon: Icon,
  label,
  value,
  delta,
  lastWeek,
  lastWeekLabel,
  info,
}) {
  return (
    <div className="adm-card flex min-h-[160px] flex-col p-5">
      {/* Label row */}
      <div className="flex items-center gap-2">
        <span className="flex size-8 items-center justify-center rounded-lg bg-[var(--adm-bg)] text-black">
          {Icon && <Icon className="size-[18px]" />}
        </span>
        <span className="flex-1 text-[14px] font-medium text-[var(--adm-text)]">{label}</span>
        {info && <InfoIcon className="size-4 text-[var(--adm-muted)]" />}
      </div>

      {/* Big number */}
      <div className="mt-4">
        <span className="adm-stat-number text-[32px]">{value}</span>
      </div>

      {/* Last week + delta */}
      {lastWeek != null && (
        <div className="mt-2 flex items-center gap-2 text-[12px] text-[var(--adm-muted)]">
          <span>Minggu lalu: <span className="text-black font-medium">{lastWeekLabel || lastWeek.toLocaleString('id-ID')}</span></span>
          {delta != null && <DeltaChip value={delta} />}
        </div>
      )}
    </div>
  )
}
