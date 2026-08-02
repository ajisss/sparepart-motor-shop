import { formatCurrency } from '../../utils/formatCurrency'

export default function PriceTag({ amount, originalAmount }) {
  return (
    <div className="flex items-baseline gap-2">
      <span className="font-semibold text-neutral-900">{formatCurrency(amount)}</span>
      {originalAmount && originalAmount > amount && (
        <span className="text-sm text-neutral-600 line-through">
          {formatCurrency(originalAmount)}
        </span>
      )}
    </div>
  )
}
