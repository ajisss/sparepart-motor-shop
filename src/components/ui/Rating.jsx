export default function Rating({ value, reviewCount }) {
  return (
    <div className="flex items-center gap-1.5">
      <span className="font-semibold text-neutral-900">{value.toFixed(1)}</span>
      <span aria-hidden className="text-primary-800 text-sm leading-none">
        ★★★★★
      </span>
      {reviewCount != null && (
        <span className="text-sm text-neutral-600">({reviewCount})</span>
      )}
    </div>
  )
}
