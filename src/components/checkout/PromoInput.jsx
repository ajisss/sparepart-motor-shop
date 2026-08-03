import { useState } from 'react'
import Input from '../ui/Input'
import Button from '../ui/Button'

export default function PromoInput({ applied, onApply, onRemove, error }) {
  const [code, setCode] = useState('')

  if (applied) {
    return (
      <div className="flex items-center justify-between rounded-md bg-primary-25 px-4 py-3">
        <span className="text-sm font-medium text-primary-700">Kode {applied.code} diterapkan</span>
        <button type="button" onClick={onRemove} className="text-sm text-neutral-600 underline">
          Hapus
        </button>
      </div>
    )
  }
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex gap-2">
        <Input
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="Kode promo"
          className="flex-1"
          error={!!error}
        />
        <Button type="button" variant="secondary" onClick={() => onApply(code)}>
          Pakai
        </Button>
      </div>
      {error && <span className="text-sm text-error">{error}</span>}
    </div>
  )
}
