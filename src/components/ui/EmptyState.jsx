import Button from './Button'

export default function EmptyState({ title, description, actionLabel, onAction }) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-16 gap-3">
      <h3 className="text-lg font-semibold text-neutral-900">{title}</h3>
      {description && <p className="text-neutral-600 max-w-sm">{description}</p>}
      {actionLabel && onAction && (
        <Button variant="primary" onClick={onAction} className="mt-2">
          {actionLabel}
        </Button>
      )}
    </div>
  )
}
