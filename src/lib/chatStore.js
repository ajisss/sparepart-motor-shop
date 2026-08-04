const AVATAR_PALETTE = ['#71717A', '#16a34a', '#e07b54', '#7c3aed', '#374151', '#be185d', '#1d4ed8', '#9f1239']

export function initialsFromName(name) {
  const initials = (name || '')
    .split(' ')
    .map((w) => w[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase()
  return initials || '?'
}

export function colorForId(id) {
  let hash = 0
  for (let i = 0; i < id.length; i++) hash = (hash * 31 + id.charCodeAt(i)) >>> 0
  return AVATAR_PALETTE[hash % AVATAR_PALETTE.length]
}

export function ensureConversation(conversations, { id, name, userId }, now) {
  if (conversations[id]) return conversations
  return {
    ...conversations,
    [id]: {
      id,
      name,
      initials: initialsFromName(name),
      color: colorForId(id),
      userId: userId ?? null,
      online: false,
      unreadForAdmin: 0,
      unreadForCustomer: 0,
      updatedAt: now,
      messages: [],
    },
  }
}

export function sendMessage(conversations, conversationId, from, text, now) {
  const conversation = conversations[conversationId]
  if (!conversation) return conversations

  const message = {
    id: `${conversationId}-${conversation.messages.length}-${now}`,
    from,
    text,
    time: new Date(now).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
  }
  const unreadKey = from === 'customer' ? 'unreadForAdmin' : 'unreadForCustomer'

  return {
    ...conversations,
    [conversationId]: {
      ...conversation,
      messages: [...conversation.messages, message],
      updatedAt: now,
      [unreadKey]: conversation[unreadKey] + 1,
    },
  }
}

export function markRead(conversations, conversationId, by) {
  const conversation = conversations[conversationId]
  if (!conversation) return conversations
  const unreadKey = by === 'admin' ? 'unreadForAdmin' : 'unreadForCustomer'
  if (conversation[unreadKey] === 0) return conversations
  return { ...conversations, [conversationId]: { ...conversation, [unreadKey]: 0 } }
}

export function totalUnread(conversations, by) {
  const unreadKey = by === 'admin' ? 'unreadForAdmin' : 'unreadForCustomer'
  return Object.values(conversations).reduce((sum, c) => sum + c[unreadKey], 0)
}

export function sortByRecent(conversations) {
  return Object.values(conversations).sort((a, b) => b.updatedAt - a.updatedAt)
}

export function lastMessage(conversation) {
  return conversation.messages[conversation.messages.length - 1] ?? null
}
