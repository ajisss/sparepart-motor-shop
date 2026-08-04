import { useState, useEffect, useRef } from 'react'
import { Link, useParams } from 'react-router-dom'
import { CaretRight } from '@phosphor-icons/react'

const ARTICLES = {
  'memulai-penggunaan': {
    category: 'Mulai Gunakan',
    categorySlug: null,
    title: 'Cara Memulai Penggunaan Dashboard',
    sections: [
      {
        id: 'langkah-pertama',
        title: 'Langkah Pertama',
        content: (
          <>
            <p>Selamat datang di DMB Admin Dashboard! Panduan ini akan membantu kamu memahami cara kerja dashboard dan memaksimalkan pengelolaan toko sparepart motor kamu.</p>
            <p className="mt-3">Setelah login, kamu akan langsung diarahkan ke halaman Dashboard utama yang menampilkan ringkasan penjualan, pesanan terbaru, dan status stok produk.</p>
          </>
        ),
      },
      {
        id: 'navigasi-dashboard',
        title: 'Navigasi Dashboard',
        content: (
          <>
            <p>Sidebar di sebelah kiri berisi semua menu utama:</p>
            <ul className="mt-3 flex flex-col gap-2 pl-5">
              <li className="list-disc text-[14px] text-[var(--adm-muted)]"><span className="font-medium text-black">Dashboard</span> — Ringkasan metrik toko, grafik penjualan, dan insight stok.</li>
              <li className="list-disc text-[14px] text-[var(--adm-muted)]"><span className="font-medium text-black">Pesanan</span> — Daftar semua pesanan yang masuk beserta statusnya.</li>
              <li className="list-disc text-[14px] text-[var(--adm-muted)]"><span className="font-medium text-black">Produk</span> — Kelola katalog produk, stok, dan harga.</li>
              <li className="list-disc text-[14px] text-[var(--adm-muted)]"><span className="font-medium text-black">Chat</span> — Pesan dari pelanggan yang perlu direspons.</li>
            </ul>
          </>
        ),
      },
      {
        id: 'pengaturan-toko',
        title: 'Pengaturan Toko',
        content: (
          <>
            <p>Sebelum mulai berjualan, pastikan kamu mengisi informasi toko di menu <strong>Pengaturan</strong>. Informasi ini akan tampil di halaman toko yang dilihat pelanggan.</p>
            <div className="mt-4 rounded-2xl bg-[var(--adm-bg)] px-5 py-4">
              <p className="text-[13px] font-medium text-black">Tip:</p>
              <p className="mt-1 text-[13px] text-[var(--adm-muted)]">Pastikan foto produk beresolusi tinggi dan deskripsi produk lengkap untuk meningkatkan kepercayaan pelanggan.</p>
            </div>
          </>
        ),
      },
      {
        id: 'tambah-produk-pertama',
        title: 'Tambah Produk Pertama',
        content: (
          <>
            <p>Untuk menambah produk pertama kamu:</p>
            <ol className="mt-3 flex flex-col gap-2 pl-5">
              <li className="list-decimal text-[14px] text-[var(--adm-muted)]">Buka halaman <strong>Produk</strong> dari sidebar</li>
              <li className="list-decimal text-[14px] text-[var(--adm-muted)]">Klik tombol <strong>Tambah Produk</strong> di pojok kanan atas</li>
              <li className="list-decimal text-[14px] text-[var(--adm-muted)]">Isi nama, kategori, SKU, harga, dan stok</li>
              <li className="list-decimal text-[14px] text-[var(--adm-muted)]">Upload foto produk (disarankan ukuran 600×600px)</li>
              <li className="list-decimal text-[14px] text-[var(--adm-muted)]">Klik <strong>Simpan</strong></li>
            </ol>
          </>
        ),
      },
      {
        id: 'masuk-lagi',
        title: 'Masuk Lagi',
        content: (
          <p>Untuk masuk ke dashboard, buka <code className="rounded bg-[var(--adm-bg)] px-1.5 py-0.5 text-[13px]">/admin/login</code> dan gunakan akun pengelola toko kamu. Centang "Ingat saya" agar tidak perlu login ulang setiap saat.</p>
        ),
      },
    ],
  },
  'akun': {
    category: 'Akun',
    categorySlug: null,
    title: 'Lupa Password',
    sections: [
      {
        id: 'langkah-pertama',
        title: 'Langkah pertama',
        content: (
          <p>Jika kamu lupa password atau ingin menggantinya demi keamanan, ikuti langkah-langkah berikut untuk mereset dengan aman.</p>
        ),
      },
      {
        id: 'buka-halaman-login',
        title: 'Buka Halaman Login',
        content: (
          <>
            <p>Buka halaman login admin di <code className="rounded bg-[var(--adm-bg)] px-1.5 py-0.5 text-[13px]">/admin/login</code>. Di bawah kolom password, klik <strong>"Lupa password?"</strong> untuk memulai proses reset.</p>
            <div className="mt-4 rounded-2xl border border-[var(--adm-border)] bg-[var(--adm-bg)] p-4 text-center text-[13px] text-[var(--adm-muted)]">
              [Tampilan halaman login]
            </div>
          </>
        ),
      },
      {
        id: 'masukkan-email',
        title: 'Masukkan Email Terdaftar',
        content: (
          <>
            <p>Kamu akan diminta memasukkan alamat email yang terdaftar di akun. Setelah submit, link reset akan dikirim ke email tersebut.</p>
            <div className="mt-4 rounded-2xl bg-[var(--adm-bg)] px-5 py-4">
              <p className="text-[13px] font-medium text-black">Tip:</p>
              <p className="mt-1 text-[13px] text-[var(--adm-muted)]">Jika tidak menemukan email, cek folder Spam atau Promosi.</p>
            </div>
          </>
        ),
      },
      {
        id: 'buat-password-baru',
        title: 'Buat Password Baru',
        content: (
          <>
            <p>Masukkan password baru dua kali untuk konfirmasi. Pastikan minimal 8 karakter dan mengandung huruf, angka, dan simbol.</p>
            <div className="mt-4 rounded-2xl bg-[var(--adm-bg)] px-5 py-4">
              <p className="text-[13px] font-medium text-black">Tip:</p>
              <p className="mt-1 text-[13px] text-[var(--adm-muted)]">Password baru harus berbeda dari password sebelumnya.</p>
            </div>
          </>
        ),
      },
      {
        id: 'masuk-lagi',
        title: 'Masuk Lagi',
        content: (
          <p>Setelah berhasil mengubah password, kembali ke halaman login dan masuk dengan kredensial baru kamu.</p>
        ),
      },
    ],
  },
  'troubleshooting': {
    category: 'Troubleshooting',
    categorySlug: null,
    title: 'Mengatasi Masalah Umum',
    sections: [
      {
        id: 'data-tidak-muncul',
        title: 'Data tidak muncul',
        content: (
          <p>Jika data produk atau pesanan tidak muncul, coba refresh halaman. Jika masih kosong, buka DevTools (F12) → Application → Local Storage, hapus key <code className="rounded bg-[var(--adm-bg)] px-1.5 py-0.5 text-[13px]">dmb:data</code>, lalu refresh kembali.</p>
        ),
      },
      {
        id: 'login-gagal',
        title: 'Login gagal',
        content: (
          <p>Pastikan menggunakan akun dengan role <strong>admin</strong> atau <strong>owner</strong>. Akun pelanggan biasa tidak bisa masuk ke dashboard admin. Credential default: <code className="rounded bg-[var(--adm-bg)] px-1.5 py-0.5 text-[13px]">admin@dmb.com</code>.</p>
        ),
      },
      {
        id: 'foto-tidak-tampil',
        title: 'Foto produk tidak tampil',
        content: (
          <p>Foto produk diambil dari CDN Pexels. Pastikan koneksi internet aktif. Jika foto tetap tidak muncul, kemungkinan URL foto sudah tidak valid — upload ulang foto dari halaman edit produk.</p>
        ),
      },
      {
        id: 'performa-lambat',
        title: 'Dashboard terasa lambat',
        content: (
          <p>Dashboard menyimpan semua data di localStorage browser. Jika data terlalu banyak, performa bisa menurun. Coba gunakan browser yang lebih baru atau clear cache browser.</p>
        ),
      },
    ],
  },
}

