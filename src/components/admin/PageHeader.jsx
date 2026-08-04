// Shared admin page heading: title + subtitle on the left, actions on the right.
export default function PageHeader({ title, subtitle, children }) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
      <div>
        <h1 className="text-[24px] font-medium text-black">{title}</h1>
        {subtitle && <p className="mt-1 text-[14px] text-[var(--adm-muted)]">{subtitle}</p>}
      </div>
      {children && <div className="flex items-center gap-2">{children}</div>}
    </div>
  )
}
