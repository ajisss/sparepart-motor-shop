import { useState } from 'react'
import FormField from '../../components/ui/FormField'
import Input from '../../components/ui/Input'
import Button from '../../components/ui/Button'
import { useAuth } from '../../context/AuthContext'
import { useStore } from '../../store/StoreProvider'

const ADDRESS_FIELDS = [
  { key: 'recipientName', label: 'Nama penerima', placeholder: 'Nama lengkap penerima' },
  { key: 'phone', label: 'Nomor telepon', placeholder: '08xxxxxxxxxx' },
  { key: 'line', label: 'Alamat lengkap', placeholder: 'Nama jalan, nomor, kelurahan, kecamatan' },
  { key: 'city', label: 'Kota/Kabupaten', placeholder: 'Kota' },
  { key: 'province', label: 'Provinsi', placeholder: 'Provinsi' },
  { key: 'postalCode', label: 'Kode pos', placeholder: '40111' },
]

export default function AddressStep({ data, onChange, onNext, onBack, mode }) {
  const { currentUser } = useAuth()
  const { setDefaultAddress } = useStore()
  const [touched, setTouched] = useState(false)

  const defaultAddr =
    mode === 'account' && currentUser
      ? currentUser.addresses?.find((a) => a.id === currentUser.defaultAddressId)
      : null
  const [editing, setEditing] = useState(!defaultAddr)

  const { contact, address } = data
  const showAddressForm = mode === 'guest' || editing || !defaultAddr

  const setContact = (patch) => onChange({ contact: { ...contact, ...patch } })
  const setAddress = (patch) => onChange({ address: { ...address, ...patch } })

  const contactValid =
    mode !== 'guest' || Boolean(contact.name && contact.phone && contact.email)
  const addressValid =
    !showAddressForm || ADDRESS_FIELDS.every((f) => Boolean(address[f.key]))
  const isValid = contactValid && addressValid

  function handleSubmit(e) {
    e.preventDefault()
    setTouched(true)
    if (!isValid) return
    // Persist a first-time address to the profile so it becomes the default.
    if (mode === 'account' && !defaultAddr && currentUser) {
      setDefaultAddress(currentUser.id, { id: 'a-' + Date.now(), ...address })
    }
    onNext()
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6 p-4 lg:p-6">
      {mode === 'guest' && (
        <div>
          <h2 className="text-base font-semibold text-neutral-900">Detail kontak</h2>
          <div className="mt-3 flex flex-col gap-4 rounded-2xl border border-neutral-100 p-4">
            <FormField
              label="Nama"
              error={touched && !contact.name ? 'Nama wajib diisi' : ''}
            >
              <Input
                value={contact.name}
                onChange={(e) => setContact({ name: e.target.value })}
                placeholder="Nama lengkap"
                error={touched && !contact.name}
              />
            </FormField>
            <FormField
              label="Nomor telepon"
              error={touched && !contact.phone ? 'Nomor telepon wajib diisi' : ''}
            >
              <Input
                value={contact.phone}
                onChange={(e) => setContact({ phone: e.target.value })}
                placeholder="08xxxxxxxxxx"
                error={touched && !contact.phone}
              />
            </FormField>
            <FormField
              label="Email"
              error={touched && !contact.email ? 'Email wajib diisi' : ''}
            >
              <Input
                type="email"
                value={contact.email}
                onChange={(e) => setContact({ email: e.target.value })}
                placeholder="nama@email.com"
                error={touched && !contact.email}
              />
            </FormField>
          </div>
        </div>
      )}

      {mode === 'account' && (
        <div>
          <h2 className="text-base font-semibold text-neutral-900">Detail kontak</h2>
          <div className="mt-3 rounded-2xl border border-neutral-100 p-4 text-sm text-neutral-600">
            <p className="font-medium text-neutral-900">{contact.name}</p>
            <p>{contact.phone}</p>
            <p>{contact.email}</p>
          </div>
        </div>
      )}

      <div>
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold text-neutral-900">Alamat pengiriman</h2>
          {mode === 'account' && defaultAddr && (
            <button
              type="button"
              onClick={() => setEditing((v) => !v)}
              className="text-sm font-medium text-primary-600 underline"
            >
              {editing ? 'Gunakan alamat tersimpan' : 'Ubah/Tambah alamat'}
            </button>
          )}
        </div>

        {mode === 'account' && defaultAddr && !editing ? (
          <div className="mt-3 rounded-2xl border border-primary-600 bg-primary-25 p-4 text-sm">
            <p className="font-medium text-neutral-900">{address.recipientName}</p>
            <p className="text-neutral-600">{address.phone}</p>
            <p className="mt-1 text-neutral-600">
              {address.line}, {address.city}, {address.province} {address.postalCode}
            </p>
          </div>
        ) : (
          <div className="mt-3 grid grid-cols-1 gap-4 rounded-2xl border border-neutral-100 p-4 sm:grid-cols-2">
            {ADDRESS_FIELDS.map((f) => (
              <FormField
                key={f.key}
                label={f.label}
                error={touched && !address[f.key] ? `${f.label} wajib diisi` : ''}
              >
                <Input
                  value={address[f.key]}
                  onChange={(e) => setAddress({ [f.key]: e.target.value })}
                  placeholder={f.placeholder}
                  error={touched && !address[f.key]}
                />
              </FormField>
            ))}
          </div>
        )}
      </div>

      <div className="flex flex-col-reverse gap-3 border-t border-neutral-100 pt-4 sm:flex-row sm:justify-end">
        {mode === 'guest' && (
          <Button type="button" variant="secondary" onClick={onBack} className="w-full sm:w-auto">
            Kembali
          </Button>
        )}
        <Button type="submit" variant="primary" className="w-full sm:w-auto">
          Lanjut ke Pengiriman
        </Button>
      </div>
    </form>
  )
}
