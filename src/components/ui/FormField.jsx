export default function FormField({ label, error, htmlFor, children }) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label htmlFor={htmlFor} className="text-sm font-medium text-neutral-800">
          {label}
        </label>
      )}
      {children}
      {error && <span className="text-sm text-error">{error}</span>}
    </div>
  )
}
