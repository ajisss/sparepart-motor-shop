export default function QuantitySelector({ value, min = 1, max = 99, onChange }) {
  return (
    <div className="inline-flex items-center border border-neutral-200 rounded-pill text-neutral-900">
      <button
        type="button"
        aria-label="Kurangi jumlah"
        className="flex h-10 w-10 items-center justify-center rounded-l-pill transition-colors hover:bg-neutral-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600 disabled:opacity-50 disabled:hover:bg-transparent"
        disabled={value <= min}
        onClick={() => onChange(value - 1)}
      >
        −
      </button>
      <span className="w-8 text-center font-medium">{value}</span>
      <button
        type="button"
        aria-label="Tambah jumlah"
        className="flex h-10 w-10 items-center justify-center rounded-r-pill transition-colors hover:bg-neutral-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600 disabled:opacity-50 disabled:hover:bg-transparent"
        disabled={value >= max}
        onClick={() => onChange(value + 1)}
      >
        +
      </button>
    </div>
  )
}
