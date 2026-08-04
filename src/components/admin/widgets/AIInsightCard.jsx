import { CheckCircle, ArrowRight } from '@phosphor-icons/react'
import { Link } from 'react-router-dom'

// Commerly "AI Insight" widget: mint-tinted card, title + subtitle, a row of
// checkmark insights, and a circular arrow CTA. Insight copy here is derived
// from real store data (low stock count, new products this month) rather than
// invented numbers — the one qualitative line links onward to the Dashboard.
export default function AIInsightCard({ insights = [] }) {
  return (
    <div className="relative flex h-[219px] w-[366px] max-w-full shrink-0 flex-col justify-between overflow-hidden rounded-[40px] border-[1.5px] border-[var(--adm-mint)] bg-[#fffdf0] p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[16px] text-black">Insight AI</p>
          <p className="text-[14px] text-[var(--adm-muted)]">Insight AI toko kamu siap!</p>
        </div>
        <Link
          to="/admin"
          className="flex size-[47px] shrink-0 items-center justify-center rounded-full bg-[var(--adm-mint)] transition-opacity hover:opacity-90"
          aria-label="Lihat Dashboard"
        >
          <ArrowRight size={20} className="text-black" />
        </Link>
      </div>

      <ul className="flex flex-col gap-2">
        {insights.map((line, i) => (
          <li key={i} className="flex items-center gap-2">
            <CheckCircle size={20} weight="fill" className="shrink-0 text-[var(--adm-success)]" />
            <p className="text-[14px] leading-[1.5] text-black">{line}</p>
          </li>
        ))}
      </ul>
    </div>
  )
}
