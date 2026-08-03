import { useEffect, useState } from 'react'
import Modal from '../ui/Modal'
import RadioCard from '../ui/RadioCard'
import Button from '../ui/Button'
import Select from '../ui/Select'
import { formatCurrency } from '../../utils/formatCurrency'

const METHODS = [
  { id: 'va-bca', title: 'Virtual Account BCA', subtitle: 'Transfer otomatis via VA BCA' },
  { id: 'gopay', title: 'GoPay', subtitle: 'Bayar dengan saldo GoPay' },
  { id: 'qris', title: 'QRIS', subtitle: 'Scan QRIS dari aplikasi bank/e-wallet apa pun' },
]

const OUTCOMES = [
  { value: 'paid', label: 'Berhasil' },
  { value: 'pending', label: 'Pending' },
  { value: 'failed', label: 'Gagal' },
]

export default function PaymentModal({ open, total, onClose, onResult }) {
  const [method, setMethod] = useState(METHODS[0].id)
  const [outcome, setOutcome] = useState('paid')
  const [error, setError] = useState(false)

  // Clear any leftover "gagal" state from a previous attempt each time the
  // modal is freshly opened for a new payment.
  useEffect(() => {
    if (open) setError(false)
  }, [open])

  const handlePay = () => {
    if (outcome === 'failed') {
      setError(true)
      onResult('failed')
      return
    }
    setError(false)
    onResult(outcome)
  }

  return (
    <Modal
      open={open}
      onClose={() => onClose?.()}
      maxWidth="max-w-md"
      title={
        <span className="flex items-center gap-2">
          Pembayaran
          <span className="rounded-pill bg-neutral-100 px-2 py-0.5 text-xs font-normal text-neutral-600">
            Simulasi
          </span>
        </span>
      }
    >
      <div className="flex flex-col gap-4">
        <div className="rounded-md bg-neutral-25 p-4 text-center">
          <p className="text-sm text-neutral-600">Total pembayaran</p>
          <p className="mt-1 text-2xl font-semibold text-neutral-900">{formatCurrency(total)}</p>
        </div>

        <div className="flex flex-col gap-2">
          <p className="text-sm font-medium text-neutral-900">Pilih metode pembayaran</p>
          {METHODS.map((m) => (
            <RadioCard
              key={m.id}
              title={m.title}
              subtitle={m.subtitle}
              selected={method === m.id}
              onSelect={() => setMethod(m.id)}
            />
          ))}
        </div>

        {error && (
          <p className="rounded-md bg-error/10 px-3 py-2 text-sm text-error">
            Pembayaran gagal, coba lagi.
          </p>
        )}

        <div className="flex flex-col gap-1.5 border-t border-neutral-100 pt-4">
          <label htmlFor="payment-outcome" className="text-xs text-neutral-600">
            Simulasikan hasil pembayaran (demo)
          </label>
          <Select id="payment-outcome" value={outcome} onChange={(e) => setOutcome(e.target.value)}>
            {OUTCOMES.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </Select>
        </div>

        <Button variant="primary" onClick={handlePay} className="w-full">
          Bayar Sekarang
        </Button>
      </div>
    </Modal>
  )
}
