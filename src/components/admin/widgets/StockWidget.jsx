import { BoxIcon } from '../icons'

// Commerly "Product Stock" widget: header + segmented bar + 3 status rows.
export default function StockWidget({ stock }) {
  const total = Math.max(1, stock.out + stock.low + stock.in)
  const rows = [
    { key: 'out', label: 'Stok habis', value: stock.out, color: 'var(--adm-danger)' },
    { key: 'low', label: 'Stok menipis', value: stock.low, color: 'var(--adm-warning)' },
    { key: 'in', label: 'Stok aman', value: stock.in, color: 'var(--adm-mint)' },
  ]

  return (
    <div className="adm-card flex flex-col p-5">
      <div className="flex items-center gap-2 text-[var(--adm-forest-400)]">
        <span className="flex size-8 items-center justify-center rounded-lg bg-[var(--adm-bg)]">
          <BoxIcon className="size-[18px]" />
        </span>
        <span className="text-sm font-medium text-[var(--adm-text)]">Status Stok</span>
      </div>

      {/* Segmented bar */}
      <div className="mt-4 flex h-2 w-full overflow-hidden rounded-full bg-[var(--adm-bg)]">
        {rows.map((r) => (
          <div
            key={r.key}
            style={{ width: `${(r.value / total) * 100}%`, background: r.color }}
          />
        ))}
      </div>

      <ul className="mt-4 flex flex-col gap-2.5">
        {rows.map((r) => (
          <li key={r.key} className="flex items-center gap-2 text-sm">
            <span className="size-2 rounded-full" style={{ background: r.color }} />
            <span className="flex-1 text-[var(--adm-text)]">{r.label}</span>
            <span className="font-medium text-[var(--adm-ink)]">{r.value}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}
