import { Link, useParams } from "react-router-dom";
import type { CategoryResponse } from "../../../shared/types.js";
import { ProductSection } from "../components/Catalogue.js";
import { RequestState } from "../components/RequestState.js";
import { useRequest } from "../useRequest.js";

export function CategoryPage() {
  const { slug } = useParams();
  const { data, loading, error } = useRequest<CategoryResponse>(
    `/api/categories/${encodeURIComponent(slug ?? "")}`,
  );
  return (
    <RequestState loading={loading} error={error}>
      {data && (
        <>
          <div className="page-heading">
            <Link className="back" to="/">
              ← All categories
            </Link>
            <span className="eyebrow">Collection / {data.category.name}</span>
            <h1>{data.category.name}</h1>
            <p>Considered essentials, selected for the everyday.</p>
          </div>
          <ProductSection title="Top rated" products={data.topRated} />
          <ProductSection title="More to explore" products={data.additional} />
        </>
      )}
    </RequestState>
  );
}
