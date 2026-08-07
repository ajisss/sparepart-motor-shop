import { useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { useDashboardMetrics } from '../../hooks/useDashboardMetrics'
import { formatCurrency } from '../../utils/formatCurrency'
import StatCard from '../../components/admin/widgets/StatCard'
import RevenueChart from '../../components/admin/widgets/RevenueChart'
import SalesGauge from '../../components/admin/widgets/SalesGauge'
import RecentOrders from '../../components/admin/widgets/RecentOrders'
import Sparkline from '../../components/admin/widgets/Sparkline'
import MiniBars from '../../components/admin/widgets/MiniBars'
import { BoxIcon, CartIcon, OrdersIcon, TruckIcon, SparkleIcon } from '../../components/admin/icons'
import { Funnel, SquaresFour } from '@phosphor-icons/react'

function compactRp(n) {
  if (n >= 1_000_000) return 'Rp ' + (n / 1_000_000).toFixed(1).replace('.0', '') + ' jt'
  if (n >= 1_000) return 'Rp ' + Math.round(n / 1_000) + ' rb'
  return formatCurrency(n)
}

export default function DashboardPage() {
  const m = useDashboardMetrics()
  const { currentUser } = useAuth()
  const name = currentUser?.name?.split(' ')[0] || 'Admin'

  return (
    <div className="mx-auto max-w-[1200px] p-6 lg:p-8">
      {/* Page heading */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-[26px] font-semibold text-black">Selamat datang, {name}!</h1>
          <p className="mt-0.5 text-[14px] text-[var(--adm-muted)]">Berikut ringkasan dashboard kamu</p>
        </div>
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-2 rounded-full border border-[var(--adm-border)] bg-white px-4 py-2 text-[14px] font-medium text-black hover:bg-[var(--adm-bg)]">
            <Funnel size={16} />
            Filter
          </button>
          <button className="flex items-center gap-2 rounded-full bg-[var(--adm-mint)] px-4 py-2 text-[14px] font-medium text-black hover:brightness-95">
            <SquaresFour size={16} />
            Atur Widget
          </button>
        </div>
      </div>

      {/* Row 1 — 5 stat cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <StatCard
          icon={CartIcon}
          label="Total Penjualan"
          value={m.unitsSold.toLocaleString('id-ID')}
          lastWeek={Math.round(m.unitsSold * 0.93)}
          delta={7}
          info
        />
        <StatCard
          icon={OrdersIcon}
          label="Total Pelanggan"
          value={(Math.round(m.totalOrders * 0.7)).toLocaleString('id-ID')}
          lastWeek={Math.round(m.totalOrders * 0.7 * 0.97)}
          delta={3}
          info
        />
        <StatCard
          icon={CartIcon}
          label="Total Pendapatan"
          value={compactRp(m.totalSales)}
          lastWeek={Math.round(m.totalSales / 1000 * 0.95)}
          lastWeekLabel={compactRp(Math.round(m.totalSales * 0.95))}
          delta={-5}
          info
        />
        <StatCard
          icon={BoxIcon}
          label="Total Produk"
          value={m.totalProduct.toLocaleString('id-ID')}
          lastWeek={Math.round(m.totalProduct * 1.08)}
          delta={-8}
          info
        />
        <StatCard
          icon={SparkleIcon}
          label="Produk Unggulan"
          value={m.featuredProducts.toLocaleString('id-ID')}
        />
      </div>

      {/* Row 2 — sales gauge + revenue chart */}
      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-5">
        <div className="lg:col-span-2">
          <SalesGauge pct={m.targetPct} periodRevenue={m.periodRevenue} target={m.periodTarget} />
        </div>
        <div className="lg:col-span-3">
          <RevenueChart weekly={m.weekly} total={m.weeklyTotal} />
        </div>
      </div>

      {/* Row 3 — recent orders */}
      <div className="mt-4">
        <RecentOrders orders={m.recentOrders} />
      </div>
    </div>
  )
}
