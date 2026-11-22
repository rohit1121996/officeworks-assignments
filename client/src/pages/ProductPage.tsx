import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import type { Product } from "../../../shared/types.js";
import { EnquiryForm } from "../components/EnquiryForm.js";
import { RequestState } from "../components/RequestState.js";
import { useRequest } from "../useRequest.js";

export function ProductPage() {
  const { id } = useParams();
  const { data, loading, error } = useRequest<Product>(
    `/api/products/${encodeURIComponent(id ?? "")}`,
  );
  const [showForm, setShowForm] = useState(false);
  useEffect(() => {
    if (showForm) {
      document.querySelector<HTMLInputElement>("#enquiry input[name='name']")?.focus();
    }
  }, [showForm]);
  return (
    <RequestState loading={loading} error={error}>
      {data && (
        <>
          <nav className="breadcrumbs" aria-label="Breadcrumb">
            <ol>
              <li>
                <Link to="/">Home</Link>
              </li>
              <li>
                <Link to={`/categories/${data.categorySlug}`}>
                  {data.categoryName}
                </Link>
              </li>
              <li aria-current="page">{data.title}</li>
            </ol>
          </nav>
          <div className="product-detail">
            <div className="detail-image">
              <img
                src={data.imageUrl}
                alt={`${data.title} product illustration`}
              />
            </div>
            <div className="detail-copy">
              <span className="eyebrow">{data.categoryName}</span>
              <h1>{data.title}</h1>
              <div className="detail-rating">
                ★ {data.rating?.toFixed(1)}{" "}
                <span>Top quality, thoughtfully selected</span>
              </div>
              <p className="detail-price">
                {new Intl.NumberFormat("en-US", {
                  style: "currency",
                  currency: data.currency,
                }).format(data.price)}
              </p>
              <p className="detail-description">{data.description}</p>
              <div className="detail-divider" />
              <p className="detail-note">
                Interested in this piece? Our team can help with availability
                and details.
              </p>
              <button
                className="button dark"
                onClick={() => setShowForm(true)}
                type="button"
              >
                Enquire about this product ↗
              </button>
            </div>
          </div>
          {showForm && (
            <div id="enquiry">
              <EnquiryForm product={data} />
            </div>
          )}
        </>
      )}
    </RequestState>
  );
}
