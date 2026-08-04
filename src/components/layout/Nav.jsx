import { useEffect, useRef, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { ChatCircleText, PaperPlaneTilt } from '@phosphor-icons/react'
import { useCart } from '../../context/CartContext'
import { useAuth } from '../../context/AuthContext'
import { useChat } from '../../context/ChatContext'
import { useCategories, useProducts } from '../../store/hooks'
import { formatCurrency } from '../../utils/formatCurrency'
import searchIcon from '../../assets/nav/search-icon.svg'
import cartIcon from '../../assets/nav/cart-icon.svg'
import logo from '../../assets/logo-dmb.png'

export default function Nav({ overlay = false }) {
  const { items, itemCount, subtotal } = useCart()
  const { isLoggedIn, logout } = useAuth()
  const { myConversation, myUnread, sendAsCustomer, markReadBy } = useChat()
  const categories = useCategories()
  const products = useProducts()
  const navigate = useNavigate()
  const location = useLocation()

  const [scrolled, setScrolled] = useState(false)
  const [cartOpen, setCartOpen] = useState(false)
  const cartRef = useRef(null)
  const [inboxOpen, setInboxOpen] = useState(false)
  const [inboxInput, setInboxInput] = useState('')
  const inboxRef = useRef(null)

  // Sticky header turns dark after scrolling down.
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Close the mini-cart on outside click or Escape.
  useEffect(() => {
    if (!cartOpen) return
    const onDown = (e) => {
      if (cartRef.current && !cartRef.current.contains(e.target)) setCartOpen(false)
    }
    const onKey = (e) => e.key === 'Escape' && setCartOpen(false)
    document.addEventListener('mousedown', onDown)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [cartOpen])

  // Close the inbox popup on outside click or Escape.
  useEffect(() => {
    if (!inboxOpen) return
    const onDown = (e) => {
      if (inboxRef.current && !inboxRef.current.contains(e.target)) setInboxOpen(false)
    }
    const onKey = (e) => e.key === 'Escape' && setInboxOpen(false)
    document.addEventListener('mousedown', onDown)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [inboxOpen])

  // Mark the customer's unread admin replies as read once they open the inbox.
  useEffect(() => {
    if (inboxOpen && myConversation && myConversation.unreadForCustomer > 0) {
      markReadBy(myConversation.id, 'customer')
    }
  }, [inboxOpen])

  // Close the mini-cart and inbox whenever the route changes.
  useEffect(() => {
    setCartOpen(false)
    setInboxOpen(false)
  }, [location.pathname])

  const categoryPreviews = categories.map((c) => ({
    ...c,
    image: products.find((p) => p.category === c.id && p.published)?.images?.[0],
    count: products.filter((p) => p.category === c.id && p.published).length,
  }))

  // Only the 5 most recently added items (newest first).
  const recentItems = items
    .slice(-5)
    .reverse()
    .map((i) => ({ ...i, product: products.find((p) => p.id === i.productId) }))
    .filter((i) => i.product)

  const handleSendInbox = () => {
    if (!inboxInput.trim()) return
    sendAsCustomer(inboxInput)
    setInboxInput('')
  }

  const onDark = scrolled || overlay
  const link = onDark ? 'text-neutral-0' : 'text-neutral-900'
  const subLink = onDark ? 'text-neutral-300 hover:text-neutral-0' : 'text-neutral-600 hover:text-neutral-900'

  return (
    <header
      className={`sticky top-0 z-50 flex items-center justify-between border-b px-4 py-4 transition-colors duration-300 lg:px-16 ${
        scrolled
          ? 'border-neutral-0/10 bg-neutral-900'
          : overlay && !scrolled
            ? 'border-neutral-0/10 bg-transparent'
            : 'border-neutral-100 bg-neutral-0'
      }`}
    >
      <Link to="/" aria-label="DMB Moto Shop — Beranda" className="flex items-center">
        <img src={logo} alt="DMB Moto Shop" className="h-10 w-auto lg:h-12" />
      </Link>

      <nav className={`hidden items-center gap-6 text-xs font-medium uppercase tracking-[0.24px] lg:flex ${link}`}>
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
          <img src={searchIcon} alt="" className={`size-full ${onDark ? 'invert' : ''}`} />
        </Link>

        {/* Cart + mini-cart popup */}
        <div className="relative" ref={cartRef}>
          <button
            type="button"
            aria-label="Keranjang"
            aria-expanded={cartOpen}
            onClick={() => setCartOpen((o) => !o)}
            className="relative flex size-5 items-center justify-center"
          >
            <img src={cartIcon} alt="" className={`size-full ${onDark ? 'invert' : ''}`} />
            {itemCount > 0 && (
              <span className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-secondary-600 text-xs font-semibold text-neutral-900">
                {itemCount}
              </span>
            )}
          </button>

          {cartOpen && (
            <div className="absolute right-0 top-full z-50 mt-3 w-80 rounded-2xl border border-neutral-100 bg-neutral-0 p-4 text-left shadow-xl">
              <div className="mb-3 flex items-center justify-between">
                <h3 className="font-medium text-neutral-900">Keranjang</h3>
                <span className="text-xs text-neutral-500">{itemCount} item</span>
              </div>

              {recentItems.length === 0 ? (
                <p className="py-6 text-center text-sm text-neutral-500">Keranjang masih kosong.</p>
              ) : (
                <>
                  <ul className="flex flex-col gap-3">
                    {recentItems.map((i) => (
                      <li key={i.productId} className="flex items-center gap-3">
                        <span className="size-11 shrink-0 overflow-hidden rounded-lg bg-neutral-100">
                          <img src={i.product.images?.[0]} alt="" className="size-full object-cover" />
                        </span>
                        <span className="flex min-w-0 flex-1 flex-col">
                          <span className="truncate text-sm font-medium text-neutral-900">{i.product.name}</span>
                          <span className="text-xs text-neutral-500">
                            {i.qty} × {formatCurrency(i.product.price)}
                          </span>
                        </span>
                      </li>
                    ))}
                  </ul>

                  {items.length > 5 && (
                    <p className="mt-3 text-center text-xs text-neutral-500">
                      Menampilkan 5 item terbaru dari {items.length} produk
                    </p>
                  )}

                  <div className="mt-4 flex items-center justify-between border-t border-neutral-100 pt-3 text-sm">
                    <span className="text-neutral-600">Subtotal</span>
                    <span className="font-semibold text-neutral-900">{formatCurrency(subtotal)}</span>
                  </div>

                  <div className="mt-4 flex flex-col gap-2">
                    <Link
                      to="/cart"
                      className="flex items-center justify-center rounded-pill border border-neutral-200 px-4 py-2.5 text-sm font-medium text-neutral-900 transition-colors hover:bg-neutral-50"
                    >
                      Lihat Keranjang
                    </Link>
                    <Link
                      to="/checkout"
                      className="flex items-center justify-center rounded-pill bg-neutral-900 px-4 py-2.5 text-sm font-medium text-neutral-0 transition-colors hover:bg-neutral-800"
                    >
                      Checkout
                    </Link>
                  </div>
                </>
              )}
            </div>
          )}
        </div>

        {/* Inbox */}
        <div className="relative" ref={inboxRef}>
          <button
            type="button"
            aria-label="Pesan"
            aria-expanded={inboxOpen}
            onClick={() => {
              if (!isLoggedIn) {
                navigate('/login')
                return
              }
              setInboxOpen((o) => !o)
            }}
            className="relative flex size-5 items-center justify-center"
          >
            <ChatCircleText size={20} className={link} />
            {isLoggedIn && myUnread > 0 && (
              <span className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-secondary-600 text-xs font-semibold text-neutral-900">
                {myUnread}
              </span>
            )}
          </button>

          {isLoggedIn && inboxOpen && (
            <div className="absolute right-0 top-full z-50 mt-3 flex w-80 flex-col overflow-hidden rounded-2xl border border-neutral-100 bg-neutral-0 text-left shadow-xl">
              <div className="border-b border-neutral-100 px-4 py-3">
                <h3 className="font-medium text-neutral-900">Chat dengan Toko</h3>
              </div>

              <div className="flex h-72 flex-col gap-3 overflow-y-auto px-4 py-3">
                {!myConversation || myConversation.messages.length === 0 ? (
                  <p className="m-auto text-center text-sm text-neutral-500">Mulai chat dengan kami.</p>
                ) : (
                  myConversation.messages.map((msg) => (
                    <div key={msg.id} className={`flex ${msg.from === 'customer' ? 'justify-end' : 'justify-start'}`}>
                      <div
                        className={`max-w-[75%] rounded-2xl px-3 py-2 text-sm ${
                          msg.from === 'customer' ? 'bg-neutral-900 text-neutral-0' : 'bg-neutral-100 text-neutral-900'
                        }`}
                      >
                        {msg.text}
                      </div>
                    </div>
                  ))
                )}
              </div>

              <div className="flex items-center gap-2 border-t border-neutral-100 px-4 py-3">
                <input
                  value={inboxInput}
                  onChange={(e) => setInboxInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSendInbox()}
                  placeholder="Ketik pesan..."
                  className="flex-1 bg-transparent text-sm text-neutral-900 placeholder:text-neutral-400 outline-none"
                />
                <button
                  type="button"
                  onClick={handleSendInbox}
                  aria-label="Kirim pesan"
                  className="flex size-8 shrink-0 items-center justify-center rounded-full bg-neutral-900 text-neutral-0 hover:bg-neutral-800"
                >
                  <PaperPlaneTilt size={16} weight="fill" />
                </button>
              </div>
            </div>
          )}
        </div>

        {isLoggedIn ? (
          <>
            <Link to="/akun" className={`text-sm ${subLink}`}>
              Akun
            </Link>
            <button
              onClick={() => {
                logout()
                navigate('/login')
              }}
              className={`text-sm ${subLink}`}
            >
              Logout
            </button>
          </>
        ) : (
          <Link to="/login" className={`text-sm ${subLink}`}>
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
