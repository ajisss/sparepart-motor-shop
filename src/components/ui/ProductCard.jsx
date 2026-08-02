import { Link } from 'react-router-dom'
import PriceTag from './PriceTag'
import Rating from './Rating'

export default function ProductCard({ product }) {
  return (
    <Link
      to={`/product/${product.id}`}
      className="group flex flex-col gap-5 rounded-md p-2 transition-colors hover:bg-neutral-25"
    >
      <div className="aspect-square w-full overflow-hidden rounded-md bg-neutral-100">
        <img
          src={product.image}
          alt={product.name}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
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
