import { Link, useNavigate } from 'react-router-dom'
import { useCart } from '../../context/CartContext'
import { useAuth } from '../../context/AuthContext'
import searchIcon from '../../assets/nav/search-icon.svg'
import cartIcon from '../../assets/nav/cart-icon.svg'
import logo from '../../assets/logo-dmb.png'

export default function Nav() {
  const { itemCount } = useCart()
  const { isLoggedIn, logout } = useAuth()
  const navigate = useNavigate()

  return (
    <header className="flex items-center justify-between px-4 lg:px-16 py-4 border-b border-neutral-100 bg-neutral-0">
      <Link to="/" aria-label="DMB Moto Shop — Beranda" className="flex items-center">
        <img src={logo} alt="DMB Moto Shop" className="h-11 w-auto lg:h-12" />
      </Link>
      <nav className="hidden lg:flex items-center gap-6 text-xs font-medium uppercase tracking-[0.24px] text-neutral-900">
        <Link to="/">Home</Link>
        <Link to="/search">Cari Produk</Link>
        <Link to="/lacak">Lacak Pesanan</Link>
      </nav>
      <div className="flex items-center gap-4">
        <Link to="/search" aria-label="Cari" className="flex items-center justify-center size-5">
          <img src={searchIcon} alt="" className="size-full" />
        </Link>
        <Link to="/cart" aria-label="Keranjang" className="relative flex items-center justify-center size-5">
          <img src={cartIcon} alt="" className="size-full" />
          {itemCount > 0 && (
            <span className="absolute -top-2 -right-2 bg-primary-600 text-neutral-0 text-xs rounded-full w-5 h-5 flex items-center justify-center">
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
