import Button from '../ui/Button'

export default function ConfirmDeleteModal({ open, onConfirm, onCancel, itemLabel }) {
  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-delete-title"
    >
      <div className="flex w-full max-w-sm flex-col gap-3 rounded-2xl bg-neutral-0 p-6">
        <h3 id="confirm-delete-title" className="text-base font-semibold text-neutral-900">
          Hapus produk dari keranjang?
        </h3>
        <p className="text-sm text-neutral-600">
          Yakin ingin menghapus {itemLabel ? <span className="font-medium text-neutral-900">{itemLabel}</span> : 'produk ini'} dari keranjang?
        </p>
        <div className="mt-2 flex items-center gap-3">
          <Button variant="danger" onClick={onConfirm}>
            Hapus
          </Button>
          <Button variant="secondary" onClick={onCancel}>
            Batal
          </Button>
        </div>
      </div>
    </div>
  )
}
