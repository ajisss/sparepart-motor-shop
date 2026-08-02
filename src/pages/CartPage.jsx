import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Nav from '../components/layout/Nav'
import Footer from '../components/layout/Footer'
import QuantitySelector from '../components/ui/QuantitySelector'
import PriceTag from '../components/ui/PriceTag'
import Button from '../components/ui/Button'
import EmptyState from '../components/ui/EmptyState'
import ConfirmDeleteModal from '../components/cart/ConfirmDeleteModal'
import { useCart } from '../context/CartContext'
import { PRODUCTS } from '../data/products'
import { formatCurrency } from '../utils/formatCurrency'

export default function CartPage() {
  const { items, updateQty, removeItem, clearCart, subtotal } = useCart()
  const navigate = useNavigate()
  const [pendingDeleteId, setPendingDeleteId] = useState(null)
  const [confirmClearAll, setConfirmClearAll] = useState(false)

  const cartRows = items
    .map((item) => ({ ...item, product: PRODUCTS.find((p) => p.id === item.productId) }))
    .filter((row) => row.product)

  const pendingProduct = PRODUCTS.find((p) => p.id === pendingDeleteId)

  return (
    <div>
      <Nav />
      <section className="px-4 py-8 lg:px-16">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-semibold text-neutral-900">
            Keranjang Belanja{cartRows.length > 0 ? ` (${cartRows.length} produk)` : ''}
          </h1>
          {cartRows.length > 0 && (
            <button
              type="button"
              onClick={() => setConfirmClearAll(true)}
              className="text-sm text-neutral-600 hover:text-neutral-900"
            >
              Hapus Semua
            </button>
          )}
        </div>

        {cartRows.length === 0 ? (
          <EmptyState
            title="Keranjang Anda kosong"
            description="Yuk cari sparepart yang Anda butuhkan dan lengkapi keranjang belanjamu."
            actionLabel="Cari Produk"
            onAction={() => navigate('/search')}
          />
        ) : (
          <div className="flex flex-col gap-8 lg:flex-row lg:items-start">
            <div className="flex flex-1 flex-col gap-4">
              {cartRows.map(({ productId, qty, product }) => (
                <div
                  key={productId}
                  className="flex gap-4 rounded-2xl border border-neutral-100 p-4"
                >
                  <img
                    src={product.image}
                    alt={product.name}
                    className="size-20 shrink-0 rounded-xl bg-neutral-50 object-cover"
                  />
                  <div className="flex flex-1 flex-col gap-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex flex-col gap-1">
                        <span className="inline-flex w-fit items-center rounded-md bg-neutral-50 px-2.5 py-1 text-xs font-medium text-primary-900">
                          {product.brand}
                        </span>
                        <h3 className="font-medium text-neutral-900">{product.name}</h3>
                        <p className="text-sm text-neutral-600">
                          Cocok untuk: {product.compatibleWith?.[0] ?? 'Universal'}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setPendingDeleteId(productId)}
                        className="shrink-0 text-sm text-red-500 hover:text-red-600"
                      >
                        Hapus
                      </button>
                    </div>
                    <div className="flex items-center justify-between">
                      <QuantitySelector
                        value={qty}
                        max={product.stock}
                        onChange={(q) => updateQty(productId, q)}
                      />
                      <PriceTag amount={product.price * qty} />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex h-fit flex-col gap-4 rounded-2xl border border-neutral-100 p-6 lg:w-80 lg:shrink-0">
              <h2 className="font-semibold text-neutral-900">Ringkasan Belanja</h2>
              <div className="flex justify-between text-sm text-neutral-600">
                <span>Subtotal</span>
                <span>{formatCurrency(subtotal)}</span>
              </div>
              <div className="flex justify-between border-t border-neutral-100 pt-4 font-semibold text-neutral-900">
                <span>Total</span>
                <span>{formatCurrency(subtotal)}</span>
              </div>
              <Button variant="primary" onClick={() => navigate('/checkout')}>
                Checkout
              </Button>
              <Link to="/search" className="text-center text-sm text-primary-600">
                Lanjut Belanja
              </Link>
            </div>
          </div>
        )}
      </section>
      <Footer />
      <ConfirmDeleteModal
        open={!!pendingDeleteId || confirmClearAll}
        itemLabel={confirmClearAll ? 'semua produk' : pendingProduct?.name}
        onCancel={() => {
          setPendingDeleteId(null)
          setConfirmClearAll(false)
        }}
        onConfirm={() => {
          if (confirmClearAll) {
            clearCart()
            setConfirmClearAll(false)
          } else {
            removeItem(pendingDeleteId)
            setPendingDeleteId(null)
          }
        }}
      />
    </div>
  )
}
