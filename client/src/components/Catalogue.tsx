import { Link } from "react-router-dom";
import type { Product } from "../../../shared/types.js";

function ProductCard({ product }: { product: Product }) {
  return (
    <Link
      className="product-card"
      to={`/products/${encodeURIComponent(product.id)}`}
    >
      <div className="product-image">
        <img src={product.imageUrl} alt="" loading="lazy" />
      </div>
      <div className="product-info">
        <span className="eyebrow">{product.categoryName}</span>
        <h3>{product.title}</h3>
        <div className="product-meta">
          <span>
            {new Intl.NumberFormat("en-US", {
              style: "currency",
              currency: product.currency,
            }).format(product.price)}
          </span>
          <span aria-label={`Rated ${product.rating ?? "unrated"} out of 5`}>
            ★ {product.rating?.toFixed(1)}
          </span>
        </div>
      </div>
    </Link>
  );
}

export function ProductSection({
  title,
  intro,
  products,
}: {
  title: string;
  intro?: string;
  products: Product[];
}) {
  return (
    <section className="section">
      <div className="section-heading">
        <div>
          <span className="eyebrow">The collection</span>
          <h2>{title}</h2>
          {intro && <p>{intro}</p>}
        </div>
        <span className="count">{products.length} items</span>
      </div>
      {products.length ? (
        <div className="product-grid">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <p className="empty">No products to show yet.</p>
      )}
    </section>
  );
}
