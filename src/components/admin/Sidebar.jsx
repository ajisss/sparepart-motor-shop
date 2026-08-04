import { NavLink } from 'react-router-dom'
import {
  SquaresFour,
  ClipboardText,
  Package,
  ChatCircleText,
  Gear,
  PlugsConnected,
  Question,
  ArrowSquareOut,
  Plus,
  CaretDown,
  Sparkle,
} from '@phosphor-icons/react'

// Exact rebuild of the Figma "Sidebar" component (node 37:346):
// floating white rounded-[40px] card, Geist 18px pill nav items, grouped
// Menu / General / Tools, Chats danger badge, HubSpot tool, mint Upgrade card.
const MENU = [
  { to: '/admin', label: 'Dashboard', Icon: SquaresFour, end: true },
  { to: '/admin/orders', label: 'Pesanan', Icon: ClipboardText },
  { to: '/admin/products', label: 'Produk', Icon: Package },
  { to: '/admin/chats', label: 'Chat', Icon: ChatCircleText, badge: 4 },
]
const GENERAL = [
  { to: '/admin/settings', label: 'Pengaturan', Icon: Gear },
  { to: '/admin/integration', label: 'Integrasi', Icon: PlugsConnected },
  { to: '/admin/help', label: 'Pusat Bantuan', Icon: Question },
]

function GroupLabel({ children }) {
  return (
    <div className="flex items-center gap-2 px-1">
      <span className="font-normal text-[16px] text-[var(--adm-muted)]">{children}</span>
      <CaretDown size={16} className="text-[var(--adm-muted)]" />
    </div>
  )
}

function Item({ to, label, Icon, end, badge }) {
  return (
    <NavLink
      to={to}
      end={end}
      className={({ isActive }) =>
        [
          'flex items-center gap-2 rounded-[100px] px-4 py-2.5 text-[18px] transition-colors',
          isActive
            ? 'bg-[var(--adm-forest-500)] text-white'
            : 'text-black hover:bg-[var(--adm-bg)]',
        ].join(' ')
      }
    >
      {({ isActive }) => (
        <>
          <Icon size={24} weight={isActive ? 'fill' : 'regular'} className="shrink-0" />
          <span className="flex-1 whitespace-nowrap">{label}</span>
          {badge != null && (
            <span className="inline-flex items-center justify-center rounded-[100px] bg-[var(--adm-danger-bg)] px-2 py-0.5 text-[14px] font-medium text-[var(--adm-danger)]">
              {badge}
            </span>
          )}
        </>
      )}
    </NavLink>
  )
}

export default function Sidebar() {
  return (
    <aside className="relative hidden w-[279px] shrink-0 flex-col overflow-hidden rounded-[40px] bg-white lg:flex">
      <div className="flex flex-1 flex-col gap-4 overflow-y-auto p-6 pb-[200px]">
        {/* Menu */}
        <div className="flex flex-col gap-2">
          <GroupLabel>Menu</GroupLabel>
          {MENU.map((m) => (
            <Item key={m.to} {...m} />
          ))}
        </div>
        {/* General */}
        <div className="flex flex-col gap-2">
          <GroupLabel>Umum</GroupLabel>
          {GENERAL.map((m) => (
            <Item key={m.to} {...m} />
          ))}
        </div>
        {/* Tools */}
        <div className="flex flex-col gap-2">
          <GroupLabel>Alat</GroupLabel>
          <div className="flex items-center justify-between rounded-[100px] px-4 py-2.5">
            <div className="flex items-center gap-2">
              <span className="flex size-10 items-center justify-center rounded-[10px] bg-[#FF7A59] text-[13px] font-bold text-white">
                Hs
              </span>
              <span className="text-[18px] text-black">HubSpot</span>
            </div>
            <ArrowSquareOut size={24} className="text-black" />
          </div>
          <div className="flex items-center gap-2 rounded-[100px] px-4 py-2.5 text-[18px] text-black">
            <Plus size={24} />
            <span>Tambah alat</span>
          </div>
        </div>
      </div>

    </aside>
  )
}
