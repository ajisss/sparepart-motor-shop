export default function CategoryChip({ label, active, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-pill px-4 py-2 text-sm font-medium border transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600 focus-visible:ring-offset-1 ${
        active
          ? 'bg-primary-600 text-neutral-0 border-primary-600'
          : 'bg-neutral-0 text-neutral-800 border-neutral-200 hover:border-primary-200'
      }`}
    >
      {label}
    </button>
  )
}
