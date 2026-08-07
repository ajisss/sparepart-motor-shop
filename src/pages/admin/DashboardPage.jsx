import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useStore } from '../../store/StoreProvider'
import { formatCurrency } from '../../utils/formatCurrency'
import StatCard from '../../components/admin/widgets/StatCard'
import { BoxIcon, SparkleIcon } from '../../components/admin/icons'
import { Tag } from '@phosphor-icons/react'

export default function DashboardPage() {
  const { products = [], categories = [] } = useStore()
  const { currentUser } = useAuth()
  const name = currentUser?.name?.split(' ')[0] || 'Admin'

  const totalProduct = products.length
  const featuredProducts = products.filter((p) => p.isFeatured).length
  const totalCategories = categories.length

  const catName = (id) => categories.find((c) => c.id === id)?.name || id

  const recentProducts = useMemo(
    () => [...products].slice(-6).reverse(),
    [products]
  )

  return (
    <div className="mx-auto max-w-[1200px] p-6 lg:p-8">
      {/* Page heading */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-[26px] font-semibold text-black">Selamat datang, {name}!</h1>
          <p className="mt-0.5 text-[14px] text-[var(--adm-muted)]">Berikut ringkasan dashboard kamu</p>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard icon={BoxIcon} label="Total Produk" value={totalProduct.toLocaleString('id-ID')} />
        <StatCard icon={SparkleIcon} label="Produk Unggulan" value={featuredProducts.toLocaleString('id-ID')} />
        <StatCard icon={Tag} label="Total Kategori" value={totalCategories.toLocaleString('id-ID')} />
      </div>

      {/* Produk Terbaru */}
      <div className="adm-card mt-4 p-6">
        <h2 className="text-[18px] font-semibold text-black">Produk Terbaru</h2>
        {recentProducts.length === 0 ? (
          <p className="mt-4 text-[14px] text-[var(--adm-muted)]">Belum ada produk.</p>
        ) : (
          <div className="mt-4 flex flex-col divide-y divide-[var(--adm-border)]">
            {recentProducts.map((p) => (
              <Link
                key={p.id}
                to={`/admin/products/${p.id}`}
                className="flex items-center justify-between gap-4 py-3 text-[14px] hover:bg-[var(--adm-bg)]"
              >
                <div className="min-w-0">
                  <p className="truncate font-medium text-black">{p.name}</p>
                  <p className="truncate text-[12px] text-[var(--adm-muted)]">{catName(p.category)}</p>
                </div>
                <span className="shrink-0 font-medium text-black">{formatCurrency(p.price)}</span>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
