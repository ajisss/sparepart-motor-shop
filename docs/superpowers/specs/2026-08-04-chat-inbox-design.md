# Chat Inbox Design

**Date:** 2026-08-04
**Project:** DMB Moto Shop customer storefront + admin panel

## Goal

Give logged-in customers a way to chat with the store directly from the site header, and connect that conversation to the existing admin `ChatsPage` so admin replies reach the customer. The whole feature stays frontend-only, using `localStorage` as the shared data source, matching the existing prototype architecture (no backend).

## Scope

### Customer-facing inbox icon

Add an inbox icon to `Nav.jsx`, positioned between the existing Cart icon and the Akun/Login link. It uses the `ChatCircleText` icon from `@phosphor-icons/react` (already a project dependency, already used in the admin sidebar), sized and colored to match the existing Search/Cart icons, including the scrolled/dark header color swap.

Behavior:

- Logged out: clicking the icon calls `navigate('/login')`. No dropdown opens.
- Logged in: clicking the icon toggles a dropdown panel anchored under the icon, styled consistently with the existing mini-cart popup (rounded corners, white surface, shadow, closes on outside click / Escape / route change — reusing the same interaction pattern already implemented for the cart in `Nav.jsx`).
- The icon shows a small unread-count badge (same visual treatment as the existing cart item-count badge) when the logged-in customer has unread admin messages. Hidden when logged out or when unread count is 0.

### Dropdown content

Since the customer only ever talks to one counterparty (the store), the dropdown is a single chat window, not a contact list:

- Scrollable message history (chat bubbles, admin messages left-aligned, customer messages right-aligned — visually consistent with the bubble styling already used in the admin `ChatsPage`).
- Text input + send button at the bottom.
- Empty state ("Mulai chat dengan kami") when the customer has no existing conversation yet.
- Sending a message appends it to the shared conversation and, if this is the customer's first message ever, creates the conversation record.

### Shared data layer: `ChatContext`

New `src/context/ChatContext.jsx`, following the same provider + `localStorage` pattern as `CartContext`/`AuthContext`.

Storage key: `dmb:chats`. Shape:

```js
{
  [conversationId]: {
    id: string,          // conversationId; for real customers this is their USERS id (e.g. "u1")
    name: string,
    initials: string,
    color: string,       // hex, for the avatar background
    userId: string | null, // null for seed/mock contacts not tied to a real account
    online: boolean,
    messages: [{ id, from: 'admin' | 'customer', text, time }],
    unreadForAdmin: number,
    unreadForCustomer: number,
    updatedAt: number,   // epoch ms, for sorting the admin conversation list
  }
}
```

Seeding: the 8 existing mock contacts currently hardcoded in `ChatsPage.jsx` move to `src/data/chats.js` as seed data (`userId: null`, `unreadForAdmin`/`unreadForCustomer` derived from their current `unread` field). `ChatContext` writes this seed into `localStorage` once, only if `dmb:chats` doesn't exist yet — matching how `store/seed.js` seeds other data. Seeded conversations are never reachable from the customer side (no real `userId` matches them); they exist purely so the admin `ChatsPage` still has demo content out of the box.

Conversation creation for real customers: when a logged-in customer (from `USERS`) sends their first message, `ChatContext` creates a new entry keyed by `currentUser.id`, using their name, a two-letter initials value derived the same way `Topbar.jsx` already derives the admin's own initials (`name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase()`), and a color picked deterministically from a small fixed palette (e.g. hashed from the user id) so the same customer always gets the same avatar color.

`ChatContext` exposes:

- `getConversation(id)`
- `sendMessage(conversationId, from, text)` — appends a message, updates `updatedAt`, and increments the *other* party's unread counter.
- `markRead(conversationId, by)` — zeroes `unreadForAdmin` or `unreadForCustomer`.
- `conversations` — the full map, for `ChatsPage`'s list.

Cross-tab sync: `ChatContext` listens for the `storage` event and reloads from `localStorage` when `dmb:chats` changes in another tab, so a customer tab and an admin tab open side by side both reflect new messages without a manual refresh.

### Admin `ChatsPage` changes

`ChatsPage.jsx` drops its local `CONTACTS` array and `useState(CONTACTS)`, reading `conversations` from `ChatContext` instead. The conversation list, active-conversation view, and send behavior otherwise keep their current layout and styling — only the data source changes from a local hardcoded array to the shared context. Opening a conversation calls `markRead(id, 'admin')`.

### Admin sidebar unread badge

`Sidebar.jsx` currently hardcodes `badge: 4` on the Chat nav item (`src/components/admin/Sidebar.jsx:23`). This becomes a live count: the sum of `unreadForAdmin` across all conversations in `ChatContext`, read via a small selector/hook so the badge disappears when there are 0 unread conversations rather than being permanently stuck at 4.

## Data Flow

1. Customer logs in, opens the inbox dropdown, types a message, hits send.
2. `ChatContext.sendMessage` creates/updates the conversation for `currentUser.id` in `localStorage['dmb:chats']` and bumps `unreadForAdmin`.
3. Admin, on `/admin/chats`, sees the conversation appear/update in the list (live via the `storage` event if already open in another tab, or immediately on next load) with the new unread badge, and in `Sidebar`.
4. Admin opens the conversation (`markRead('admin')`), replies — `sendMessage` bumps `unreadForCustomer`.
5. Customer's header badge updates (live via `storage` event or on next dropdown open) and the reply appears in their chat history.

No backend, API, or new persisted data structures beyond the `dmb:chats` localStorage key. Existing auth, cart, and store data are untouched.

## Edge Cases

- `localStorage['dmb:chats']` missing or corrupt (invalid JSON): `ChatContext` falls back to reseeding from the mock data rather than throwing.
- Customer sends a message while logged out: unreachable, since the icon redirects to `/login` before any dropdown/input is shown.
- Multiple browser tabs open at once: `storage` event keeps both admin and customer views eventually consistent; no locking/merge conflict handling is needed since this is a single-user local prototype (not a multi-device production chat system).

## Testing

Manual, since this is a frontend-only prototype with no test harness for chat:

1. Log in as a customer (e.g. Budi Santoso), send a message from the header dropdown — confirm it appears, input clears, badge behavior is correct.
2. Open `/admin/chats` in another tab — confirm the new conversation appears in the list with correct name/preview/unread badge, and the sidebar Chat badge count reflects it.
3. Reply as admin — confirm `unreadForCustomer` increments and the reply appears in the customer's dropdown (reopen or live via `storage` event).
4. Refresh both tabs — confirm all messages persisted via `localStorage`.
5. Log out and confirm the inbox icon redirects to `/login` instead of opening the dropdown.
6. `npm run lint` and `npm run build` both pass.

## Out of Scope

- Any real backend, WebSocket, or push notification delivery.
- Multi-device or multi-user real-time sync beyond same-browser `storage` events.
- File/image attachments in chat.
- Typing indicators or read receipts beyond the existing static "Mengetik..." decoration already in `ChatsPage`.
- Per-order chat threads (this is a single ongoing thread per customer).
- Changing the visual design of the existing admin `ChatsPage` chat window beyond swapping its data source.
