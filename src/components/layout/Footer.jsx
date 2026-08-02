const FOOTER_COLUMNS = [
  {
    title: 'Belanja',
    links: ['Semua Produk', 'Mesin', 'Kelistrikan', 'Bodi & Aksesoris'],
  },
  {
    title: 'Kategori Motor',
    links: ['Matic', 'Sport', 'Bebek', 'Trail'],
  },
  {
    title: 'Brand',
    links: ['Semua Brand', 'Brand Pilihan', 'Brand Baru'],
  },
  {
    title: 'Tentang Kami',
    links: ['Cerita Kami', 'Karir', 'Hubungi Kami'],
  },
]

export default function Footer() {
  return (
    <footer className="mt-16 bg-neutral-25 border-t border-neutral-100">
      <div className="flex flex-col items-center gap-6 px-4 py-12 text-center">
        <p className="max-w-md text-2xl font-medium leading-tight tracking-tight text-neutral-900">
          Sparepart motor original, tanpa ribet
        </p>
        <form
          className="flex w-full max-w-sm items-center justify-between border-b border-neutral-200 pb-3"
          onSubmit={(e) => e.preventDefault()}
        >
          <input
            type="email"
            placeholder="Berlangganan lewat email"
            className="w-full bg-transparent text-sm text-neutral-800 placeholder:text-neutral-800 focus:outline-none"
          />
          <span aria-hidden="true" className="text-neutral-900">
            →
          </span>
        </form>
      </div>

      <div className="grid grid-cols-2 gap-x-8 gap-y-8 px-4 pb-10 lg:grid-cols-4 lg:px-16">
        {FOOTER_COLUMNS.map((column) => (
          <div key={column.title} className="flex flex-col gap-3">
            <p className="text-xs font-medium uppercase tracking-[0.18px] text-neutral-600">
              {column.title}
            </p>
            <ul className="flex flex-col gap-1.5 text-sm text-neutral-900">
              {column.links.map((link) => (
                <li key={link}>
                  <a href="#" className="hover:text-primary-600">
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="border-t border-neutral-100 px-4 py-6 text-center text-sm text-neutral-600 lg:px-16">
        © {new Date().getFullYear()} MotoPart. Prototype for demo purposes only.
      </div>
    </footer>
  )
}
