import { Link, useNavigate } from 'react-router-dom'
import { useCart } from '../../context/CartContext'
import { useAuth } from '../../context/AuthContext'
import { useCategories, useProducts } from '../../store/hooks'
import searchIcon from '../../assets/nav/search-icon.svg'
import cartIcon from '../../assets/nav/cart-icon.svg'
import logo from '../../assets/logo-dmb.png'

export default function Nav() {
  const { itemCount } = useCart()
  const { isLoggedIn, logout } = useAuth()
  const categories = useCategories()
  const products = useProducts()
  const navigate = useNavigate()

  const categoryPreviews = categories.map((c) => ({
    ...c,
    image: products.find((p) => p.category === c.id && p.published)?.images?.[0],
    count: products.filter((p) => p.category === c.id && p.published).length,
  }))

  return (
    <header className="relative z-40 flex items-center justify-between border-b border-neutral-100 bg-neutral-0 px-4 py-4 lg:px-16">
      <Link to="/" aria-label="DMB Moto Shop — Beranda" className="flex items-center">
        <img src={logo} alt="DMB Moto Shop" className="h-14 w-auto lg:h-16" />
      </Link>

      <nav className="hidden items-center gap-6 text-xs font-medium uppercase tracking-[0.24px] text-neutral-900 lg:flex">
        <Link to="/">Home</Link>

        {/* Cari Produk — hover megamenu */}
        <div className="group relative">
          <Link to="/search" className="flex items-center gap-1">
            Cari Produk
            <ChevronDown className="transition-transform duration-200 group-hover:rotate-180" />
          </Link>
          <div className="pointer-events-none invisible absolute left-1/2 top-full z-50 -translate-x-1/2 pt-4 opacity-0 transition-opacity duration-200 group-hover:pointer-events-auto group-hover:visible group-hover:opacity-100">
            <div className="w-[36rem] rounded-2xl border border-neutral-100 bg-neutral-0 p-3 shadow-xl">
              <div className="grid grid-cols-2 gap-1">
                {categoryPreviews.map((c) => (
                  <Link
                    key={c.id}
                    to={`/search?category=${c.id}`}
                    className="flex items-center gap-3 rounded-xl p-2 transition-colors hover:bg-neutral-50"
                  >
                    <span className="flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-neutral-100">
                      {c.image ? (
                        <img src={c.image} alt="" className="size-full object-cover" />
                      ) : (
                        <span className="text-xs text-neutral-400">—</span>
                      )}
                    </span>
                    <span className="flex flex-col">
                      <span className="text-sm font-medium normal-case tracking-normal text-neutral-900">{c.name}</span>
                      <span className="text-xs normal-case tracking-normal text-neutral-500">{c.count} produk</span>
                    </span>
                  </Link>
                ))}
              </div>
              <Link
                to="/search"
                className="mt-1 flex items-center justify-between rounded-xl bg-neutral-900 px-4 py-2.5 text-sm font-medium normal-case tracking-normal text-neutral-0 transition-colors hover:bg-neutral-800"
              >
                Lihat semua produk
                <span aria-hidden="true">→</span>
              </Link>
            </div>
          </div>
        </div>

        <Link to="/lacak">Lacak Pesanan</Link>
      </nav>

      <div className="flex items-center gap-4">
        <Link to="/search" aria-label="Cari" className="flex size-5 items-center justify-center">
          <img src={searchIcon} alt="" className="size-full" />
        </Link>
        <Link to="/cart" aria-label="Keranjang" className="relative flex size-5 items-center justify-center">
          <img src={cartIcon} alt="" className="size-full" />
          {itemCount > 0 && (
            <span className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-secondary-600 text-xs font-semibold text-neutral-900">
              {itemCount}
            </span>
          )}
        </Link>
        {isLoggedIn ? (
          <>
            <Link to="/akun" className="text-sm text-neutral-600">
              Akun
            </Link>
            <button
              onClick={() => {
                logout()
                navigate('/login')
              }}
              className="text-sm text-neutral-600"
            >
              Logout
            </button>
          </>
        ) : (
          <Link to="/login" className="text-sm text-neutral-600">
            Login
          </Link>
        )}
      </div>
    </header>
  )
}

function ChevronDown({ className = '' }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={`size-3.5 ${className}`} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M6 9l6 6 6-6" />
    </svg>
  )
}
