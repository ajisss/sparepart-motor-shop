export default function CategoryChip({ label, active, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-pill px-4 py-2 text-sm font-medium border transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600 focus-visible:ring-offset-1 ${
        active
          ? 'bg-secondary-600 text-neutral-900 border-secondary-600'
          : 'bg-neutral-0 text-neutral-800 border-neutral-200 hover:border-neutral-800'
      }`}
    >
      {label}
    </button>
  )
}
