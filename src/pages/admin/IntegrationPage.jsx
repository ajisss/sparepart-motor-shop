import { useState, useEffect } from 'react'
import { integrations, CATEGORIES } from '../../data/integrations'
import { MagnifyingGlass, Funnel, ArrowSquareOut, X, ArrowUpRight } from '@phosphor-icons/react'

// ─── Logo avatar ────────────────────────────────────────────────────────────
function LogoAvatar({ integration, size = 40 }) {
  return (
    <div
      className="flex shrink-0 items-center justify-center rounded-[10px] font-bold text-white"
      style={{
        width: size,
        height: size,
        background: integration.logoBg,
        fontSize: size * 0.3,
      }}
    >
      {integration.logoText}
    </div>
  )
}

// ─── Toggle ─────────────────────────────────────────────────────────────────
function Toggle({ enabled, onChange }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={enabled}
      onClick={(e) => { e.stopPropagation(); onChange(!enabled) }}
      className="relative flex shrink-0 items-center rounded-full transition-colors"
      style={{
        width: 44,
        height: 24,
        background: enabled ? 'var(--adm-mint)' : 'var(--adm-border)',
      }}
    >
      <span
        className="absolute rounded-full bg-white shadow transition-all"
        style={{
          width: 18,
          height: 18,
          left: enabled ? 22 : 4,
        }}
      />
      <span
        className="absolute text-[10px] font-semibold transition-all"
        style={{
          left: enabled ? 6 : 'auto',
          right: enabled ? 'auto' : 5,
          color: enabled ? '#000' : 'var(--adm-muted)',
        }}
      >
        {enabled ? 'On' : 'Off'}
      </span>
    </button>
  )
}

