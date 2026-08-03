export default function Input({ error, className = '', ...props }) {
  return (
    <input
      className={`rounded-md border px-4 py-3 text-neutral-900 outline-none transition-colors placeholder:text-neutral-600 focus:border-primary-600 ${
        error ? 'border-error' : 'border-neutral-200'
      } ${className}`}
      {...props}
    />
  )
}
