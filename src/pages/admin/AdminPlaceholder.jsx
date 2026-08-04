import { SparkleIcon } from '../../components/admin/icons'

// SP4: styled "coming soon" page for admin destinations whose real content
// lands in SP5 (produk/konten) and SP6 (pesanan/refund).
export default function AdminPlaceholder({ title, subtitle, note }) {
  return (
    <div className="mx-auto max-w-[1200px] p-6 lg:p-8">
      <h1 className="text-2xl font-medium text-[var(--adm-ink)]">{title}</h1>
      {subtitle && <p className="mt-1 text-sm text-[var(--adm-muted)]">{subtitle}</p>}

      <div className="adm-card mt-6 flex flex-col items-center justify-center px-6 py-16 text-center">
        <span className="flex size-12 items-center justify-center rounded-2xl bg-[var(--adm-bg)] text-[var(--adm-forest-500)]">
          <SparkleIcon className="size-6" />
        </span>
        <p className="mt-4 text-base font-medium text-[var(--adm-ink)]">Segera hadir</p>
        <p className="mt-1 max-w-sm text-sm text-[var(--adm-muted)]">
          {note || 'Halaman ini sedang disiapkan pada tahap pengembangan berikutnya.'}
        </p>
      </div>
    </div>
  )
}
