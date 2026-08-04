import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  MagnifyingGlass,
  Rocket,
  UserCircle,
  Wrench,
  Headset,
  CaretDown,
  CaretUp,
} from '@phosphor-icons/react'

const CATEGORIES = [
  {
    id: 'getting-started',
    icon: Rocket,
    title: 'Mulai Gunakan',
    desc: 'Pelajari dasar-dasar pengaturan toko, navigasi dashboard, dan konfigurasi awal.',
    slug: 'memulai-penggunaan',
  },
  {
    id: 'account',
    icon: UserCircle,
    title: 'Akun',
    desc: 'Kelola akun, profil, dan informasi toko kamu dengan mudah.',
    slug: 'akun',
  },
  {
    id: 'troubleshooting',
    icon: Wrench,
    title: 'Troubleshooting',
    desc: 'Atasi masalah umum dan perbaiki error teknis dengan panduan langkah demi langkah.',
    slug: 'troubleshooting',
  },
]

const FAQS = [
  {
    q: 'Bagaimana cara mengatur stok produk?',
    a: 'Buka halaman Produk, klik produk yang ingin diubah, lalu edit kolom Stok di form edit produk. Simpan perubahan dan stok akan langsung terupdate di sistem.',
  },
  {
    q: 'Bagaimana cara memproses pesanan yang masuk?',
    a: 'Buka halaman Pesanan, pilih pesanan dengan status "Menunggu pembayaran" atau "Sedang diproses", lalu ubah statusnya sesuai kondisi. Pelanggan akan mendapat notifikasi otomatis.',
  },
  {
    q: 'Bagaimana cara menambah produk baru?',
    a: 'Di halaman Produk, klik tombol "Tambah Produk" di kanan atas. Isi nama, kategori, harga, stok, dan upload foto produk. Klik Simpan untuk mempublikasikan.',
  },
  {
    q: 'Apa yang harus dilakukan jika ada pesanan yang dibatalkan?',
    a: 'Pesanan yang dibatalkan akan masuk ke status "Refund diproses". Proses refund ke pelanggan secara manual melalui metode pembayaran yang digunakan, lalu update status pesanan.',
  },
  {
    q: 'Bagaimana cara melihat laporan penjualan?',
    a: 'Dashboard utama menampilkan ringkasan penjualan harian dan mingguan. Untuk laporan lebih detail, gunakan filter di halaman Pesanan berdasarkan tanggal dan status.',
  },
]

function FAQItem({ q, a }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="border-b border-[var(--adm-border)]">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between gap-4 py-4 text-left"
      >
        <span className="text-[15px] font-medium text-black">{q}</span>
        {open
          ? <CaretUp size={18} className="shrink-0 text-[var(--adm-muted)]" />
          : <CaretDown size={18} className="shrink-0 text-[var(--adm-muted)]" />
        }
      </button>
      {open && (
        <p className="pb-4 text-[14px] leading-relaxed text-[var(--adm-muted)]">{a}</p>
      )}
    </div>
  )
}

export default function HelpPage() {
  const [query, setQuery] = useState('')

  return (
    <div className="mx-auto max-w-[1100px] p-6 lg:p-8">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-[28px] font-semibold text-black">Pusat Bantuan</h1>
          <p className="mt-1 text-[14px] text-[var(--adm-muted)]">
            Temukan jawaban cepat, tutorial, dan panduan lengkap untuk semua kebutuhan kamu.
          </p>
        </div>
        <a
          href="mailto:support@dmb.com"
          className="flex shrink-0 items-center gap-2 rounded-full bg-[var(--adm-mint)] px-4 py-2.5 text-[14px] font-medium text-black hover:brightness-95"
        >
          <Headset size={18} />
          Customer Support
        </a>
      </div>

      {/* Hero */}
      <div className="adm-card mt-6 flex flex-col items-center px-6 py-12 text-center">
        <div className="flex size-14 items-center justify-center rounded-2xl bg-black">
          <span className="text-2xl font-bold text-[var(--adm-mint)]">D</span>
        </div>
        <p className="mt-3 text-[18px] font-semibold text-black">DMB Moto Shop</p>
        <p className="mt-2 max-w-[460px] text-[15px] leading-relaxed text-[var(--adm-muted)]">
          Temukan jawaban cepat, tutorial, dan sumber dukungan<br />— ditenagai bantuan AI.
        </p>
        <div className="mt-6 flex w-full max-w-[480px] items-center gap-2 rounded-full border border-[var(--adm-border)] bg-[var(--adm-bg)] px-4 py-3">
          <MagnifyingGlass size={18} className="shrink-0 text-[var(--adm-muted)]" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Cari bantuan atau tanya asisten AI..."
            className="flex-1 bg-transparent text-[14px] text-black placeholder:text-[var(--adm-muted)] outline-none"
          />
        </div>
      </div>

      {/* Category cards */}
      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        {CATEGORIES.map(({ id, icon: Icon, title, desc, slug }) => (
          <div key={id} className="adm-card flex flex-col gap-4 p-5">
            <span className="flex size-11 items-center justify-center rounded-xl bg-[var(--adm-bg)]">
              <Icon size={22} weight="duotone" className="text-black" />
            </span>
            <div>
              <p className="text-[15px] font-semibold text-black">{title}</p>
              <p className="mt-1 text-[13px] leading-relaxed text-[var(--adm-muted)]">{desc}</p>
            </div>
            <Link
              to={`/admin/help/${slug}`}
              className="mt-auto text-[13px] font-medium text-black hover:underline"
            >
              Pelajari Lebih Lanjut
            </Link>
          </div>
        ))}
      </div>

      {/* FAQ */}
      <div className="mt-10">
        <h2 className="text-[20px] font-semibold text-black">Pertanyaan yang Sering Diajukan</h2>
        <div className="adm-card mt-4 divide-y-0 px-6">
          {FAQS.map((f) => (
            <FAQItem key={f.q} q={f.q} a={f.a} />
          ))}
        </div>
      </div>
    </div>
  )
}
