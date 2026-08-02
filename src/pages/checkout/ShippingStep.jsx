import { useState } from 'react'
import Button from '../../components/ui/Button'

export default function ShippingStep({ data, onChange, onNext }) {
  const { address } = data
  const [touched, setTouched] = useState(false)

  const isValid = Boolean(address.name && address.phone && address.fullAddress)

  function handleSubmit(e) {
    e.preventDefault()
    setTouched(true)
    if (!isValid) return
    onNext()
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6 p-4 lg:p-6">
      <div>
        <h2 className="text-base font-semibold text-neutral-900">Detail kontak</h2>
        <div className="mt-3 flex flex-col gap-4 rounded-2xl border border-neutral-100 p-4">
          <label className="flex flex-col gap-1.5">
            <span className="text-xs font-medium text-neutral-900">Nama penerima</span>
            <input
              value={address.name}
              onChange={(e) => onChange({ address: { ...address, name: e.target.value } })}
              placeholder="Nama lengkap"
              className="h-10 rounded-[10px] border border-neutral-200 bg-neutral-25 px-3 text-sm text-neutral-900 placeholder:text-neutral-600 focus:border-primary-600 focus:outline-none"
            />
            {touched && !address.name && (
              <span className="text-xs text-red-500">Nama penerima wajib diisi</span>
            )}
          </label>
          <label className="flex flex-col gap-1.5">
            <span className="text-xs font-medium text-neutral-900">Nomor telepon</span>
            <input
              value={address.phone}
              onChange={(e) => onChange({ address: { ...address, phone: e.target.value } })}
              placeholder="08xxxxxxxxxx"
              className="h-10 rounded-[10px] border border-neutral-200 bg-neutral-25 px-3 text-sm text-neutral-900 placeholder:text-neutral-600 focus:border-primary-600 focus:outline-none"
            />
            {touched && !address.phone && (
              <span className="text-xs text-red-500">Nomor telepon wajib diisi</span>
            )}
          </label>
        </div>
      </div>

      <div>
        <h2 className="text-base font-semibold text-neutral-900">Alamat pengiriman</h2>
        <div className="mt-3 flex flex-col gap-1.5 rounded-2xl border border-neutral-100 p-4">
          <span className="text-xs font-medium text-neutral-900">Alamat lengkap</span>
          <textarea
            value={address.fullAddress}
            onChange={(e) => onChange({ address: { ...address, fullAddress: e.target.value } })}
            placeholder="Nama jalan, nomor rumah, kelurahan, kecamatan, kota, kode pos"
            rows={3}
            className="rounded-[10px] border border-neutral-200 bg-neutral-25 px-3 py-2 text-sm text-neutral-900 placeholder:text-neutral-600 focus:border-primary-600 focus:outline-none"
          />
          {touched && !address.fullAddress && (
            <span className="text-xs text-red-500">Alamat lengkap wajib diisi</span>
          )}
        </div>
      </div>

      <div className="flex justify-end border-t border-neutral-100 pt-4">
        <Button type="submit" variant="primary" className="w-full lg:w-auto">
          Lanjut ke Pengiriman
        </Button>
      </div>
    </form>
  )
}
