// Small bar chart used inside the "Average Delivery Time" card (Commerly).
export default function MiniBars({ data = [], height = 56 }) {
  const vals = data.length ? data : [1]
  const max = Math.max(1, ...vals)
  return (
    <div className="flex items-end gap-1" style={{ height }}>
      {vals.map((v, i) => {
        const peak = v === max
        return (
          <span
            key={i}
            className="w-1.5 rounded-full"
            style={{
              height: `${Math.max(12, (v / max) * 100)}%`,
              background: peak ? 'var(--adm-forest-500)' : 'var(--adm-mint)',
            }}
          />
        )
      })}
    </div>
  )
}
