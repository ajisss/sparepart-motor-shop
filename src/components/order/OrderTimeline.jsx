import { formatDate } from '../../utils/formatDate'

// Vertical stepper over an order's statusHistory (oldest → newest).
// The last entry is the current status and is emphasized.
export default function OrderTimeline({ history = [] }) {
  if (!history.length) return null
  return (
    <ol className="flex flex-col">
      {history.map((entry, i) => {
        const isCurrent = i === history.length - 1
        const isLast = i === history.length - 1
        return (
          <li key={i} className="flex gap-3">
            <div className="flex flex-col items-center">
              <span
                className={`mt-1 size-3 shrink-0 rounded-full ${
                  isCurrent ? 'bg-primary-600' : 'bg-neutral-300'
                }`}
              />
              {!isLast && <span className="w-px flex-1 bg-neutral-200" />}
            </div>
            <div className={isLast ? '' : 'pb-6'}>
              <p className={`text-sm font-medium ${isCurrent ? 'text-neutral-900' : 'text-neutral-700'}`}>
                {entry.status}
              </p>
              <p className="text-xs text-neutral-500">{formatDate(entry.at)}</p>
            </div>
          </li>
        )
      })}
    </ol>
  )
}
