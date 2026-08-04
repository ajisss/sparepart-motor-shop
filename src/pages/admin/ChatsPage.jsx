import { useState } from 'react'
import { MagnifyingGlass, DotsThree, PaperPlaneTilt, Plus } from '@phosphor-icons/react'

const CONTACTS = [
  {
    id: 'c1',
    name: 'Andi Pratama',
    avatar: null,
    initials: 'AP',
    color: '#71717A',
    preview: 'Bang, kampas rem Vario saya udah nyampe belum ya?',
    time: '10:33',
    unread: 2,
    online: true,
    messages: [
      { id: 1, from: 'customer', text: 'Halo, mau tanya stok kampas rem untuk Honda Vario 150 masih ada?', time: '10:28' },
      { id: 2, from: 'admin', text: 'Halo Andi! Ada, stok masih aman. Mau langsung order?', time: '10:29' },
      { id: 3, from: 'customer', text: 'Iya, tadi udah order. Kira-kira kapan bisa dikirim?', time: '10:31' },
      { id: 4, from: 'admin', text: 'Pesanan kamu sudah kami proses. Estimasi pengiriman 1–2 hari kerja ya!', time: '10:32' },
      { id: 5, from: 'customer', text: 'Siap, makasih bang!', time: '10:33' },
      { id: 6, from: 'customer', text: 'Bang, kampas rem Vario saya udah nyampe belum ya?', time: '10:33' },
    ],
  },
  {
    id: 'c2',
    name: 'James Carter',
    avatar: null,
    initials: 'JC',
    color: '#16a34a',
    preview: 'Has my order been shipped already?',
    time: '10:20',
    unread: 2,
    online: false,
    messages: [
      { id: 1, from: 'customer', text: 'Hi, I ordered a chain kit last night. Has my order been shipped already?', time: '10:18' },
      { id: 2, from: 'admin', text: 'Hi James! Your order is being processed. We\'ll ship it today.', time: '10:20' },
    ],
  },
  {
    id: 'c3',
    name: 'Olivia',
    avatar: null,
    initials: 'OL',
    color: '#e07b54',
    preview: 'Bisa ganti alamat pengiriman gak ya?',
    time: '09:55',
    unread: 1,
    online: true,
    messages: [
      { id: 1, from: 'customer', text: 'Halo, pesanan saya bisa diganti alamat pengirimannya gak? Salah input tadi.', time: '09:55' },
    ],
  },
  {
    id: 'c4',
    name: 'Ethan Ramirez',
    avatar: null,
    initials: 'ER',
    color: '#7c3aed',
    preview: 'Filter oli yang saya terima kayaknya beda sama foto di web.',
    time: '09:40',
    unread: 0,
    online: false,
    messages: [
      { id: 1, from: 'customer', text: 'Filter oli yang saya terima kayaknya beda sama foto di website.', time: '09:38' },
      { id: 2, from: 'admin', text: 'Maaf atas ketidaknyamanannya. Boleh kirim foto produk yang diterima?', time: '09:40' },
    ],
  },
  {
    id: 'c5',
    name: 'Liam Parker',
    avatar: null,
    initials: 'LP',
    color: '#374151',
    preview: 'Thanks for the quick response!',
    time: 'Kemarin',
    unread: 0,
    online: false,
    messages: [
      { id: 1, from: 'customer', text: 'Knalpot racing nya udah sampe, packagingnya aman banget. Thanks!', time: 'Kemarin' },
      { id: 2, from: 'admin', text: 'Terima kasih sudah belanja di DMB! Jangan lupa kasih review ya.', time: 'Kemarin' },
      { id: 3, from: 'customer', text: 'Thanks for the quick response!', time: 'Kemarin' },
    ],
  },
  {
    id: 'c6',
    name: 'Julia',
    avatar: null,
    initials: 'JL',
    color: '#be185d',
    preview: 'Bisa cancel pesanan yang tadi?',
    time: 'Kemarin',
    unread: 4,
    online: false,
    messages: [
      { id: 1, from: 'customer', text: 'Halo, bisa cancel pesanan yang baru aja saya buat?', time: 'Kemarin' },
    ],
  },
  {
    id: 'c7',
    name: 'Budi Santoso',
    avatar: null,
    initials: 'BS',
    color: '#1d4ed8',
    preview: 'Baut manifold M8 ukuran 30mm ada gak?',
    time: 'Kemarin',
    unread: 3,
    online: false,
    messages: [
      { id: 1, from: 'customer', text: 'Bang, baut manifold M8 ukuran 30mm ada stoknya gak?', time: 'Kemarin' },
    ],
  },
  {
    id: 'c8',
    name: 'Michelle',
    avatar: null,
    initials: 'MC',
    color: '#9f1239',
    preview: 'Pesanan saya udah dikirim belum?',
    time: 'Kemarin',
    unread: 0,
    online: false,
    messages: [
      { id: 1, from: 'customer', text: 'Pesanan saya udah dikirim belum ya?', time: 'Kemarin' },
    ],
  },
]

function Avatar({ contact, size = 'md' }) {
  const sz = size === 'sm' ? 'size-9 text-[13px]' : 'size-10 text-[14px]'
  return (
    <span
      className={`${sz} inline-flex shrink-0 items-center justify-center rounded-full font-semibold text-white`}
      style={{ background: contact.color }}
    >
      {contact.initials}
    </span>
  )
}