export default function HelpArticlePage() {
  const { slug } = useParams()
  const article = ARTICLES[slug] || ARTICLES['memulai-penggunaan']
  const [activeId, setActiveId] = useState(article.sections[0]?.id || '')
  const sectionRefs = useRef({})

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id)
            break
          }
        }
      },
      { rootMargin: '-20% 0px -70% 0px' }
    )
    Object.values(sectionRefs.current).forEach((el) => {
      if (el) observer.observe(el)
    })
    return () => observer.disconnect()
  }, [slug])

  return (
    <div className="mx-auto max-w-[1100px] p-6 lg:p-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-[13px] text-[var(--adm-muted)]">
        <Link to="/admin/help" className="hover:text-black">Pusat Bantuan</Link>
        <CaretRight size={13} />
        <span className="text-[var(--adm-mint)] font-medium" style={{ color: 'var(--adm-forest-500)' }}>
          {article.category}
        </span>
        <CaretRight size={13} />
        <span className="text-black">{article.title}</span>
      </nav>

      <div className="mt-6 flex gap-8">
        {/* Main content */}
        <div className="min-w-0 flex-1">
          <h1 className="text-[26px] font-semibold text-black">{article.title}</h1>

          <div className="mt-6 flex flex-col gap-10">
            {article.sections.map(({ id, title, content }, i) => (
              <section
                key={id}
                id={id}
                ref={(el) => { sectionRefs.current[id] = el }}
              >
                <h2 className="text-[18px] font-semibold text-black">
                  Langkah {i + 1}: {title}
                </h2>
                <div className="mt-3 text-[14px] leading-relaxed text-[var(--adm-muted)]">
                  {content}
                </div>
              </section>
            ))}
          </div>

          {/* Security tips box */}
          <div className="adm-card mt-10 p-5">
            <p className="text-[14px] font-semibold text-black">Tips Keamanan</p>
            <ul className="mt-3 flex flex-col gap-1.5 pl-5">
              <li className="list-decimal text-[13px] text-[var(--adm-muted)]">Jangan share password admin ke siapapun yang tidak berwenang.</li>
              <li className="list-decimal text-[13px] text-[var(--adm-muted)]">Gunakan password yang berbeda untuk setiap akun.</li>
              <li className="list-decimal text-[13px] text-[var(--adm-muted)]">Ganti password secara berkala setiap beberapa bulan sekali.</li>
            </ul>
          </div>
        </div>

        {/* TOC Sidebar */}
        <aside className="hidden w-[200px] shrink-0 lg:block">
          <div className="sticky top-6">
            <p className="text-[12px] font-semibold uppercase tracking-wider text-[var(--adm-muted)]">
              Di halaman ini
            </p>
            <nav className="mt-3 flex flex-col gap-1">
              {article.sections.map(({ id, title }) => (
                <a
                  key={id}
                  href={`#${id}`}
                  onClick={(e) => {
                    e.preventDefault()
                    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
                    setActiveId(id)
                  }}
                  className={`block rounded-lg px-3 py-1.5 text-[13px] transition-colors ${
                    activeId === id
                      ? 'bg-[var(--adm-bg)] font-medium text-black'
                      : 'text-[var(--adm-muted)] hover:text-black'
                  }`}
                  style={activeId === id ? { borderLeft: '2px solid var(--adm-forest-500)', borderRadius: '0 8px 8px 0' } : {}}
                >
                  {title}
                </a>
              ))}
            </nav>
          </div>
        </aside>
      </div>
    </div>
  )
}
