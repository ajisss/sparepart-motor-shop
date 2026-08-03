export default function RadioCard({ selected, onSelect, title, subtitle, right, disabled, children }) {
  return (
    <button
      type="button"
      onClick={disabled ? undefined : onSelect}
      disabled={disabled}
      className={`flex w-full items-center gap-3 rounded-md border p-4 text-left transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${
        selected ? 'border-primary-600 bg-primary-25' : 'border-neutral-200 bg-neutral-0 hover:bg-neutral-25'
      }`}
    >
      <span
        className={`flex h-5 w-5 flex-none items-center justify-center rounded-full border-2 ${
          selected ? 'border-primary-600' : 'border-neutral-200'
        }`}
      >
        {selected && <span className="h-2.5 w-2.5 rounded-full bg-primary-600" />}
      </span>
      <span className="flex-1">
        <span className="block font-medium text-neutral-900">{title}</span>
        {subtitle && <span className="block text-sm text-neutral-600">{subtitle}</span>}
        {children}
      </span>
      {right && <span className="flex-none text-right">{right}</span>}
    </button>
  )
}
