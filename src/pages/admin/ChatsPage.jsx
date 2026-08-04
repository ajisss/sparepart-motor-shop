import { useState } from 'react'
import { MagnifyingGlass, DotsThree, PaperPlaneTilt, Plus } from '@phosphor-icons/react'
import { useChat } from '../../context/ChatContext'

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
  const { conversationList, sendAsAdmin, markReadBy, lastMessage } = useChat()
  const [activeId, setActiveId] = useState(null)
  const [input, setInput] = useState('')

  const chats = conversationList
  const activeConversationId = activeId ?? chats[0]?.id ?? null
  const active = chats.find((c) => c.id === activeConversationId)
  const totalUnread = chats.reduce((s, c) => s + c.unreadForAdmin, 0)

  function selectConversation(id) {
    setActiveId(id)
    markReadBy(id, 'admin')
  }

  function send() {
    if (!input.trim() || !active) return
    sendAsAdmin(active.id, input)
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
                onClick={() => selectConversation(c.id)}
                className={`flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-left transition-colors ${
                  activeConversationId === c.id ? 'bg-[var(--adm-bg)]' : 'hover:bg-[var(--adm-bg)]'
                }`}
              >
                <Avatar contact={c} />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[14px] font-medium text-black">{c.name}</p>
                  <p className="truncate text-[13px] text-[var(--adm-muted)]">{lastMessage(c)?.text ?? ''}</p>
                </div>
                <div className="flex shrink-0 flex-col items-end gap-1">
                  <span className="text-[11px] text-[var(--adm-muted)]">{lastMessage(c)?.time ?? ''}</span>
                  {c.unreadForAdmin > 0 && (
                    <span className="flex size-5 items-center justify-center rounded-full bg-[var(--adm-forest-500)] text-[11px] font-semibold text-white">
                      {c.unreadForAdmin}
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
