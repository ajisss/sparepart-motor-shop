import { TrendUp, TrendDown } from '../icons'

// Small ↑/↓ percent pill used on stat cards ("↑ 7%").
export default function DeltaChip({ value = 0, suffix = '' }) {
  const up = value >= 0
  return (
    <span
      className="inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-xs font-medium"
      style={{
        color: up ? 'var(--adm-success)' : 'var(--adm-danger)',
        background: up ? 'var(--adm-success-bg)' : 'var(--adm-danger-bg)',
      }}
    >
      {up ? <TrendUp className="size-3" /> : <TrendDown className="size-3" />}
      {Math.abs(value)}%{suffix && <span className="ml-0.5 font-normal text-[var(--adm-muted)]">{suffix}</span>}
    </span>
  )
}
