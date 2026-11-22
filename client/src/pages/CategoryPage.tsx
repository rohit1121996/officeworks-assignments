import { useParams } from "react-router-dom";
import type { CategoryResponse } from "../../../shared/types.js";
import { Breadcrumbs } from "../components/Breadcrumbs.js";
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
            <Breadcrumbs
              links={[{ label: "Home", to: "/" }]}
              current={data.category.name}
            />
            <span className="eyebrow">Collection</span>
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
