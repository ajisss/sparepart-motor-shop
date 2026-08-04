import { useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import {
  PencilSimple, Plus, CaretDown, CaretUp, Check, X,
  Monitor, ArrowSquareOut, Phone, Envelope,
} from '@phosphor-icons/react'

// ─── Shared primitives ──────────────────────────────────────────────────────

function SectionRow({ label, desc, children }) {
  return (
    <div className="flex items-start justify-between gap-6 border-b border-[var(--adm-border)] py-5 last:border-0">
      <div className="min-w-0">
        <p className="text-[14px] font-medium text-[var(--adm-ink)]">{label}</p>
        {desc && <p className="mt-0.5 text-[13px] text-[var(--adm-muted)]">{desc}</p>}
      </div>
      <div className="flex shrink-0 items-center gap-3">{children}</div>
    </div>
  )
}

function Pill({ children, onClick, variant = 'outline' }) {
  const base = 'rounded-full px-4 py-1.5 text-[13px] font-medium transition-colors cursor-pointer'
  const styles = {
    outline: 'border border-[var(--adm-border)] bg-white text-[var(--adm-ink)] hover:bg-[var(--adm-bg)]',
    solid: 'border border-[var(--adm-border)] bg-white text-[var(--adm-ink)] hover:bg-[var(--adm-bg)]',
  }
  return <button type="button" className={`${base} ${styles[variant]}`} onClick={onClick}>{children}</button>
}

function Toggle({ enabled, onChange }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={enabled}
      onClick={() => onChange(!enabled)}
      className="relative flex shrink-0 items-center rounded-full transition-colors"
      style={{ width: 44, height: 24, background: enabled ? 'var(--adm-mint)' : 'var(--adm-border)' }}
    >
      <span
        className="absolute rounded-full bg-white shadow transition-all"
        style={{ width: 18, height: 18, left: enabled ? 22 : 4 }}
      />
      <span
        className="absolute text-[10px] font-semibold"
        style={{ left: enabled ? 6 : 'auto', right: enabled ? 'auto' : 5, color: enabled ? '#000' : 'var(--adm-muted)' }}
      >
        {enabled ? 'On' : 'Off'}
      </span>
    </button>
  )
}

function Checkbox({ checked, onChange, label }) {
  return (
    <label className="flex cursor-pointer items-center gap-2">
      <span
        className="flex size-4 items-center justify-center rounded border transition-colors"
        style={{
          background: checked ? 'var(--adm-forest-500)' : 'white',
          borderColor: checked ? 'var(--adm-forest-500)' : 'var(--adm-border)',
        }}
        onClick={() => onChange(!checked)}
      >
        {checked && <Check size={10} weight="bold" color="white" />}
      </span>
      {label && <span className="text-[13px] text-[var(--adm-ink)]">{label}</span>}
    </label>
  )
}

function Radio({ checked, onChange, label }) {
  return (
    <label className="flex cursor-pointer items-center gap-2" onClick={onChange}>
      <span
        className="flex size-4 items-center justify-center rounded-full border-2 transition-colors"
        style={{ borderColor: checked ? 'var(--adm-forest-500)' : 'var(--adm-border)' }}
      >
        {checked && (
          <span className="size-2 rounded-full" style={{ background: 'var(--adm-forest-500)' }} />
        )}
      </span>
      {label && <span className="text-[13px] text-[var(--adm-ink)]">{label}</span>}
    </label>
  )
}

function InfoBanner({ children, action, actionLabel }) {
  return (
    <div
      className="flex items-start justify-between gap-4 rounded-2xl px-4 py-3"
      style={{ background: 'rgba(0,81,255,0.06)', border: '1px solid rgba(0,81,255,0.15)' }}
    >
      <div className="flex items-start gap-2 text-[13px] text-[var(--adm-text)]">
        <span style={{ color: 'var(--adm-info)' }} className="mt-0.5 shrink-0">ⓘ</span>
        <span>{children}</span>
      </div>
      {action && (
        <button type="button" className="shrink-0 text-[13px] font-semibold" style={{ color: 'var(--adm-info)' }} onClick={action}>
          {actionLabel}
        </button>
      )}
    </div>
  )
}

// ─── Tab: Profile & Account ──────────────────────────────────────────────────

