import { useEffect, useState, type FormEvent, type ReactNode } from "react";
import {
  Link,
  Route,
  Routes,
  useLocation,
  useNavigate,
  useParams,
  useSearchParams,
} from "react-router-dom";
import type {
  CategoryResponse,
  Enquiry,
  HomeResponse,
  Product,
} from "../../shared/types.js";

async function getJson<T>(path: string, signal?: AbortSignal): Promise<T> {
  const response = await fetch(path, { signal });
  if (!response.ok)
    throw new Error(
      response.status === 404
        ? "This page could not be found."
        : "Something went wrong. Please try again.",
    );
  return response.json() as Promise<T>;
}

function useRequest<T>(path: string) {
  const [state, setState] = useState<{
    data?: T;
    error?: string;
    loading: boolean;
  }>({ loading: true });
  useEffect(() => {
    const controller = new AbortController();
    setState({ loading: true });
    getJson<T>(path, controller.signal)
      .then((data) => setState({ data, loading: false }))
      .catch((error) => {
        if (!controller.signal.aborted)
          setState({ error: error.message, loading: false });
      });
    return () => controller.abort();
  }, [path]);
  return state;
}

function SearchBox() {
  const navigate = useNavigate();
  const location = useLocation();
  const [value, setValue] = useState("");
  useEffect(() => {
    setValue(
      location.pathname === "/search"
        ? new URLSearchParams(location.search).get("q") ?? ""
        : "",
    );
  }, [location.pathname, location.search]);
  function submit(event: FormEvent) {
    event.preventDefault();
    navigate(
      value.trim()
        ? `/search?q=${encodeURIComponent(value.trim())}`
        : "/search",
    );
  }
  return (
    <form className="search-box" role="search" onSubmit={submit}>
      <label className="sr-only" htmlFor="site-search">
        Search products
      </label>
      <input
        id="site-search"
        value={value}
        onChange={(event) => setValue(event.target.value)}
        placeholder="Search the collection"
        maxLength={120}
      />
      <button type="submit" aria-label="Search products">
        Search <span aria-hidden="true">↗</span>
      </button>
    </form>
  );
}

function Layout({ children }: { children: ReactNode }) {
  return (
    <>
      <header className="site-header">
        <div className="shell header-inner">
          <Link className="brand" to="/" aria-label="Aster and Co. home">
            aster<span> & </span>co.
          </Link>
          <nav aria-label="Main navigation">
            <Link to="/">Home</Link>
            <a href="/#categories">Categories</a>
          </nav>
          <SearchBox />
        </div>
      </header>
      <main id="main" className="shell">
        {children}
      </main>
      <footer className="site-footer">
        <div className="shell footer-inner">
          <span>aster & co.</span>
          <span>Good things, thoughtfully found.</span>
        </div>
      </footer>
    </>
  );
}

function State({
  loading,
  error,
  children,
}: {
  loading: boolean;
  error?: string;
  children: ReactNode;
}) {
  if (loading)
    return (
      <div className="status" role="status">
        Loading the collection…
      </div>
    );
  if (error)
    return (
      <div className="status error" role="alert">
        <p>{error}</p>
        <button onClick={() => location.reload()}>Try again</button>
      </div>
    );
  return <>{children}</>;
}

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

function ProductSection({
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

function HomePage() {
  const { data, loading, error } = useRequest<HomeResponse>("/api/home");
  return (
    <State loading={loading} error={error}>
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
    </State>
  );
}

function CategoryPage() {
  const { slug } = useParams();
  const { data, loading, error } = useRequest<CategoryResponse>(
    `/api/categories/${encodeURIComponent(slug ?? "")}`,
  );
  return (
    <State loading={loading} error={error}>
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
    </State>
  );
}

function SearchPage() {
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
      <State loading={loading} error={error}>
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
      </State>
    </>
  );
}

function EnquiryForm({ product }: { product: Product }) {
  const [state, setState] = useState<"idle" | "sending" | "sent">("idle");
  const [error, setError] = useState("");
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (state === "sending") return;
    const form = event.currentTarget;
    const fields = new FormData(form);
    const body: Enquiry = {
      productId: product.id,
      name: String(fields.get("name") || "").trim(),
      email: String(fields.get("email") || "").trim(),
      phone: String(fields.get("phone") || "").trim(),
      message: String(fields.get("message") || "").trim(),
    };
    setState("sending");
    setError("");
    try {
      const response = await fetch("/api/enquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!response.ok)
        throw new Error(
          response.status === 429
            ? "Too many attempts. Please wait a minute and try again."
            : "We could not send your enquiry. Please try again.",
        );
      setState("sent");
    } catch (failure) {
      setError(
        failure instanceof Error ? failure.message : "Something went wrong.",
      );
      setState("idle");
    }
  }
  if (state === "sent")
    return (
      <div className="thank-you" role="status">
        <span aria-hidden="true">✓</span>
        <h2>Thank you for your enquiry.</h2>
        <p>We’ve passed your message to our sales team.</p>
        <Link to="/">Continue browsing →</Link>
      </div>
    );
  return (
    <form className="enquiry-form" onSubmit={submit}>
      <h2>Enquire about this product</h2>
      <p>Leave your contact details and our team will follow up.</p>
      <div className="form-row">
        <label>
          Name{" "}
          <input
            name="name"
            autoComplete="name"
            required
            minLength={2}
            maxLength={100}
          />
        </label>
        <label>
          Email{" "}
          <input
            name="email"
            type="email"
            autoComplete="email"
            required
            maxLength={254}
          />
        </label>
      </div>
      <label>
        Phone <span>(optional)</span>
        <input name="phone" type="tel" autoComplete="tel" maxLength={30} />
      </label>
      <label>
        Message <span>(optional)</span>
        <textarea
          name="message"
          rows={4}
          maxLength={2000}
          placeholder="Anything you'd like us to know?"
        />
      </label>
      {error && (
        <p className="form-error" role="alert">
          {error}
        </p>
      )}
      <button
        className="button dark"
        type="submit"
        disabled={state === "sending"}
      >
        {state === "sending" ? "Sending…" : "Send enquiry ↗"}
      </button>
    </form>
  );
}

function ProductPage() {
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
    <State loading={loading} error={error}>
      {data && (
        <>
          <div className="breadcrumbs">
            <Link to="/">Home</Link>
            <span>/</span>
            <Link to={`/categories/${data.categorySlug}`}>
              {data.categoryName}
            </Link>
            <span>/</span>
            <span>{data.title}</span>
          </div>
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
    </State>
  );
}

export function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/categories/:slug" element={<CategoryPage />} />
        <Route path="/search" element={<SearchPage />} />
        <Route path="/products/:id" element={<ProductPage />} />
        <Route
          path="*"
          element={
            <div className="status">
              <h1>Page not found</h1>
              <Link to="/">Back to home</Link>
            </div>
          }
        />
      </Routes>
    </Layout>
  );
}
