export default function Button({ variant = 'primary', size = 'md', children, className = '', ...props }) {
  const base =
    'inline-flex items-center justify-center gap-2 rounded-pill font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600 focus-visible:ring-offset-2'
  const sizes = {
    sm: 'text-sm px-4 py-2',
    md: 'text-sm px-5 py-2.5',
    lg: 'text-base px-6 py-3',
  }
  const variants = {
    primary: 'bg-primary-600 text-neutral-0 hover:bg-primary-700',
    secondary:
      'bg-neutral-0 text-neutral-900 border border-neutral-200 hover:bg-neutral-50',
    // Yellow accent — use for the main CTA on dark/black surfaces where a black
    // primary button would have no contrast.
    accent: 'bg-secondary-600 text-neutral-900 hover:bg-secondary-700',
    danger: 'bg-error text-neutral-0 hover:bg-error/90',
    ghost: 'bg-transparent text-neutral-700 hover:bg-neutral-50',
  }
  return (
    <button className={`${base} ${sizes[size]} ${variants[variant]} ${className}`} {...props}>
      {children}
    </button>
  )
}
