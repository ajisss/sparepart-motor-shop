import { createContext, useContext, useEffect, useState } from 'react'
import { useAuth } from './AuthContext'
import { buildSeedConversations } from '../data/chats'
import { ensureConversation, sendMessage, markRead, totalUnread, sortByRecent, lastMessage } from '../lib/chatStore'

const ChatContext = createContext(null)
const STORAGE_KEY = 'dmb:chats'

function loadConversations() {
  const raw = localStorage.getItem(STORAGE_KEY)
  if (!raw) return buildSeedConversations()
  try {
    const parsed = JSON.parse(raw)
    if (!parsed || typeof parsed !== 'object') return buildSeedConversations()
    return parsed
  } catch {
    return buildSeedConversations()
  }
}

export function ChatProvider({ children }) {
  const { currentUser } = useAuth()
  const [conversations, setConversations] = useState(() => loadConversations())

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(conversations))
  }, [conversations])

  useEffect(() => {
    const onStorage = (e) => {
      if (e.key === STORAGE_KEY) setConversations(loadConversations())
    }
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [])

  const sendAsCustomer = (text) => {
    if (!currentUser || !text.trim()) return
    const now = Date.now()
    setConversations((prev) => {
      const withConversation = ensureConversation(
        prev,
        { id: currentUser.id, name: currentUser.name, userId: currentUser.id },
        now,
      )
      return sendMessage(withConversation, currentUser.id, 'customer', text.trim(), now)
    })
  }

  const sendAsAdmin = (conversationId, text) => {
    if (!text.trim()) return
    setConversations((prev) => sendMessage(prev, conversationId, 'admin', text.trim(), Date.now()))
  }

  const markReadBy = (conversationId, by) => {
    setConversations((prev) => markRead(prev, conversationId, by))
  }

  const myConversation = currentUser ? conversations[currentUser.id] ?? null : null

  const value = {
    conversationList: sortByRecent(conversations),
    myConversation,
    myUnread: myConversation?.unreadForCustomer ?? 0,
    adminUnreadTotal: totalUnread(conversations, 'admin'),
    sendAsCustomer,
    sendAsAdmin,
    markReadBy,
    lastMessage,
  }

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>
}

export function useChat() {
  const ctx = useContext(ChatContext)
  if (!ctx) throw new Error('useChat must be used within ChatProvider')
  return ctx
}
