import { useState, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { useNavigate } from 'react-router-dom'
import { MagnifyingGlass, Bell, CaretDown, SignOut, X } from '@phosphor-icons/react'
import { useAuth } from '../../context/AuthContext'
import { useStore } from '../../store/StoreProvider'
import { ADMIN_LOGIN_SLUG } from '../../config/features'
import dmbLogo from '../../assets/logo-dmb.png'
import NotificationPanel from './NotificationPanel'
import SearchModal from './SearchModal'

function LogoutModal({ onConfirm, onCancel }) {
  return createPortal(
    <div
      className="fixed inset-0 z-[10000] flex items-center justify-center"
      style={{ background: 'rgba(0,0,0,0.35)' }}
      onMouseDown={(e) => { if (e.target === e.currentTarget) onCancel() }}
    >
      <div className="w-full max-w-[420px] overflow-hidden rounded-2xl bg-white p-8 shadow-2xl">
        {/* Icon */}
        <div className="flex size-12 items-center justify-center rounded-full bg-[var(--adm-danger-bg)]">
          <SignOut size={22} className="text-[var(--adm-danger)]" />
        </div>
        <div className="mt-4 flex items-start justify-between">
          <div>
            <h2 className="text-[18px] font-semibold text-black">Keluar</h2>
            <p className="mt-1 text-[14px] text-[var(--adm-muted)]">Yakin mau keluar dari akun ini?</p>
          </div>
          <button onClick={onCancel} className="flex size-8 items-center justify-center rounded-full hover:bg-[var(--adm-bg)]">
            <X size={18} className="text-[var(--adm-muted)]" />
          </button>
        </div>
        <div className="mt-6 flex items-center justify-end gap-3">
          <button
            onClick={onCancel}
            className="rounded-full border border-[var(--adm-border)] px-5 py-2.5 text-[14px] font-medium text-black hover:bg-[var(--adm-bg)]"
          >
            Batal
          </button>
          <button
            onClick={onConfirm}
            className="rounded-full bg-[var(--adm-danger)] px-5 py-2.5 text-[14px] font-medium text-white hover:opacity-90"
          >
            Keluar
          </button>
        </div>
      </div>
    </div>,
    document.body
  )
}

export default function Topbar() {
  const { currentUser, logout } = useAuth()
  const { orders = [] } = useStore()
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  const [notifOpen, setNotifOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [showLogout, setShowLogout] = useState(false)
  const menuRef = useRef(null)

  const unreadCount =
    orders.filter((o) => o.status === 'Menunggu pembayaran' || o.status === 'Sedang diproses').length

  const initials = (currentUser?.name || 'A')
    .split(' ')
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()

  useEffect(() => {
    function handler(e) {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setSearchOpen(true)
      }
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [])

  useEffect(() => {
    function handler(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  function handleLogout() {
    setShowLogout(false)
    setOpen(false)
    logout()
    navigate(`/admin/${ADMIN_LOGIN_SLUG}`)
  }

  return (
    <>
      <header className="flex h-[68px] items-center gap-4 rounded-[24px] bg-white px-4">
        {/* Brand */}
        <div className="flex items-center gap-2 pr-2">
          <img src={dmbLogo} alt="DMB Moto Shop" className="h-9 w-auto" />
        </div>

        <div className="ml-auto flex items-center gap-3">
          {/* Search trigger */}
          <button
            onClick={() => setSearchOpen(true)}
            className="flex h-11 w-[280px] items-center gap-2 rounded-[100px] bg-[var(--adm-bg)] px-4 text-left"
          >
            <MagnifyingGlass size={18} className="text-[var(--adm-muted)]" />
            <span className="flex-1 text-[16px] text-[var(--adm-muted)]">Cari apa saja</span>
            <span className="hidden shrink-0 items-center gap-0.5 sm:flex">
              <kbd className="rounded border border-[var(--adm-border)] bg-white px-1.5 py-0.5 text-[11px] leading-none text-[var(--adm-muted)]">⌘</kbd>
              <kbd className="rounded border border-[var(--adm-border)] bg-white px-1.5 py-0.5 text-[11px] leading-none text-[var(--adm-muted)]">K</kbd>
            </span>
          </button>
          {/* Notification bell */}
          <div>
            <button
              onClick={() => setNotifOpen((v) => !v)}
              className={`relative flex size-11 items-center justify-center rounded-full border transition-colors ${
                notifOpen
                  ? 'border-[var(--adm-mint)] bg-[var(--adm-mint)] text-black'
                  : 'border-[var(--adm-border)] bg-white text-black hover:bg-[var(--adm-bg)]'
              }`}
              aria-label="Notifikasi"
            >
              <Bell size={20} weight={notifOpen ? 'fill' : 'regular'} />
              {unreadCount > 0 && !notifOpen && (
                <span className="absolute right-2 top-2 flex min-w-[16px] items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold leading-[16px] text-white">
                  {unreadCount > 99 ? '99+' : unreadCount}
                </span>
              )}
            </button>
            {notifOpen && <NotificationPanel onClose={() => setNotifOpen(false)} />}
          </div>

          {/* User menu */}
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setOpen((v) => !v)}
              className={`flex items-center gap-2 rounded-[100px] border py-1.5 pl-1.5 pr-3 transition-colors ${
                open ? 'border-[var(--adm-mint)] bg-[var(--adm-mint)]' : 'border-[var(--adm-border)] bg-white hover:bg-[var(--adm-bg)]'
              }`}
            >
              <span className="flex size-8 items-center justify-center rounded-full bg-black text-[13px] font-semibold text-[var(--adm-mint)]">
                {initials}
              </span>
              <span className="hidden text-[15px] font-medium text-black sm:inline">
                {currentUser?.name?.split(' ')[0] || 'Admin'}
              </span>
              <CaretDown size={16} className="text-black" />
            </button>

            {open && (
              <div className="adm-card absolute right-0 z-20 mt-2 w-[260px] overflow-hidden p-0">
                {/* User info */}
                <div className="flex items-center gap-3 px-4 py-4 border-b border-[var(--adm-border)]">
                  <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-black text-[14px] font-semibold text-[var(--adm-mint)]">
                    {initials}
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-[14px] font-semibold text-black">{currentUser?.name}</p>
                    <p className="truncate text-[12px] text-[var(--adm-muted)]">{currentUser?.email}</p>
                  </div>
                </div>

                {/* Menu items */}
                <div className="flex flex-col px-2 pb-2 pt-2">
                  <button
                    onClick={() => { setOpen(false); setShowLogout(true) }}
                    className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-left text-[14px] text-[var(--adm-danger)] hover:bg-[var(--adm-danger-bg)]"
                  >
                    <SignOut size={18} />
                    Keluar
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {searchOpen && <SearchModal onClose={() => setSearchOpen(false)} />}
      {showLogout && <LogoutModal onConfirm={handleLogout} onCancel={() => setShowLogout(false)} />}
    </>
  )
}
