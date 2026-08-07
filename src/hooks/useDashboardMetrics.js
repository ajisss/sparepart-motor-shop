import { useMemo } from 'react'
import { useStore } from '../store/StoreProvider'

// SP4: pure, memoized dashboard selectors derived from the SP1 store
// (products + orders in localStorage). All widget numbers come from here.

const DAY_LABELS = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab']

// Status buckets (6 statuses → dashboard groups)
const PROCESS = ['Menunggu pembayaran', 'Sedang diproses']
const SHIP = ['Siap dikirim', 'Dalam pengiriman']
const DONE = ['Selesai']
const REFUND = ['Refund diproses']

const PERIOD_DAYS = 30
const PERIOD_TARGET = 6_000_000 // demo 30-day revenue target for the gauge

function startOfDay(d) {
  const x = new Date(d)
  x.setHours(0, 0, 0, 0)
  return x
}

export function useDashboardMetrics() {
  const { products, orders } = useStore()

  return useMemo(() => {
    const now = new Date()

    // ---- Products ---------------------------------------------------------
    const totalProduct = products.length
    const featuredProducts = products.filter((p) => p.isFeatured).length

    // ---- Orders ---------------------------------------------------------
    const totalOrders = orders.length
    const isDone = (o) => DONE.includes(o.status)

    const totalSales = orders.filter(isDone).reduce((s, o) => s + (o.total || 0), 0)

    const buckets = {
      process: orders.filter((o) => PROCESS.includes(o.status)).length,
      ship: orders.filter((o) => SHIP.includes(o.status)).length,
      done: orders.filter((o) => DONE.includes(o.status)).length,
      refund: orders.filter((o) => REFUND.includes(o.status)).length,
    }

    // ---- Daily revenue for the last 14 days ----------------------------
    // Drives the sparklines, the weekly bar chart, and the "last week" ghost
    // bars behind it (Commerly's Revenue Insights compares this vs last week).
    const daily = []
    for (let i = 13; i >= 0; i--) {
      const day = startOfDay(now)
      day.setDate(day.getDate() - i)
      const next = new Date(day)
      next.setDate(next.getDate() + 1)
      const revenue = orders
        .filter((o) => isDone(o))
        .filter((o) => {
          const t = new Date(o.createdAt)
          return t >= day && t < next
        })
        .reduce((s, o) => s + (o.total || 0), 0)
      daily.push({ label: DAY_LABELS[day.getDay()], revenue })
    }
    const prevWeek = daily.slice(0, 7)
    const thisWeek = daily.slice(7)
    // Weekly bars carry both this-week revenue and the aligned last-week value.
    const weekly = thisWeek.map((d, i) => ({
      label: d.label,
      revenue: d.revenue,
      prev: prevWeek[i]?.revenue || 0,
    }))
    const weeklyTotal = thisWeek.reduce((s, d) => s + d.revenue, 0)
    const sparkline = daily.map((d) => d.revenue)

    // ---- Rolling 30-day revenue vs target (gauge) ----------------------
    const periodStart = startOfDay(now)
    periodStart.setDate(periodStart.getDate() - (PERIOD_DAYS - 1))
    const periodRevenue = orders
      .filter((o) => isDone(o))
      .filter((o) => new Date(o.createdAt) >= periodStart)
      .reduce((s, o) => s + (o.total || 0), 0)
    const targetPct = Math.min(100, Math.round((periodRevenue / PERIOD_TARGET) * 100))

    // ---- Recent orders (latest 6) --------------------------------------
    const recentOrders = [...orders]
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 6)
      .map((o) => ({
        id: o.id,
        customer: o.contact?.name || 'Tamu',
        total: o.total || 0,
        status: o.status,
        createdAt: o.createdAt,
        itemCount: (o.items || []).reduce((s, i) => s + i.qty, 0),
      }))

    // ---- Units sold (for a "Total Penjualan"-style secondary metric) ---
    const unitsSold = orders
      .filter(isDone)
      .reduce((s, o) => s + (o.items || []).reduce((t, i) => t + i.qty, 0), 0)

    return {
      totalProduct,
      featuredProducts,
      totalOrders,
      totalSales,
      unitsSold,
      buckets,
      weekly,
      weeklyTotal,
      sparkline,
      periodRevenue,
      periodTarget: PERIOD_TARGET,
      targetPct,
      recentOrders,
    }
  }, [products, orders])
}
