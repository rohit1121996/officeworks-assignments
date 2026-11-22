import { Link } from "react-router-dom";
import type { HomeResponse } from "../../../shared/types.js";
import { ProductSection } from "../components/Catalogue.js";
import { RequestState } from "../components/RequestState.js";
import { useRequest } from "../useRequest.js";

export function HomePage() {
  const { data, loading, error } = useRequest<HomeResponse>("/api/home");
  return (
    <RequestState loading={loading} error={error}>
      {data && (
        <>
          <section className="hero">
            <div className="hero-copy">
              <span className="eyebrow">A curated product catalogue</span>
              <h1>
                Better things for
                <br />
                <em>everyday living.</em>
              </h1>
              <p>
                Discover useful, beautiful pieces chosen for the way you work,
                rest, and explore.
              </p>
              <a className="button light" href="#featured">
                Explore top picks <span aria-hidden="true">↗</span>
              </a>
            </div>
            <div className="hero-art" aria-hidden="true">
              <div className="sun" />
              <div className="arch" />
              <div className="hero-mark">A</div>
            </div>
          </section>
          <section id="categories" className="category-section">
            <div className="section-heading">
              <div>
                <span className="eyebrow">Find your fit</span>
                <h2>Explore by category</h2>
              </div>
            </div>
            <div className="category-grid">
              {data.categories.map((category, index) => (
                <Link
                  key={category.slug}
                  className={`category-tile tile-${index}`}
                  to={`/categories/${category.slug}`}
                >
                  <span>0{index + 1}</span>
                  <strong>{category.name}</strong>
                  <span aria-hidden="true">↗</span>
                </Link>
              ))}
            </div>
          </section>
          <div id="featured">
            <ProductSection
              title="The top-rated edit"
              intro="Five favourites, hand-picked for this collection."
              products={data.topRated}
            />
          </div>
        </>
      )}
    </RequestState>
  );
}
