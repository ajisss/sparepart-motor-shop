import { useState } from 'react'
import Button from '../../components/ui/Button'

export const PAYMENT_OPTIONS = [
  { id: 'transfer', label: 'Transfer Bank' },
  { id: 'cod', label: 'Bayar di Tempat (COD)' },
  { id: 'ewallet', label: 'E-Wallet' },
]

export default function PaymentStep({ data, onChange, onNext, onBack }) {
  const [promoCode, setPromoCode] = useState('')

  return (
    <div className="flex flex-col gap-6 p-4 lg:p-6">
      <div>
        <h2 className="text-base font-semibold text-neutral-900">Metode pembayaran</h2>
        <div className="mt-3 flex flex-col gap-3">
          {PAYMENT_OPTIONS.map((opt) => {
            const active = data.paymentMethod === opt.id
            return (
              <label
                key={opt.id}
                className={`flex cursor-pointer items-center gap-3 rounded-2xl border px-4 py-3 transition-colors ${
                  active ? 'border-primary-600' : 'border-neutral-100 hover:border-neutral-200'
                }`}
              >
                <input
                  type="radio"
                  name="payment"
                  checked={active}
                  onChange={() => onChange({ paymentMethod: opt.id })}
                  className="size-4 accent-primary-600"
                />
                <span className="flex-1 text-sm font-medium text-neutral-900">{opt.label}</span>
              </label>
            )
          })}
        </div>
      </div>

      <div>
        <h2 className="text-base font-semibold text-neutral-900">Kode promo</h2>
        <div className="mt-3 flex gap-3">
          <input
            value={promoCode}
            onChange={(e) => setPromoCode(e.target.value)}
            disabled
            placeholder="Belum tersedia untuk prototype ini"
            className="h-10 flex-1 rounded-[10px] border border-neutral-200 bg-neutral-50 px-3 text-sm text-neutral-600 placeholder:text-neutral-600"
          />
          <Button variant="secondary" disabled type="button">
            Terapkan
          </Button>
        </div>
      </div>

      <div className="flex flex-col-reverse gap-3 border-t border-neutral-100 pt-4 sm:flex-row sm:justify-end">
        <Button variant="secondary" onClick={onBack} className="w-full sm:w-auto">
          Kembali
        </Button>
        <Button
          variant="primary"
          disabled={!data.paymentMethod}
          onClick={onNext}
          className="w-full sm:w-auto"
        >
          Lanjut ke Review
        </Button>
      </div>
    </div>
  )
}
