import Button from '../../components/ui/Button'
import { formatCurrency } from '../../utils/formatCurrency'

export const DELIVERY_OPTIONS = [
  { id: 'reguler', label: 'Reguler', eta: 'Tiba dalam 2-3 hari kerja', price: 15000, badge: 'Hemat' },
  { id: 'express', label: 'Express', eta: 'Tiba dalam 1 hari kerja', price: 35000, badge: 'Prioritas' },
]

export default function DeliveryStep({ data, onChange, onNext, onBack }) {
  return (
    <div className="flex flex-col gap-4 p-4 lg:p-6">
      <div>
        <h2 className="text-base font-semibold text-neutral-900">Pilih metode pengiriman</h2>
        <p className="mt-1 text-sm text-neutral-600">Tentukan seberapa cepat pesanan harus sampai.</p>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {DELIVERY_OPTIONS.map((opt) => {
          const active = data.deliveryMethod === opt.id
          return (
            <label
              key={opt.id}
              className={`flex cursor-pointer flex-col gap-4 rounded-2xl border p-4 transition-colors ${
                active ? 'border-primary-600' : 'border-neutral-100 hover:border-neutral-200'
              }`}
            >
              <div className="flex items-start justify-between">
                <span className="text-sm font-semibold text-neutral-900">{opt.label}</span>
                <input
                  type="radio"
                  name="delivery"
                  checked={active}
                  onChange={() => onChange({ deliveryMethod: opt.id })}
                  className="size-4 accent-primary-600"
                />
              </div>
              <p className="text-sm text-neutral-600">{opt.eta}</p>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-neutral-900">{formatCurrency(opt.price)}</span>
                <span className="rounded-md bg-neutral-50 px-2 py-1 text-xs text-neutral-600">{opt.badge}</span>
              </div>
            </label>
          )
        })}
      </div>

      <div className="flex flex-col-reverse gap-3 border-t border-neutral-100 pt-4 sm:flex-row sm:justify-end">
        <Button variant="secondary" onClick={onBack} className="w-full sm:w-auto">
          Kembali
        </Button>
        <Button
          variant="primary"
          disabled={!data.deliveryMethod}
          onClick={onNext}
          className="w-full sm:w-auto"
        >
          Lanjut ke Pembayaran
        </Button>
      </div>
    </div>
  )
}