function ProfileTab({ user }) {
  const [name, setName] = useState(user?.name || 'Admin DMB')
  const [editingName, setEditingName] = useState(false)

  return (
    <div className="adm-card p-0 overflow-hidden">
      {/* Profile Picture */}
      <div className="flex items-start justify-between gap-6 border-b border-[var(--adm-border)] px-6 py-5">
        <div>
          <p className="text-[14px] font-medium text-[var(--adm-ink)]">Foto Profil</p>
          <p className="mt-0.5 text-[13px] text-[var(--adm-muted)]">Upload atau ubah foto akun Anda.</p>
        </div>
        <div className="flex shrink-0 items-center gap-3">
          <div
            className="flex size-10 items-center justify-center rounded-full text-[14px] font-bold text-white"
            style={{ background: 'var(--adm-forest-500)' }}
          >
            {name.charAt(0).toUpperCase()}
          </div>
          <Pill>Ubah</Pill>
        </div>
      </div>

      {/* Full Name */}
      <div className="flex items-start justify-between gap-6 border-b border-[var(--adm-border)] px-6 py-5">
        <div>
          <p className="text-[14px] font-medium text-[var(--adm-ink)]">Nama Lengkap</p>
          <p className="mt-0.5 text-[13px] text-[var(--adm-muted)]">Ubah nama tampilan Anda di platform.</p>
        </div>
        <div className="flex items-center gap-2">
          {editingName ? (
            <>
              <input
                className="rounded-lg border border-[var(--adm-border)] px-3 py-1.5 text-[13px] text-[var(--adm-ink)] outline-none focus:border-[var(--adm-forest-500)]"
                value={name}
                onChange={(e) => setName(e.target.value)}
                autoFocus
              />
              <button type="button" onClick={() => setEditingName(false)}>
                <Check size={16} className="text-[var(--adm-success)]" />
              </button>
            </>
          ) : (
            <>
              <span className="text-[13px] text-[var(--adm-ink)]">{name}</span>
              <button type="button" onClick={() => setEditingName(true)}>
                <PencilSimple size={16} className="text-[var(--adm-muted)]" />
              </button>
            </>
          )}
        </div>
      </div>

      {/* Email */}
      <div className="flex items-start justify-between gap-6 border-b border-[var(--adm-border)] px-6 py-5">
        <div>
          <p className="text-[14px] font-medium text-[var(--adm-ink)]">Alamat Email</p>
          <p className="mt-0.5 text-[13px] text-[var(--adm-muted)]">Perbarui email utama untuk login dan notifikasi.</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[13px] text-[var(--adm-ink)]">
            {user?.email?.replace(/(.{2}).*(@.*)/, '$1**$2') || 'ad**n@dmb.com'}
          </span>
          <PencilSimple size={16} className="text-[var(--adm-muted)]" />
        </div>
      </div>

      {/* Pending banner */}
      <div className="border-b border-[var(--adm-border)] px-6 py-4">
        <div
          className="flex items-start justify-between gap-4 rounded-xl px-4 py-3"
          style={{ background: 'var(--adm-bg)' }}
        >
          <div className="flex items-start gap-2 text-[13px] text-[var(--adm-text)]">
            <span className="mt-0.5 shrink-0">ⓘ</span>
            <div>
              <p className="font-medium text-[var(--adm-ink)]">Perubahan Email Tertunda</p>
              <p className="mt-0.5 text-[var(--adm-muted)]">Anda sudah meminta perubahan email. Silakan cek inbox Anda.</p>
            </div>
          </div>
          <button type="button" className="shrink-0 text-[13px] font-semibold text-[var(--adm-danger)]">
            Batalkan
          </button>
        </div>
      </div>

      {/* Phone */}
      <div className="flex items-start justify-between gap-6 px-6 py-5">
        <div>
          <p className="text-[14px] font-medium text-[var(--adm-ink)]">Nomor Telepon</p>
          <p className="mt-0.5 text-[13px] text-[var(--adm-muted)]">Tambah atau ubah nomor telepon untuk verifikasi.</p>
        </div>
        <button
          type="button"
          className="flex items-center gap-1.5 text-[13px] font-medium text-[var(--adm-ink)]"
        >
          <Plus size={14} weight="bold" />
          Tambah Nomor
        </button>
      </div>
    </div>
  )
}

// ─── Tab: Security ───────────────────────────────────────────────────────────

