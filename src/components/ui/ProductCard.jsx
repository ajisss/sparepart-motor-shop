import { Link } from 'react-router-dom'
import PriceTag from './PriceTag'
import Rating from './Rating'

export default function ProductCard({ product }) {
  return (
    <Link
      to={`/product/${product.id}`}
      className="group flex flex-col gap-5 rounded-md p-2 transition-colors hover:bg-neutral-25"
    >
      <div className="relative aspect-square w-full overflow-hidden rounded-md bg-neutral-50">
        <span
          aria-hidden="true"
          className="absolute left-1/2 top-1/2 size-2/3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-secondary-100/70 blur-2xl"
        />
        <img
          src={product.images?.[0]}
          alt={product.name}
          className="relative h-full w-full object-contain p-5 transition-transform duration-300 group-hover:scale-105"
        />
      </div>
      <div className="flex flex-col gap-3">
        <Rating value={product.rating} reviewCount={product.reviewCount} />
        <div className="flex flex-col gap-2">
          <span className="text-xs text-neutral-600">{product.brand}</span>
          <h3 className="text-lg font-semibold leading-tight tracking-tight text-neutral-900 line-clamp-2">
            {product.name}
          </h3>
        </div>
      </div>
      <PriceTag amount={product.price} />
    </Link>
  )
}
