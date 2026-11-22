import { useSearchParams } from "react-router-dom";
import type { Product } from "../../../shared/types.js";
import { ProductSection } from "../components/Catalogue.js";
import { RequestState } from "../components/RequestState.js";
import { useRequest } from "../useRequest.js";

export function SearchPage() {
  const [params] = useSearchParams();
  const query = params.get("q")?.trim() ?? "";
  const { data, loading, error } = useRequest<{ products: Product[] }>(
    `/api/products?q=${encodeURIComponent(query)}`,
  );
  return (
    <>
      <div className="page-heading">
        <span className="eyebrow">Search</span>
        <h1>{query ? `Results for “${query}”` : "All products"}</h1>
        <p>
          {query
            ? "Only products matching your search are shown."
            : "Browse the full collection or enter a keyword to narrow it down."}
        </p>
      </div>
      <RequestState loading={loading} error={error}>
        {data &&
          (data.products.length ? (
            <ProductSection
              title={query ? "Matching products" : "All products"}
              products={data.products}
            />
          ) : (
            <div className="status">
              No products match “{query}”. Try another term.
            </div>
          ))}
      </RequestState>
    </>
  );
}
