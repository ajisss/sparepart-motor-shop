export default function SectionBanner({
  number,
  eyebrow,
  title,
  description,
  label,
  image,
  imageAlt = '',
}) {
  const titleId = `section-banner-${number}`

  return (
    <section
      aria-labelledby={titleId}
      className="relative mx-auto w-full max-w-6xl overflow-hidden rounded-2xl bg-neutral-900 px-6 py-8 text-neutral-0 lg:px-10 lg:py-12"
    >
      <div
        aria-hidden="true"
        className="absolute inset-0 opacity-[0.06] [background-image:linear-gradient(rgba(255,255,255,.7)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.7)_1px,transparent_1px)] [background-size:32px_32px]"
      />
      <div
        aria-hidden="true"
        className="absolute right-6 top-1/2 size-40 -translate-y-1/2 rounded-full bg-secondary-600 lg:right-16 lg:size-56"
      />
      <div className="relative z-10 max-w-[65%] lg:max-w-xl">
        <p className="text-xs font-medium uppercase tracking-[0.18em] text-secondary-600">
          {eyebrow} / {number}
        </p>
        <h1
          id={titleId}
          className="mt-3 text-2xl font-medium leading-tight tracking-tight lg:text-4xl"
        >
          {title}
        </h1>
        <p className="mt-3 max-w-md text-sm text-neutral-200 lg:text-base">{description}</p>
        {label && (
          <span className="mt-5 inline-flex rounded-pill bg-secondary-600 px-3 py-1.5 text-xs font-medium uppercase tracking-[0.12em] text-neutral-900">
            {label}
          </span>
        )}
      </div>
      <img
        src={image}
        alt={imageAlt}
        className="absolute bottom-[-8%] right-1 z-10 h-[72%] w-[42%] object-contain drop-shadow-2xl lg:right-8 lg:h-[88%]"
      />
      <span
        aria-hidden="true"
        className="absolute -bottom-8 right-2 text-8xl font-medium text-transparent [-webkit-text-stroke:1px_rgba(255,255,255,.16)] lg:right-6 lg:text-[10rem]"
      >
        {number}
      </span>
    </section>
  )
}
