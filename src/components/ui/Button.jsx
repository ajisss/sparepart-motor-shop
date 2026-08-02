export default function Button({ variant = 'primary', children, className = '', ...props }) {
  const base =
    'inline-flex items-center justify-center gap-2 rounded-pill font-medium text-base px-6 py-3 transition-colors disabled:opacity-50 disabled:cursor-not-allowed'
  const variants = {
    primary: 'bg-primary-600 text-neutral-0 hover:bg-primary-700',
    secondary:
      'bg-neutral-0 text-neutral-900 border border-neutral-200 hover:bg-neutral-50',
  }
  return (
    <button className={`${base} ${variants[variant]} ${className}`} {...props}>
      {children}
    </button>
  )
}
