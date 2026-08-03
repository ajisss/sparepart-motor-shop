import { useState } from 'react'

export default function Carousel({ images = [], alt = '' }) {
  const [active, setActive] = useState(0)
  if (!images.length) return null
  const current = images[Math.min(active, images.length - 1)]
  return (
    <div className="flex flex-col gap-3">
      <div className="aspect-square overflow-hidden rounded-md bg-neutral-50">
        <img src={current} alt={alt} className="h-full w-full object-contain" />
      </div>
      {images.length > 1 && (
        <div className="flex gap-2">
          {images.map((img, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setActive(i)}
              className={`h-16 w-16 overflow-hidden rounded-md border-2 ${
                i === active ? 'border-primary-600' : 'border-neutral-200'
              }`}
            >
              <img src={img} alt="" className="h-full w-full object-contain" />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
