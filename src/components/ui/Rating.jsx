export default function Rating({ value, reviewCount }) {
  const filled = Math.round(value)
  return (
    <div className="flex items-center gap-1.5">
      <span className="font-semibold text-neutral-900">{value.toFixed(1)}</span>
      <span aria-hidden className="flex text-sm leading-none">
        {[1, 2, 3, 4, 5].map((i) => (
          <span key={i} className={i <= filled ? 'text-secondary-600' : 'text-neutral-200'}>
            ★
          </span>
        ))}
      </span>
      {reviewCount != null && (
        <span className="text-sm text-neutral-600">({reviewCount})</span>
      )}
    </div>
  )
}
