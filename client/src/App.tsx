import { Link, Route, Routes } from "react-router-dom";
import { Layout } from "./components/Layout.js";
import { CategoryPage } from "./pages/CategoryPage.js";
import { HomePage } from "./pages/HomePage.js";
import { ProductPage } from "./pages/ProductPage.js";
import { SearchPage } from "./pages/SearchPage.js";

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