// ─── Integration Card ────────────────────────────────────────────────────────
function IntegrationCard({ integration, enabled, onToggle, onOpen }) {
  return (
    <div
      className="adm-card flex cursor-pointer flex-col gap-3 p-4 transition-shadow hover:shadow-md"
      onClick={() => onOpen(integration)}
    >
      {/* Header */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-3">
          <LogoAvatar integration={integration} />
          <span className="text-[15px] font-medium text-[var(--adm-ink)]">{integration.name}</span>
        </div>
        <Toggle enabled={enabled} onChange={onToggle} />
      </div>

      {/* Description */}
      <p className="text-[13px] leading-relaxed text-[var(--adm-muted)]">
        {integration.description}
      </p>

      {/* Footer */}
      <div className="flex items-center justify-between border-t border-[var(--adm-border)] pt-3">
        <button
          type="button"
          className="text-[13px] font-medium text-[var(--adm-ink)] hover:underline"
          onClick={(e) => e.stopPropagation()}
        >
          Settings
        </button>
        <button
          type="button"
          className="flex items-center justify-center rounded-lg border border-[var(--adm-border)] p-1.5 hover:bg-[var(--adm-bg)]"
          onClick={(e) => e.stopPropagation()}
        >
          <ArrowSquareOut size={14} className="text-[var(--adm-muted)]" />
        </button>
      </div>
    </div>
  )
}

// ─── Detail Modal ────────────────────────────────────────────────────────────
function DetailModal({ integration, enabled, onToggle, onClose }) {
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose])

  if (!integration) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      onClick={onClose}
    >
      <div
        className="flex w-full max-w-2xl overflow-hidden rounded-2xl bg-white shadow-2xl"
        style={{ maxHeight: '90vh' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Left panel */}
        <div className="flex w-[240px] shrink-0 flex-col gap-4 border-r border-[var(--adm-border)] p-6">
          <LogoAvatar integration={integration} size={56} />
          <div>
            <h2 className="text-[17px] font-semibold text-[var(--adm-ink)]">{integration.name}</h2>
            <p className="mt-1 text-[13px] leading-relaxed text-[var(--adm-muted)]">
              {integration.description}
            </p>
          </div>

          <div className="flex flex-col gap-3 text-[13px]">
            <div>
              <p className="font-medium text-[var(--adm-ink)]">Platform</p>
              <p className="text-[var(--adm-muted)]">{integration.platform}</p>
            </div>
            {integration.website && (
              <div>
                <p className="font-medium text-[var(--adm-ink)]">Website</p>
                <a
                  href={`https://${integration.website}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-[var(--adm-info)] hover:underline"
                  onClick={(e) => e.stopPropagation()}
                >
                  {integration.website}
                  <ArrowSquareOut size={12} />
                </a>
              </div>
            )}
            <div>
              <p className="font-medium text-[var(--adm-ink)]">Category</p>
              <div className="mt-1 flex flex-wrap gap-1">
                {integration.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full border border-[var(--adm-border)] px-2 py-0.5 text-[11px] text-[var(--adm-text)]"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right panel */}
        <div className="flex flex-1 flex-col overflow-hidden">
          <div className="flex-1 overflow-y-auto p-6">
            <section className="mb-5">
              <h3 className="mb-2 text-[13px] font-semibold text-[var(--adm-ink)]">About</h3>
              <p className="text-[13px] leading-relaxed text-[var(--adm-muted)]">{integration.about}</p>
            </section>

            <section className="mb-5">
              <h3 className="mb-2 text-[13px] font-semibold text-[var(--adm-ink)]">How it Works</h3>
              <p className="text-[13px] leading-relaxed text-[var(--adm-muted)]">{integration.howItWorks}</p>
            </section>

            <section>
              <h3 className="mb-2 text-[13px] font-semibold text-[var(--adm-ink)]">Configuration Steps</h3>
              <ol className="flex flex-col gap-2">
                {integration.configSteps.map((step, i) => (
                  <li key={i} className="flex gap-2 text-[13px] text-[var(--adm-muted)]">
                    <span className="mt-0.5 shrink-0 font-medium text-[var(--adm-ink)]">{i + 1}.</span>
                    <span className="leading-relaxed">{step}</span>
                  </li>
                ))}
              </ol>
            </section>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 border-t border-[var(--adm-border)] px-6 py-4">
            <button
              type="button"
              className="rounded-full border border-[var(--adm-border)] px-5 py-2 text-[13px] font-medium text-[var(--adm-ink)] hover:bg-[var(--adm-bg)]"
              onClick={onClose}
            >
              Cancel
            </button>
            <button
              type="button"
              className="flex items-center gap-1.5 rounded-full px-5 py-2 text-[13px] font-semibold text-black transition-opacity hover:opacity-90"
              style={{ background: 'var(--adm-mint)' }}
              onClick={() => { onToggle(true); onClose() }}
            >
              Connect to {integration.name}
              <ArrowUpRight size={14} weight="bold" />
            </button>
          </div>
        </div>

        {/* Close button */}
        <button
          type="button"
          className="absolute right-4 top-4 flex size-8 items-center justify-center rounded-full hover:bg-[var(--adm-bg)]"
          onClick={onClose}
        >
          <X size={16} />
        </button>
      </div>
    </div>
  )
}

// ─── Main Page ───────────────────────────────────────────────────────────────
export default function IntegrationPage() {
  const [activeCategory, setActiveCategory] = useState('All')
  const [selected, setSelected] = useState(null)
  const [toggleMap, setToggleMap] = useState(() => {
    const m = {}
    integrations.forEach((i) => { m[i.id] = i.enabled })
    return m
  })

  const filtered = activeCategory === 'All'
    ? integrations
    : integrations.filter((i) => i.category === activeCategory)

  function handleToggle(id, value) {
    setToggleMap((prev) => ({ ...prev, [id]: value }))
  }

  return (
    <div className="mx-auto max-w-[1200px] p-6 lg:p-8">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-medium text-[var(--adm-ink)]">Integration</h1>
        <p className="mt-1 text-sm text-[var(--adm-muted)]">
          Connect your store to marketplaces, payments, etc — all from one place.
        </p>
      </div>

      {/* Filter bar */}
      <div className="mb-6 flex items-center gap-2 overflow-x-auto">
        <div className="flex flex-1 items-center gap-1">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setActiveCategory(cat)}
              className="whitespace-nowrap rounded-full px-4 py-1.5 text-[13px] font-medium transition-colors"
              style={
                activeCategory === cat
                  ? { background: 'var(--adm-forest-500)', color: '#fff' }
                  : { color: 'var(--adm-text)' }
              }
            >
              {cat}
            </button>
          ))}
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <button
            type="button"
            className="flex size-9 items-center justify-center rounded-full border border-[var(--adm-border)] bg-white hover:bg-[var(--adm-bg)]"
          >
            <MagnifyingGlass size={16} className="text-[var(--adm-muted)]" />
          </button>
          <button
            type="button"
            className="flex items-center gap-1.5 rounded-full border border-[var(--adm-border)] bg-white px-3 py-2 text-[13px] font-medium text-[var(--adm-text)] hover:bg-[var(--adm-bg)]"
          >
            <Funnel size={14} />
            Filter
          </button>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((integration) => (
          <IntegrationCard
            key={integration.id}
            integration={integration}
            enabled={toggleMap[integration.id]}
            onToggle={(val) => handleToggle(integration.id, val)}
            onOpen={setSelected}
          />
        ))}
      </div>

      {/* Detail Modal */}
      {selected && (
        <DetailModal
          integration={selected}
          enabled={toggleMap[selected.id]}
          onToggle={(val) => handleToggle(selected.id, val)}
          onClose={() => setSelected(null)}
        />
      )}
    </div>
  )
}
