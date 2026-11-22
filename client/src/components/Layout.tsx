import { useEffect, useState, type FormEvent, type ReactNode } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";

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

export function Layout({ children }: { children: ReactNode }) {
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
