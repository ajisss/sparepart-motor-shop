export default function Stepper({ steps, currentIndex }) {
  return (
    <div className="flex flex-col gap-2 border-b border-neutral-100 p-4 lg:p-6">
      <div className="flex items-center gap-1">
        {steps.map((s, i) => (
          <div key={s.id} className="flex flex-1 items-center gap-1 last:flex-none">
            <span
              className={`size-2 shrink-0 rounded-full ${
                i <= currentIndex ? 'bg-primary-600' : 'bg-neutral-200'
              }`}
            />
            {i < steps.length - 1 && (
              <span
                className={`h-0.5 flex-1 rounded-full ${
                  i < currentIndex ? 'bg-primary-600' : 'bg-neutral-200'
                }`}
              />
            )}
          </div>
        ))}
      </div>
      <div className="flex items-start justify-between text-xs font-medium tracking-[-0.24px] sm:text-sm">
        {steps.map((s, i) => (
          <span key={s.id} className={i === currentIndex ? 'text-neutral-900' : 'text-neutral-600'}>
            {s.label}
          </span>
        ))}
      </div>
    </div>
  )
}