export default function ChatsPage() {
  const [activeId, setActiveId] = useState('c1')
  const [input, setInput] = useState('')
  const [chats, setChats] = useState(CONTACTS)

  const active = chats.find((c) => c.id === activeId)
  const totalUnread = chats.reduce((s, c) => s + c.unread, 0)

  function send() {
    if (!input.trim()) return
    setChats((prev) =>
      prev.map((c) =>
        c.id === activeId
          ? { ...c, messages: [...c.messages, { id: Date.now(), from: 'admin', text: input.trim(), time: 'Baru saja' }], preview: input.trim() }
          : c
      )
    )
    setInput('')
  }

  return (
    <div className="flex h-full gap-3 p-3 pt-0">
      {/* Conversation list */}
      <div className="flex w-[300px] shrink-0 flex-col rounded-[24px] bg-white">
        {/* Header */}
        <div className="px-5 pt-5 pb-3">
          <h1 className="text-[22px] font-semibold text-black">Chats</h1>
          <p className="mt-0.5 text-[13px] text-[var(--adm-muted)]">
            {totalUnread > 0 ? `Kamu punya ${totalUnread} pesan belum dibaca` : 'Semua pesan sudah dibaca'}
          </p>
        </div>

        {/* List */}
        <ul className="flex-1 overflow-y-auto px-2 pb-4">
          {chats.map((c) => (
            <li key={c.id}>
              <button
                onClick={() => setActiveId(c.id)}
                className={`flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-left transition-colors ${
                  activeId === c.id ? 'bg-[var(--adm-bg)]' : 'hover:bg-[var(--adm-bg)]'
                }`}
              >
                <Avatar contact={c} />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[14px] font-medium text-black">{c.name}</p>
                  <p className="truncate text-[13px] text-[var(--adm-muted)]">{c.preview}</p>
                </div>
                <div className="flex shrink-0 flex-col items-end gap-1">
                  <span className="text-[11px] text-[var(--adm-muted)]">{c.time}</span>
                  {c.unread > 0 && (
                    <span className="flex size-5 items-center justify-center rounded-full bg-[var(--adm-forest-500)] text-[11px] font-semibold text-white">
                      {c.unread}
                    </span>
                  )}
                </div>
              </button>
            </li>
          ))}
        </ul>
      </div>

      {/* Chat window */}
      {active && (
        <div className="flex min-w-0 flex-1 flex-col rounded-[24px] bg-white">
          {/* Chat header */}
          <div className="flex items-center gap-3 border-b border-[var(--adm-border)] px-5 py-4">
            <Avatar contact={active} />
            <div className="flex-1">
              <p className="text-[15px] font-semibold text-black">{active.name}</p>
              <div className="flex items-center gap-1.5">
                {active.online && (
                  <span className="size-2 rounded-full bg-green-400" />
                )}
                <span className="text-[12px] text-[var(--adm-muted)]">
                  {active.online ? 'Online sekarang' : 'Offline'}
                </span>
              </div>
            </div>
            <button className="flex size-9 items-center justify-center rounded-full hover:bg-[var(--adm-bg)]">
              <MagnifyingGlass size={18} className="text-[var(--adm-muted)]" />
            </button>
            <button className="flex size-9 items-center justify-center rounded-full hover:bg-[var(--adm-bg)]">
              <DotsThree size={22} className="text-[var(--adm-muted)]" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-6 py-5">
            <div className="flex flex-col gap-4">
              {active.messages.map((msg) => {
                const isAdmin = msg.from === 'admin'
                return (
                  <div key={msg.id} className={`flex items-end gap-3 ${isAdmin ? 'flex-row-reverse' : ''}`}>
                    {!isAdmin && <Avatar contact={active} size="sm" />}
                    {isAdmin && (
                      <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-black text-[12px] font-bold text-[var(--adm-mint)]">
                        D
                      </span>
                    )}
                    <div className={`flex flex-col gap-1 ${isAdmin ? 'items-end' : 'items-start'}`}>
                      <div
                        className={`max-w-[380px] rounded-2xl px-4 py-3 text-[14px] leading-relaxed ${
                          isAdmin
                            ? 'bg-[var(--adm-mint)] text-black'
                            : 'bg-[var(--adm-bg)] text-black'
                        }`}
                      >
                        {msg.text}
                      </div>
                      <span className="text-[11px] text-[var(--adm-muted)]">{msg.time}</span>
                    </div>
                  </div>
                )
              })}

              {/* Typing indicator */}
              {active.online && (
                <div className="flex items-end gap-3">
                  <Avatar contact={active} size="sm" />
                  <div className="rounded-2xl bg-[var(--adm-bg)] px-4 py-3">
                    <span className="text-[13px] text-[var(--adm-muted)]">Mengetik …</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Input */}
          <div className="flex items-center gap-3 border-t border-[var(--adm-border)] px-5 py-4">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && send()}
              placeholder="Ketik pesan kamu..."
              className="flex-1 bg-transparent text-[14px] text-black placeholder:text-[var(--adm-muted)] outline-none"
            />
            <button className="flex size-9 items-center justify-center rounded-full border border-[var(--adm-border)] text-[var(--adm-muted)] hover:bg-[var(--adm-bg)]">
              <Plus size={18} />
            </button>
            <button
              onClick={send}
              className="flex size-10 items-center justify-center rounded-full bg-[var(--adm-forest-500)] text-[var(--adm-mint)] hover:opacity-90"
            >
              <PaperPlaneTilt size={18} weight="fill" />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
