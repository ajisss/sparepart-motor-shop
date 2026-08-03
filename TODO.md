# DMB Moto Shop — Sisa Task

Front-end-only POC prototype (React 19 + Vite + Tailwind + React Router). Semua
disimulasikan di client (localStorage) — no real backend/Midtrans/Biteship/SSO.
PRD: `~/DMB POS/figma-cli/prd.md`. Detail spec & plan tiap sub-proyek ada di
`docs/superpowers/`.

## Progres

- [x] **SP1 — Fondasi data & domain** — `StoreProvider` (localStorage `dmb:data`),
  produk kaya, kategori, user+alamat, order+6 status, promo, ekspedisi, konten
  homepage; Auth & Cart di-refactor ke store.
- [x] **SP2 — Customer storefront** — rebrand "DMB Moto Shop", Home/Katalog/Detail/
  Cart data-driven, checkout wizard (identitas guest/login+Google di checkout →
  alamat → ekspedisi→paket → promo → **Midtrans Snap simulasi** 3-outcome) →
  halaman sukses baca order asli. Terverifikasi end-to-end di browser.
- [x] **SP3 — Lacak pesanan & profil/riwayat customer** — halaman **Lacak
  Pesanan** (tamu: Order ID + email/HP), **/akun** (tab Profil/Alamat/Riwayat
  read-only), **/pesanan/:id** (detail + timeline `statusHistory` + blok resi
  `tracking`) dengan gate akses pemilik/tamu-terverifikasi. Seed order demo
  ditambah. Terverifikasi end-to-end di browser.

## Sisa sub-proyek (urut)

### SP4 — Admin workspace shell + Dashboard
- Layout/nav admin + gate role Owner/Admin.
- Dashboard: ringkasan omzet, order masuk, order perlu diproses, stok menipis,
  order terbaru.

### SP5 — Admin: kelola produk + konten homepage
- CRUD produk (nama, SKU, kategori, harga, stok, deskripsi, foto, video; toggle
  **publish** & **"Produk Terbaru"**) — perubahan kebaca di storefront.
- Kelola banner promo, urutan produk terbaru, testimoni pilihan homepage.

### SP6 — Admin: proses pesanan + refund
- List & detail order; aksi **"Siap Dikirim"** → trigger bikin shipment + resi
  (Biteship, simulasi); transisi status; refund manual (update status).

## Polish / utang teknis dari SP2 (non-blocking)

- `PaymentModal`: dropdown outcome nggak reset ke "Berhasil" saat modal dibuka ulang.
- Step Alamat: edit alamat tersimpan lalu batal ("Gunakan alamat tersimpan") masih
  nampilin nilai yang teredit — restore nilai default asli.
- Login di tengah checkout (user yang sudah punya alamat default) render form edit,
  bukan kartu alamat tersimpan (kosmetik; order tetap benar).
- Validasi kontak untuk mode akun (user Google dummy punya phone/email kosong) —
  perkuat sebelum SP3 supaya data lacak-pesanan selalu ada.
- `Modal` belum punya focus-trap / body-scroll-lock (acceptable buat POC).
- `toEmbedUrl` (detail produk) belum handle link `youtu.be/` (data seed pakai
  `watch?v=`).
- Belum ada produk `stock: 0` di seed → path CTA-disabled belum keuji runtime.
- Pertimbangkan guard `!product.published` → EmptyState di halaman detail begitu
  admin (SP5) bisa unpublish.

## Menjalankan

```bash
npm install
npm run dev      # http://localhost:5173/
npm run build    # produksi
npm run lint     # oxlint (ada 1 warning yang disengaja: param `password` di AuthContext, POC terima password apa aja)
```

Demo: akun seed `budi@dmb.com` (punya alamat default) & `sari@dmb.com` (belum),
password apa aja diterima. Kode promo: `DMB10`, `ONGKIR`, `HEMAT50K`. Reset data
demo dari console browser: `window.__dmbReset()`.

Order demo: login `budi@dmb.com` lalu buka **Akun → Riwayat** (3 order). Lacak
pesanan tamu: Order ID `ORD-6T1N8K3E` + email `andi.pratama@gmail.com` (atau HP
`081377788899`).
