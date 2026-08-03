export const SHIPPING = {
  couriers: [
    { id: 'jne', name: 'JNE', services: [
      { id: 'reg', name: 'Regular', cost: 15000, etaLabel: '2–3 hari' },
      { id: 'yes', name: 'Same Day', cost: 35000, etaLabel: 'Hari ini' },
    ] },
    { id: 'sicepat', name: 'SiCepat', services: [
      { id: 'reg', name: 'Regular', cost: 13000, etaLabel: '2–4 hari' },
      { id: 'best', name: 'Same Day', cost: 32000, etaLabel: 'Hari ini' },
    ] },
    { id: 'anteraja', name: 'AnterAja', services: [
      { id: 'reg', name: 'Regular', cost: 14000, etaLabel: '2–3 hari' },
      { id: 'instant', name: 'Instant', cost: 45000, etaLabel: '1–3 jam' },
    ] },
  ],
}
