export default function Select({ error, className = '', children, ...props }) {
  return (
    <select
      className={`rounded-md border bg-neutral-0 px-4 py-3 text-neutral-900 outline-none transition-colors focus:border-primary-600 ${
        error ? 'border-error' : 'border-neutral-200'
      } ${className}`}
      {...props}
    >
      {children}
    </select>
  )
}