function SecurityTab() {
  const [twoFA, setTwoFA] = useState(false)
  const [passkey, setPasskey] = useState(true)

  return (
    <div className="flex flex-col gap-4">
      <InfoBanner actionLabel="Aktifkan">
        Gunakan autentikasi dua faktor (2FA) saat login untuk keamanan lebih.
      </InfoBanner>

      <div className="adm-card p-0 overflow-hidden">
        <SectionRow label="Password" desc="Perbarui password akun Anda untuk keamanan lebih.">
          <Pill>Update Password</Pill>
        </SectionRow>

        <SectionRow label="Autentikasi Dua Faktor (2FA)" desc="Tambahkan lapisan keamanan ekstra pada akun Anda.">
          <Toggle enabled={twoFA} onChange={setTwoFA} />
        </SectionRow>

        <SectionRow label="Passkey" desc="Login aman tanpa password menggunakan passkey berbasis perangkat.">
          <Toggle enabled={passkey} onChange={setPasskey} />
        </SectionRow>

        <div className="px-6 py-5 border-t border-[var(--adm-border)]">
          <p className="text-[14px] font-medium text-[var(--adm-ink)] mb-1">Sesi Aktif</p>
          <p className="text-[13px] text-[var(--adm-muted)] mb-4">Lihat dan kelola perangkat yang sedang login ke akun Anda.</p>
          <div className="flex flex-col gap-3">
            {[
              { label: 'MacBook Pro 14-inch 2025', sub: 'Bandung, Jawa Barat', current: true },
              { label: 'iPad Pro 2023', sub: 'Bandung, Jawa Barat', current: false },
            ].map((d) => (
              <div key={d.label} className="flex items-center gap-3">
                <Monitor size={20} className="shrink-0 text-[var(--adm-muted)]" />
                <div className="flex-1">
                  <p className="text-[13px] font-medium text-[var(--adm-ink)]">
                    {d.label}
                    {d.current && (
                      <span className="ml-2 text-[11px] font-semibold" style={{ color: 'var(--adm-info)' }}>
                        Perangkat ini
                      </span>
                    )}
                  </p>
                  <p className="text-[12px] text-[var(--adm-muted)]">{d.sub}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Tab: Store Settings ─────────────────────────────────────────────────────

const DAYS = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu']
const DEFAULT_HOURS = { open: true, from: '09:00', to: '17:00' }

function StoreTab() {
  const [status, setStatus] = useState('open')
  const [hours, setHours] = useState(
    DAYS.map((d, i) => ({ day: d, open: i < 5, from: '09:00', to: '17:00' }))
  )

  return (
    <div className="adm-card p-0 overflow-hidden">
      {/* Store Info */}
      <div className="grid grid-cols-1 gap-6 border-b border-[var(--adm-border)] p-6 md:grid-cols-2">
        <div>
          <p className="text-[14px] font-medium text-[var(--adm-ink)]">Informasi Toko</p>
          <p className="mt-0.5 text-[13px] text-[var(--adm-muted)]">Perbarui informasi toko Anda.</p>
        </div>
        <div className="flex flex-col gap-3 text-[13px]">
          <div>
            <p className="text-[var(--adm-muted)]">Logo Toko</p>
            <div className="mt-2 flex items-center gap-3">
              <div
                className="flex size-12 items-center justify-center rounded-xl text-[18px] font-bold text-white"
                style={{ background: 'var(--adm-forest-500)' }}
              >
                D
              </div>
              <Pill>Update Logo</Pill>
            </div>
          </div>
          <div>
            <p className="text-[var(--adm-muted)]">Store ID</p>
            <p className="font-mono text-[var(--adm-ink)]">DMB-MOTO-001</p>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[var(--adm-muted)]">Nama Toko</p>
              <p className="text-[var(--adm-ink)]">DMB Moto Shop</p>
            </div>
            <Pill>Ubah</Pill>
          </div>
          <div>
            <p className="text-[var(--adm-muted)]">Jenis Bisnis</p>
            <p className="text-[var(--adm-ink)]">Toko Sparepart Motor</p>
          </div>
          <div>
            <p className="text-[var(--adm-muted)]">Kontak Utama</p>
            <div className="flex items-center gap-1.5 text-[var(--adm-ink)]">
              <Envelope size={13} />
              admin@dmb.com
            </div>
            <div className="mt-1 flex items-center gap-1.5 text-[var(--adm-ink)]">
              <Phone size={13} />
              081200000000
            </div>
          </div>
        </div>
      </div>

      {/* Store Status */}
      <div className="grid grid-cols-1 gap-6 border-b border-[var(--adm-border)] p-6 md:grid-cols-2">
        <div>
          <p className="text-[14px] font-medium text-[var(--adm-ink)]">Status Toko</p>
          <p className="mt-0.5 text-[13px] text-[var(--adm-muted)]">Buka, tutup sementara, atau tutup permanen toko Anda.</p>
        </div>
        <div className="flex flex-col gap-3">
          {[
            { val: 'open', label: 'Buka (Aktif)', desc: 'Toko aktif dan terlihat pelanggan.' },
            { val: 'temp', label: 'Tutup Sementara', desc: 'Sembunyikan produk dan nonaktifkan checkout.' },
            { val: 'perm', label: 'Tutup Permanen', desc: 'Toko ditutup secara permanen.' },
          ].map((opt) => (
            <div
              key={opt.val}
              className="flex items-start gap-3 rounded-xl border p-3 cursor-pointer transition-colors"
              style={{ borderColor: status === opt.val ? 'var(--adm-forest-500)' : 'var(--adm-border)' }}
              onClick={() => setStatus(opt.val)}
            >
              <Radio checked={status === opt.val} onChange={() => setStatus(opt.val)} />
              <div>
                <p className="text-[13px] font-medium text-[var(--adm-ink)]">{opt.label}</p>
                <p className="text-[12px] text-[var(--adm-muted)]">{opt.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Store Hours */}
      <div className="grid grid-cols-1 gap-6 p-6 md:grid-cols-2">
        <div>
          <p className="text-[14px] font-medium text-[var(--adm-ink)]">Jam Operasional</p>
          <p className="mt-0.5 text-[13px] text-[var(--adm-muted)]">Atur hari dan jam toko beroperasi.</p>
        </div>
        <div className="flex flex-col gap-2">
          {hours.map((h, i) => (
            <div key={h.day} className="grid grid-cols-[80px_1fr_1fr] items-center gap-3 text-[13px]">
              <div className="flex items-center gap-2">
                <Checkbox
                  checked={h.open}
                  onChange={(v) => setHours((prev) => prev.map((x, j) => j === i ? { ...x, open: v } : x))}
                />
                <span className={h.open ? 'text-[var(--adm-ink)]' : 'text-[var(--adm-muted)]'}>{h.day}</span>
              </div>
              <span className={h.open ? 'text-[var(--adm-ink)]' : 'text-[var(--adm-muted)]'}>
                {h.open ? 'Buka' : 'Tutup'}
              </span>
              <span className="text-[var(--adm-muted)]">{h.from} - {h.to}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ─── Tab: Payment ────────────────────────────────────────────────────────────

const TX = [
  { date: '2025-10-03', id: 'TXN-20251003-9811', method: 'Paypal', net: 'Rp 2.783.200', fee: 'Rp 55.000', status: 'Selesai' },
  { date: '2025-07-29', id: 'TXN-20250729-6621', method: 'Transfer Bank', net: 'Rp 240.100', fee: 'Rp 90.000', status: 'Diproses' },
  { date: '2025-07-15', id: 'TXN-20250715-7190', method: 'COD', net: 'Rp 582.000', fee: 'Rp 210.000', status: 'Gagal' },
]

const STATUS_STYLE = {
  Selesai: { bg: 'var(--adm-instock-bg)', color: 'var(--adm-instock-text)', border: 'var(--adm-instock-border)' },
  Diproses: { bg: 'var(--adm-lowstock-bg)', color: 'var(--adm-lowstock-text)', border: 'var(--adm-lowstock-border)' },
  Gagal: { bg: 'var(--adm-outstock-bg)', color: 'var(--adm-outstock-text)', border: 'var(--adm-outstock-border)' },
}

function PaymentTab() {
  const [emailOpt, setEmailOpt] = useState('existing')
  const [checked, setChecked] = useState([])

  const toggle = (id) => setChecked((p) => p.includes(id) ? p.filter((x) => x !== id) : [...p, id])
  const allChecked = checked.length === TX.length
  const toggleAll = () => setChecked(allChecked ? [] : TX.map((t) => t.id))

  return (
    <div className="flex flex-col gap-4">
      {/* Card Details */}
      <div className="adm-card p-0 overflow-hidden">
        <div className="grid grid-cols-1 gap-6 border-b border-[var(--adm-border)] p-6 md:grid-cols-2">
          <div>
            <p className="text-[14px] font-medium text-[var(--adm-ink)]">Detail Kartu</p>
            <p className="mt-0.5 text-[13px] text-[var(--adm-muted)]">Perbarui detail tagihan dan alamat Anda.</p>
            <button type="button" className="mt-4 flex items-center gap-1.5 text-[13px] font-medium text-[var(--adm-ink)]">
              <Plus size={14} weight="bold" />
              Tambah Kartu Lain
            </button>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: 'Nama di Kartu', value: 'Admin DMB', span: 2 },
              { label: 'Nomor Kartu', value: '•••• •••• •••• 0000', span: 2 },
              { label: 'Kedaluwarsa', value: '08/2029', span: 1 },
              { label: 'CVV', value: '••••', span: 1 },
            ].map((f) => (
              <div key={f.label} className={f.span === 2 ? 'col-span-2' : ''}>
                <p className="mb-1 text-[12px] text-[var(--adm-muted)]">{f.label}</p>
                <div className="rounded-xl border border-[var(--adm-border)] px-3 py-2 text-[13px] text-[var(--adm-ink)]">
                  {f.value}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Contact Email */}
        <div className="grid grid-cols-1 gap-6 border-b border-[var(--adm-border)] p-6 md:grid-cols-2">
          <div>
            <p className="text-[14px] font-medium text-[var(--adm-ink)]">Email Kontak</p>
            <p className="mt-0.5 text-[13px] text-[var(--adm-muted)]">Kemana notifikasi penarikan dikirim?</p>
          </div>
          <div className="flex flex-col gap-2">
            <Radio checked={emailOpt === 'existing'} onChange={() => setEmailOpt('existing')} label="Kirim ke email yang ada" />
            {emailOpt === 'existing' && (
              <p className="ml-6 text-[12px] text-[var(--adm-muted)]">admin@dmb.com</p>
            )}
            <Radio checked={emailOpt === 'other'} onChange={() => setEmailOpt('other')} label="Tambah email lain" />
          </div>
        </div>

        {/* Withdrawal History */}
        <div className="p-6">
          <p className="mb-1 text-[14px] font-medium text-[var(--adm-ink)]">Riwayat Penarikan</p>
          <p className="mb-4 text-[13px] text-[var(--adm-muted)]">Lihat riwayat transaksi.</p>
          <div className="overflow-x-auto">
            <table className="w-full text-[13px]">
              <thead>
                <tr className="border-b border-[var(--adm-border)]">
                  <th className="pb-2 pr-4 text-left">
                    <Checkbox checked={allChecked} onChange={toggleAll} />
                  </th>
                  {['Tanggal', 'ID Transaksi', 'Metode', 'Jumlah Bersih', 'Biaya', 'Status'].map((h) => (
                    <th key={h} className="pb-2 pr-4 text-left text-[12px] font-medium text-[var(--adm-muted)]">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {TX.map((t) => {
                  const s = STATUS_STYLE[t.status]
                  return (
                    <tr key={t.id} className="border-b border-[var(--adm-border)] last:border-0">
                      <td className="py-3 pr-4">
                        <Checkbox checked={checked.includes(t.id)} onChange={() => toggle(t.id)} />
                      </td>
                      <td className="py-3 pr-4 text-[var(--adm-ink)]">{t.date}</td>
                      <td className="py-3 pr-4 text-[var(--adm-muted)]">{t.id}</td>
                      <td className="py-3 pr-4 text-[var(--adm-ink)]">{t.method}</td>
                      <td className="py-3 pr-4 text-[var(--adm-ink)]">{t.net}</td>
                      <td className="py-3 pr-4 text-[var(--adm-muted)]">{t.fee}</td>
                      <td className="py-3">
                        <span
                          className="rounded-full border px-2.5 py-0.5 text-[11px] font-medium"
                          style={{ background: s.bg, color: s.color, borderColor: s.border }}
                        >
                          {t.status}
                        </span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Tab: Shipping ───────────────────────────────────────────────────────────

const SHIPPING_DATA = [
  {
    group: 'Pengiriman Reguler (Cashless)',
    desc: 'Layanan pengiriman 2-7 hari kerja, tergantung tujuan.',
    couriers: [
      {
        id: 'dhl', name: 'DHL Express', sub: 'COD tersedia, mencakup 32% rute pengiriman', enabled: true,
        detail: 'Min. berat: 1 kg\nMaks. berat: 50 kg\nMaks. dimensi: 35 x 20 x 25 cm\nItem terlarang: Produk berbahaya dan produk terlarang DHL Express\n\nBatas berat maks: 50.00 kg',
      },
      { id: 'lion', name: 'Lion Express', sub: 'COD tersedia, mencakup 32% rute pengiriman', enabled: true, detail: null },
      { id: 'ninja', name: 'Ninja Express', sub: 'COD tersedia, mencakup 18% rute pengiriman', enabled: false, detail: null },
    ],
  },
  {
    group: 'Same Day Delivery',
    desc: 'Layanan pengiriman 6-8 jam setelah paket diambil kurir.',
    couriers: [
      { id: 'jne-sd', name: 'JNE Same Day', sub: 'Tersedia di kota besar', enabled: true, detail: null },
    ],
  },
  {
    group: 'Next Day Delivery',
    desc: 'Layanan pengiriman satu hari setelah paket diambil kurir.',
    couriers: [
      { id: 'sicepat-nd', name: 'SiCepat BEST', sub: 'Garansi tiba besok', enabled: true, detail: null },
    ],
  },
]

function ShippingGroup({ group }) {
  const [collapsed, setCollapsed] = useState(false)
  const [couriers, setCouriers] = useState(group.couriers)
  const [expanded, setExpanded] = useState({})

  const toggleCourier = (id, val) =>
    setCouriers((p) => p.map((c) => c.id === id ? { ...c, enabled: val } : c))
  const toggleExpand = (id) =>
    setExpanded((p) => ({ ...p, [id]: !p[id] }))

  return (
    <div className="border-b border-[var(--adm-border)] last:border-0">
      <div className="flex items-start justify-between gap-4 px-6 py-4">
        <div>
          <p className="text-[14px] font-medium text-[var(--adm-ink)]">{group.group}</p>
          <p className="text-[13px] text-[var(--adm-muted)]">{group.desc}</p>
        </div>
        <button
          type="button"
          className="flex items-center gap-1.5 rounded-full border border-[var(--adm-border)] bg-white px-4 py-1.5 text-[13px] font-medium text-[var(--adm-ink)] hover:bg-[var(--adm-bg)]"
          onClick={() => setCollapsed((p) => !p)}
        >
          {collapsed ? 'Tampilkan' : 'Sembunyikan'}
          {collapsed ? <CaretDown size={14} /> : <CaretUp size={14} />}
        </button>
      </div>

      {!collapsed && (
        <div className="border-t border-[var(--adm-border)]">
          {couriers.map((c) => (
            <div key={c.id} className="border-b border-[var(--adm-border)] last:border-0">
              <div className="flex items-center justify-between gap-4 px-6 py-3">
                <div>
                  <p className="text-[13px] font-medium text-[var(--adm-ink)]">{c.name}</p>
                  <p className="text-[12px] text-[var(--adm-muted)]">{c.sub}</p>
                </div>
                <div className="flex items-center gap-3">
                  <Toggle enabled={c.enabled} onChange={(v) => toggleCourier(c.id, v)} />
                  <button type="button" onClick={() => c.detail && toggleExpand(c.id)}>
                    {expanded[c.id] ? <CaretUp size={16} className="text-[var(--adm-muted)]" /> : <CaretDown size={16} className="text-[var(--adm-muted)]" />}
                  </button>
                </div>
              </div>
              {expanded[c.id] && c.detail && (
                <div className="bg-[var(--adm-bg)] px-6 py-3">
                  {c.detail.split('\n').map((line, i) => (
                    <p key={i} className="text-[12px] text-[var(--adm-muted)]">{line || <br />}</p>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function ShippingTab() {
  return (
    <div className="adm-card p-0 overflow-hidden">
      {SHIPPING_DATA.map((g) => (
        <ShippingGroup key={g.group} group={g} />
      ))}
    </div>
  )
}

// ─── Tab: Notifications ──────────────────────────────────────────────────────

function NotificationsTab() {
  const [stockFreq, setStockFreq] = useState('Segera')
  const [newOrder, setNewOrder] = useState('Disarankan')
  const [sysUpdate, setSysUpdate] = useState(true)
  const [sysMaint, setSysMaint] = useState(true)
  const [channels, setChannels] = useState({
    custMsg: { email: false, push: false, sms: false },
    unusual: { email: true, push: false, sms: true },
  })

  const toggleChannel = (key, ch) =>
    setChannels((p) => ({ ...p, [key]: { ...p[key], [ch]: !p[key][ch] } }))

  return (
    <div className="adm-card p-0 overflow-hidden">
      {/* New Order */}
      <div className="flex items-start justify-between gap-4 border-b border-[var(--adm-border)] px-6 py-5">
        <div>
          <p className="text-[14px] font-medium text-[var(--adm-ink)]">Pesanan Baru</p>
          <p className="mt-0.5 text-[13px] text-[var(--adm-muted)]">Dapatkan notifikasi saat pesanan baru masuk.</p>
        </div>
        <button
          type="button"
          className="flex items-center gap-1.5 rounded-full border border-[var(--adm-border)] bg-white px-4 py-1.5 text-[13px] font-medium text-[var(--adm-ink)] hover:bg-[var(--adm-bg)]"
        >
          {newOrder}
          <CaretDown size={14} />
        </button>
      </div>

      {/* Low Stock */}
      <div className="flex items-start justify-between gap-4 border-b border-[var(--adm-border)] px-6 py-5">
        <div>
          <p className="text-[14px] font-medium text-[var(--adm-ink)]">Peringatan Stok Rendah</p>
          <p className="mt-0.5 text-[13px] text-[var(--adm-muted)]">Notifikasi saat stok mencapai batas minimum.</p>
        </div>
        <div className="flex items-center gap-1 rounded-full border border-[var(--adm-border)] bg-white p-1">
          {['Segera', 'Harian', 'Mingguan'].map((opt) => (
            <button
              key={opt}
              type="button"
              onClick={() => setStockFreq(opt)}
              className="rounded-full px-3 py-1 text-[12px] font-medium transition-colors"
              style={
                stockFreq === opt
                  ? { background: 'var(--adm-forest-500)', color: '#fff' }
                  : { color: 'var(--adm-ink)' }
              }
            >
              {opt}
            </button>
          ))}
        </div>
      </div>

      {/* Customer Message */}
      <div className="flex items-start justify-between gap-4 border-b border-[var(--adm-border)] px-6 py-5">
        <div>
          <p className="text-[14px] font-medium text-[var(--adm-ink)]">Pesan Pelanggan</p>
          <p className="mt-0.5 text-[13px] text-[var(--adm-muted)]">Notifikasi saat pelanggan mengirim pesan baru.</p>
        </div>
        <div className="flex items-center gap-4">
          {['email', 'push', 'sms'].map((ch) => (
            <div key={ch} className="flex items-center gap-1.5">
              <Toggle enabled={channels.custMsg[ch]} onChange={() => toggleChannel('custMsg', ch)} />
              <span className="text-[12px] text-[var(--adm-muted)]">
                {ch === 'email' ? 'Email' : ch === 'push' ? 'Push' : 'SMS/WA'}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Unusual Login */}
      <div className="flex items-start justify-between gap-4 border-b border-[var(--adm-border)] px-6 py-5">
        <div>
          <p className="text-[14px] font-medium text-[var(--adm-ink)]">Login Tidak Biasa</p>
          <p className="mt-0.5 text-[13px] text-[var(--adm-muted)]">Notifikasi jika ada upaya login mencurigakan.</p>
        </div>
        <div className="flex items-center gap-4">
          {['email', 'push', 'sms'].map((ch) => (
            <div key={ch} className="flex items-center gap-1.5">
              <Checkbox
                checked={channels.unusual[ch]}
                onChange={() => toggleChannel('unusual', ch)}
              />
              <span className="text-[12px] text-[var(--adm-muted)]">
                {ch === 'email' ? 'Email' : ch === 'push' ? 'Push' : 'SMS/WA'}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* System Update */}
      <SectionRow label="Pembaruan Sistem" desc="Dapatkan pengumuman penting atau peringatan pemeliharaan.">
        <Toggle enabled={sysUpdate} onChange={setSysUpdate} />
      </SectionRow>

      {/* System Maintenance */}
      <div className="flex items-start justify-between gap-4 px-6 py-5">
        <div>
          <p className="text-[14px] font-medium text-[var(--adm-ink)]">Pemeliharaan Sistem</p>
          <p className="mt-0.5 text-[13px] text-[var(--adm-muted)]">Notifikasi sebelum pemeliharaan terjadwal.</p>
        </div>
        <Toggle enabled={sysMaint} onChange={setSysMaint} />
      </div>
    </div>
  )
}

// ─── Tab: Others ─────────────────────────────────────────────────────────────

function OthersTab() {
  const [autoTz, setAutoTz] = useState(true)
  const [dateFormat, setDateFormat] = useState('DD MMM YYYY')
  const [lang, setLang] = useState('en-GB')
  const [vacation, setVacation] = useState(false)

  return (
    <div className="adm-card p-0 overflow-hidden">
      {/* Timezone */}
      <SectionRow label="Zona Waktu Otomatis" desc="Deteksi dan atur zona waktu toko otomatis berdasarkan lokasi.">
        <span className="text-[13px] text-[var(--adm-muted)]">GMT +07:00</span>
        <Toggle enabled={autoTz} onChange={setAutoTz} />
      </SectionRow>

      {/* Date Format */}
      <SectionRow label="Format Tanggal" desc="Pilih cara tanggal ditampilkan di seluruh toko dan laporan.">
        <button
          type="button"
          className="flex items-center gap-1.5 rounded-full border border-[var(--adm-border)] bg-white px-4 py-1.5 text-[13px] font-medium text-[var(--adm-ink)] hover:bg-[var(--adm-bg)]"
        >
          {dateFormat}
          <CaretDown size={14} />
        </button>
      </SectionRow>

      {/* Language */}
      <div className="border-b border-[var(--adm-border)] px-6 py-5">
        <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
          <div>
            <p className="text-[14px] font-medium text-[var(--adm-ink)]">Bahasa Platform</p>
            <p className="mt-0.5 text-[13px] text-[var(--adm-muted)]">Dapatkan notifikasi saat pesanan baru masuk.</p>
          </div>
          <div className="flex flex-col gap-2">
            {[
              { val: 'en-GB', label: 'English (United Kingdom)' },
              { val: 'en-US', label: 'English (United States)' },
              { val: 'id', label: 'Bahasa Indonesia' },
            ].map((l) => (
              <Radio key={l.val} checked={lang === l.val} onChange={() => setLang(l.val)} label={l.label} />
            ))}
            <button type="button" className="mt-1 flex items-center gap-1.5 rounded-full border border-[var(--adm-border)] bg-white px-4 py-1.5 text-[13px] font-medium text-[var(--adm-ink)] hover:bg-[var(--adm-bg)]">
              <Plus size={14} weight="bold" />
              Tambah Bahasa
            </button>
          </div>
        </div>
      </div>

      {/* Vacation Mode */}
      <div className="px-6 py-5">
        <SectionRow label="Mode Liburan" desc="Aktifkan untuk mencegah pembeli memesan.">
          <Toggle enabled={vacation} onChange={setVacation} />
        </SectionRow>
        {!vacation && (
          <div
            className="mt-2 flex items-start justify-between gap-4 rounded-xl px-4 py-3"
            style={{ background: 'var(--adm-bg)' }}
          >
            <div className="flex items-start gap-2 text-[13px] text-[var(--adm-muted)]">
              <span className="mt-0.5 shrink-0">ⓘ</span>
              <span>Auto-reply Chat — Mode Liburan membutuhkan pengaturan auto-reply. Toko Anda belum menyiapkannya.</span>
            </div>
            <button type="button" className="shrink-0 text-[13px] font-semibold" style={{ color: 'var(--adm-info)' }}>
              Atur Sekarang
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Main Page ───────────────────────────────────────────────────────────────

const TABS = [
  { id: 'profile', label: 'Profil & Akun' },
  { id: 'security', label: 'Keamanan' },
  { id: 'store', label: 'Pengaturan Toko' },
  { id: 'payment', label: 'Pembayaran' },
  { id: 'shipping', label: 'Pengiriman' },
  { id: 'notifications', label: 'Notifikasi' },
  { id: 'others', label: 'Lainnya' },
]

export default function SettingsPage() {
  const { currentUser } = useAuth()
  const [activeTab, setActiveTab] = useState('profile')

  return (
    <div className="mx-auto max-w-[1200px] p-6 lg:p-8">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-medium text-[var(--adm-ink)]">Pengaturan</h1>
        <p className="mt-1 text-sm text-[var(--adm-muted)]">
          Kustomisasi, konfigurasi, dan optimalkan dashboard Anda.
        </p>
      </div>

      {/* Tab bar */}
      <div className="mb-6 flex items-center gap-1 overflow-x-auto rounded-full border border-[var(--adm-border)] bg-white p-1 w-fit max-w-full">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setActiveTab(t.id)}
            className="whitespace-nowrap rounded-full px-4 py-1.5 text-[13px] font-medium transition-colors"
            style={
              activeTab === t.id
                ? { background: 'var(--adm-forest-500)', color: '#fff' }
                : { color: 'var(--adm-text)' }
            }
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Content */}
      {activeTab === 'profile' && <ProfileTab user={currentUser} />}
      {activeTab === 'security' && <SecurityTab />}
      {activeTab === 'store' && <StoreTab />}
      {activeTab === 'payment' && <PaymentTab />}
      {activeTab === 'shipping' && <ShippingTab />}
      {activeTab === 'notifications' && <NotificationsTab />}
      {activeTab === 'others' && <OthersTab />}
    </div>
  )
}
