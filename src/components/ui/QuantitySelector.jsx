export default function QuantitySelector({ value, min = 1, max = 99, onChange }) {
  return (
    <div className="inline-flex items-center border border-neutral-200 rounded-pill text-neutral-900">
      <button
        type="button"
        className="w-9 h-9 flex items-center justify-center disabled:opacity-40"
        disabled={value <= min}
        onClick={() => onChange(value - 1)}
      >
        −
      </button>
      <span className="w-8 text-center font-medium">{value}</span>
      <button
        type="button"
        className="w-9 h-9 flex items-center justify-center disabled:opacity-40"
        disabled={value >= max}
        onClick={() => onChange(value + 1)}
      >
        +
      </button>
    </div>
  )
}
