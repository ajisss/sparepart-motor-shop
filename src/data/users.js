export const USERS = [
  {
    id: 'u1',
    name: 'Budi Santoso',
    email: 'budi@dmb.com',
    phone: '081234567890',
    password: 'password',
    provider: 'password',
    addresses: [
      { id: 'a1', recipientName: 'Budi Santoso', phone: '081234567890', line: 'Jl. Merdeka No. 10, RT 02/RW 03', city: 'Bandung', province: 'Jawa Barat', postalCode: '40111' },
    ],
    defaultAddressId: 'a1',
  },
  {
    id: 'u2',
    name: 'Sari Wulandari',
    email: 'sari@dmb.com',
    phone: '081298765432',
    password: 'password',
    provider: 'password',
    addresses: [],
    defaultAddressId: null,
  },
]
