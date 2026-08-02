// Abstract, brand-token-only hero panel for the auth screens.
// Intentionally not a photo or illustration — the Figma reference for these
// screens used stock skincare/beauty photography, which doesn't belong on a
// motorcycle spare parts shop. This mirrors the flat placeholder-SVG pattern
// already used for product imagery (see public/products/*.svg): a plain
// geometric treatment built only from this project's real Tailwind tokens.
export default function AuthHeroPanel({ step }) {
  return (
    <div className="relative flex h-full w-full flex-col justify-between overflow-hidden rounded-2xl bg-primary-100 p-6">
      <svg
        className="absolute inset-0 size-full"
        viewBox="0 0 468 661"
        preserveAspectRatio="xMidYMid slice"
        aria-hidden="true"
      >
        <circle cx="392" cy="70" r="220" className="fill-primary-200" fillOpacity="0.6" />
        <circle cx="40" cy="590" r="260" className="fill-primary-600" fillOpacity="0.12" />
        <circle cx="234" cy="330" r="150" className="fill-none stroke-primary-900" strokeOpacity="0.12" strokeWidth="2" />
        <circle cx="234" cy="330" r="100" className="fill-none stroke-primary-900" strokeOpacity="0.12" strokeWidth="2" />
        <circle cx="234" cy="330" r="50" className="fill-none stroke-primary-900" strokeOpacity="0.12" strokeWidth="2" />
      </svg>

      <div className="relative z-10 flex items-center justify-between">
        <span className="text-lg font-semibold tracking-tight text-neutral-900">MotoPart</span>
      </div>

      <div className="relative z-10 flex items-center gap-4">
        <span className="text-[28px] font-medium tracking-[-0.56px] text-primary-700">{step}</span>
        <span className="h-px flex-1 bg-primary-900/30" />
      </div>
    </div>
  )
}
