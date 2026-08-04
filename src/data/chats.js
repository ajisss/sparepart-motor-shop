import { initialsFromName, colorForId } from '../lib/chatStore.js'

const SEED_CONTACTS = [
  {
    id: 'c1',
    name: 'Andi Pratama',
    online: true,
    unreadForAdmin: 2,
    messages: [
      { from: 'customer', text: 'Halo, mau tanya stok kampas rem untuk Honda Vario 150 masih ada?', time: '10:28' },
      { from: 'admin', text: 'Halo Andi! Ada, stok masih aman. Mau langsung order?', time: '10:29' },
      { from: 'customer', text: 'Iya, tadi udah order. Kira-kira kapan bisa dikirim?', time: '10:31' },
      { from: 'admin', text: 'Pesanan kamu sudah kami proses. Estimasi pengiriman 1–2 hari kerja ya!', time: '10:32' },
      { from: 'customer', text: 'Siap, makasih bang!', time: '10:33' },
      { from: 'customer', text: 'Bang, kampas rem Vario saya udah nyampe belum ya?', time: '10:33' },
    ],
  },
  {
    id: 'c2',
    name: 'James Carter',
    online: false,
    unreadForAdmin: 2,
    messages: [
      { from: 'customer', text: 'Hi, I ordered a chain kit last night. Has my order been shipped already?', time: '10:18' },
      { from: 'admin', text: "Hi James! Your order is being processed. We'll ship it today.", time: '10:20' },
    ],
  },
  {
    id: 'c3',
    name: 'Olivia',
    online: true,
    unreadForAdmin: 1,
    messages: [
      { from: 'customer', text: 'Halo, pesanan saya bisa diganti alamat pengirimannya gak ya? Salah input tadi.', time: '09:55' },
    ],
  },
  {
    id: 'c4',
    name: 'Ethan Ramirez',
    online: false,
    unreadForAdmin: 0,
    messages: [
      { from: 'customer', text: 'Filter oli yang saya terima kayaknya beda sama foto di website.', time: '09:38' },
      { from: 'admin', text: 'Maaf atas ketidaknyamanannya. Boleh kirim foto produk yang diterima?', time: '09:40' },
    ],
  },
  {
    id: 'c5',
    name: 'Liam Parker',
    online: false,
    unreadForAdmin: 0,
    messages: [
      { from: 'customer', text: 'Knalpot racing nya udah sampe, packagingnya aman banget. Thanks!', time: 'Kemarin' },
      { from: 'admin', text: 'Terima kasih sudah belanja di DMB! Jangan lupa kasih review ya.', time: 'Kemarin' },
      { from: 'customer', text: 'Thanks for the quick response!', time: 'Kemarin' },
    ],
  },
  {
    id: 'c6',
    name: 'Julia',
    online: false,
    unreadForAdmin: 4,
    messages: [{ from: 'customer', text: 'Halo, bisa cancel pesanan yang baru aja saya buat?', time: 'Kemarin' }],
  },
  {
    id: 'c7',
    name: 'Budi Santoso',
    online: false,
    unreadForAdmin: 3,
    messages: [{ from: 'customer', text: 'Bang, baut manifold M8 ukuran 30mm ada stoknya gak?', time: 'Kemarin' }],
  },
  {
    id: 'c8',
    name: 'Michelle',
    online: false,
    unreadForAdmin: 0,
    messages: [{ from: 'customer', text: 'Pesanan saya udah dikirim belum ya?', time: 'Kemarin' }],
  },
]

export function buildSeedConversations() {
  const now = Date.now()
  const conversations = {}

  SEED_CONTACTS.forEach((contact, index) => {
    conversations[contact.id] = {
      id: contact.id,
      name: contact.name,
      initials: initialsFromName(contact.name),
      color: colorForId(contact.id),
      userId: null,
      online: contact.online,
      unreadForAdmin: contact.unreadForAdmin,
      unreadForCustomer: 0,
      updatedAt: now - index * 60_000,
      messages: contact.messages.map((m, i) => ({ id: `${contact.id}-${i}`, ...m })),
    }
  })

  return conversations
}
