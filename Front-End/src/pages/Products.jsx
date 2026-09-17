import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { SlidersHorizontal, X } from "lucide-react";
import ProductCard from "../components/ProductCard";
import { SkeletonGrid } from "../components/SkeletonCard";
import { getalldata } from "../data/products";

const DEFAULT_CATEGORIES = [
  "Mobiles", "Fashion", "Electronics", "Beauty", "Home", "Sports", "Grocery"
];

// Category strings admin dashboard se free-text me aate hain, isliye case aur
// extra spaces alag ho sakte hain (e.g. "Fashion" vs "fashion "). Compare karte
// waqt hamesha trim + lowercase karke hi match karo.
const normalize = (str) => (str || "").trim().toLowerCase();

const Products = () => {
  const [params, setParams] = useSearchParams();
  const [category, setCategory] = useState(params.get("category") || "All");
  const [search, setSearch] = useState(params.get("search") || "");
  const [sort, setSort] = useState("default");
  // maxPrice null = koi price limit nahi (user ne slider touch nahi kiya)
  const [maxPrice, setMaxPrice] = useState(null);
  const [minRating, setMinRating] = useState(0);
  const [showFilters, setShowFilters] = useState(false);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Dropdown ki category list actual database se banate hain, taaki dropdown me
  // wahi values ho jo products me sach me exist karti hain.
  const categories = useMemo(() => {
    if (!products.length) return ["All", ...DEFAULT_CATEGORIES];
    const seen = new Map();
    products.forEach((p) => {
      const key = normalize(p.category);
      if (key && !seen.has(key)) seen.set(key, p.category.trim());
    });
    return ["All", ...seen.values()];
  }, [products]);

  // Actual products ke price ke hisaab se slider ki upper limit nikalte hain,
  // taaki koi bhi product hidden na ho jaaye kisi hardcoded limit ki wajah se
  const priceCeiling = useMemo(() => {
    if (!products.length) return 50000;
    return Math.max(...products.map((p) => p.price || 0));
  }, [products]);

  const effectiveMaxPrice = maxPrice ?? priceCeiling;

  const fetchProducts = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await getalldata();
      if (!data) {
        setError("Server se connect nahi ho paya. Back-End (npm start) running hai check karo.");
        return;
      }
      if (data.status === false) {
        setError(data.message || "Products load karne me error aayi.");
        return;
      }
      let list = [];
      if (data && data.data) list = data.data;
      else if (Array.isArray(data)) list = data;
      setProducts(list);
      if (list.length === 0) {
        setError("Database me abhi koi product nahi mila. Back-End folder me 'npm run seed' chalao.");
      }
    } catch (error) {
      console.error("Failed to fetch products", error);
      setError("Kuch galat ho gaya products load karte waqt.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // Sync local state whenever URL params change (e.g. header search or category link)
  useEffect(() => {
    const urlSearch = params.get("search") || "";
    const urlCategory = params.get("category") || "All";
    setSearch(urlSearch);
    setCategory(urlCategory);
  }, [params]);

  const updateSearch = (value) => {
    setSearch(value);
    const next = new URLSearchParams(params);
    if (value) next.set("search", value); else next.delete("search");
    setParams(next, { replace: true });
  };

  const resetFilters = () => {
    setCategory("All");
    setSearch("");
    setSort("default");
    setMaxPrice(null);
    setMinRating(0);
    setParams({});
  };

  const filtered = useMemo(() => {
    let data = products.filter(
      (p) =>
        (category === "All" || normalize(p.category) === normalize(category)) &&
        (p.name || "").toLowerCase().includes(search.toLowerCase()) &&
        (p.price || 0) <= effectiveMaxPrice &&
        (p.rating || 4.5) >= minRating,
    );
    if (sort === "low") data.sort((a, b) => a.price - b.price);
    if (sort === "high") data.sort((a, b) => b.price - a.price);
    if (sort === "rating") data.sort((a, b) => (b.rating || 4.5) - (a.rating || 4.5));
    return data;
  }, [products, category, search, sort, effectiveMaxPrice, minRating]);

  const activeFilterCount =
    (category !== "All" ? 1 : 0) + (maxPrice !== null && maxPrice < priceCeiling ? 1 : 0) + (minRating > 0 ? 1 : 0);

  return (
    <section className="max-w-7xl mx-auto px-4 py-10">
      <div className="flex flex-col lg:flex-row justify-between gap-4 mb-8">
        <div>
          <h1 className="text-4xl font-black">All Products</h1>
          <p className="text-slate-500 mt-2">
            Search, filter and sort products.
          </p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3 w-full lg:w-auto">
          <input
            value={search}
            onChange={(e) => updateSearch(e.target.value)}
            placeholder="Search product"
            className="px-4 py-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 outline-none"
          />
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="px-4 py-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 outline-none"
          >
            {categories.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="px-4 py-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 outline-none"
          >
            <option value="default">Default</option>
            <option value="low">Price Low to High</option>
            <option value="high">Price High to Low</option>
            <option value="rating">Top Rated</option>
          </select>
          <button
            onClick={() => setShowFilters((v) => !v)}
            className="px-4 py-3 rounded-2xl bg-blue-600 text-white font-bold flex items-center justify-center gap-2 hover:bg-blue-700 transition-colors relative"
          >
            <SlidersHorizontal className="w-4 h-4" /> Filters
            {activeFilterCount > 0 && (
              <span className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-red-500 text-xs grid place-items-center">
                {activeFilterCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {showFilters && (
        <div className="mb-8 bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 grid sm:grid-cols-2 gap-8">
          <div>
            <div className="flex justify-between mb-2">
              <label className="font-bold text-sm">Max Price</label>
              <span className="text-blue-600 font-bold">₹{effectiveMaxPrice.toLocaleString("en-IN")}</span>
            </div>
            <input
              type="range"
              min={500}
              max={priceCeiling}
              step={500}
              value={effectiveMaxPrice}
              onChange={(e) => setMaxPrice(Number(e.target.value))}
              className="w-full accent-blue-600"
            />
          </div>
          <div>
            <label className="font-bold text-sm block mb-2">Minimum Rating</label>
            <div className="flex gap-2">
              {[0, 3, 3.5, 4, 4.5].map((r) => (
                <button
                  key={r}
                  onClick={() => setMinRating(r)}
                  className={`px-3 py-2 rounded-xl text-sm font-bold transition-colors ${
                    minRating === r
                      ? "bg-blue-600 text-white"
                      : "bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700"
                  }`}
                >
                  {r === 0 ? "Any" : `${r}+ ★`}
                </button>
              ))}
            </div>
          </div>
          {activeFilterCount > 0 && (
            <button
              onClick={resetFilters}
              className="sm:col-span-2 flex items-center justify-center gap-2 text-sm font-bold text-red-600 hover:text-red-700"
            >
              <X className="w-4 h-4" /> Clear all filters
            </button>
          )}
        </div>
      )}

      {loading ? (
        <SkeletonGrid count={8} />
      ) : error ? (
        <div className="text-center py-16 bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-900 rounded-3xl px-6">
          <p className="text-amber-700 dark:text-amber-400 font-semibold max-w-xl mx-auto">{error}</p>
          <button
            onClick={fetchProducts}
            className="mt-4 px-5 py-2.5 rounded-2xl bg-blue-600 text-white font-bold hover:bg-blue-700 transition-colors"
          >
            Retry
          </button>
        </div>
      ) : filtered.length ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {filtered.map((p) => (
            <ProductCard key={p._id || p.id} product={p} />
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-white dark:bg-slate-900 rounded-3xl">
          No product found
        </div>
      )}
    </section>
  );
};
export default Products;
