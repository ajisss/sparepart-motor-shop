import logo from '../../assets/logo-dmb.png'

const FOOTER_COLUMNS = [
  {
    title: 'Produk',
    links: ['Semua Produk', 'Mesin & Pengereman', 'Kelistrikan', 'Bodi & Aksesoris'],
  },
  {
    title: 'Tipe Motor',
    links: ['Matic', 'Sport', 'Bebek', 'Trail'],
  },
  {
    title: 'Layanan',
    links: ['Lacak Pesanan', 'Cara Belanja', 'Grosir & Reseller'],
  },
  {
    title: 'Perusahaan',
    links: ['Tentang DMB', 'Karir', 'Hubungi Kami'],
  },
]

function InstagramIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="size-4" strokeLinecap="round" aria-hidden="true">
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="0.6" fill="currentColor" />
    </svg>
  )
}
function TiktokIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="size-4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M14 4v9.5a3.5 3.5 0 11-3-3.46" />
      <path d="M14 4c.4 2.2 1.9 3.7 4 4" />
    </svg>
  )
}
function YoutubeIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="size-4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="3" y="6" width="18" height="12" rx="3" />
      <path d="M11 9.5l4 2.5-4 2.5z" fill="currentColor" />
    </svg>
  )
}
function WhatsappIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="size-4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M4 20l1.3-3.8A7 7 0 1120 12a7 7 0 01-11 5.7L4 20z" />
      <path d="M9 9.5c0 3 2.5 5.5 5.5 5.5.5 0 .9-.4.9-.9v-1l-1.7-.6-.7.7a4 4 0 01-2-2l.7-.7-.6-1.7h-1c-.5 0-.9.4-.9.9z" fill="currentColor" stroke="none" />
    </svg>
  )
}

const SOCIALS = [InstagramIcon, TiktokIcon, YoutubeIcon, WhatsappIcon]

export default function Footer() {
  return (
    <footer className="bg-neutral-900 text-neutral-0">
      <div className="mx-auto max-w-7xl px-4 py-14 lg:px-16 lg:py-16">
        {/* Top: logo + socials */}
        <div className="flex flex-col items-start justify-between gap-8 border-b border-neutral-0/10 pb-10 sm:flex-row sm:items-center">
          <img src={logo} alt="DMB Moto Shop" className="h-12 w-auto" />
          <div className="flex items-center gap-3">
            <span className="text-sm text-neutral-400">Ikuti kami</span>
            {SOCIALS.map((Icon, i) => (
              <a
                key={i}
                href="#"
                aria-label="Media sosial DMB"
                className="flex size-9 items-center justify-center rounded-full bg-secondary-600 text-neutral-900 transition-colors hover:bg-secondary-700"
              >
                <Icon />
              </a>
            ))}
          </div>
        </div>

        {/* Link columns */}
        <div className="grid grid-cols-2 gap-x-8 gap-y-10 py-12 lg:grid-cols-4">
          {FOOTER_COLUMNS.map((column) => (
            <div key={column.title} className="flex flex-col gap-4">
              <p className="text-sm font-semibold text-neutral-0">{column.title}</p>
              <ul className="flex flex-col gap-2.5 text-sm text-neutral-400">
                {column.links.map((link) => (
                  <li key={link}>
                    <a href="#" className="transition-colors hover:text-secondary-600">
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom legal row */}
        <div className="flex flex-col gap-3 border-t border-neutral-0/10 pt-8 text-sm text-neutral-400 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap gap-x-6 gap-y-2">
            <a href="#" className="transition-colors hover:text-neutral-0">Ketentuan Layanan</a>
            <a href="#" className="transition-colors hover:text-neutral-0">Kebijakan Privasi</a>
            <a href="#" className="transition-colors hover:text-neutral-0">Kredit</a>
          </div>
          <p>© {new Date().getFullYear()} DMB Moto Shop — Prototipe demo.</p>
        </div>
      </div>
    </footer>
  )
}
