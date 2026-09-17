import { Link } from "react-router-dom";
import {ArrowRight,ShieldCheck,Truck,RefreshCcw,Headphones,ChevronLeft,ChevronRight}from "lucide-react";
import { useEffect, useState } from "react";

import ProductCard from "../components/ProductCard";
import SectionTitle from "../components/SectionTitle";
import { SkeletonGrid } from "../components/SkeletonCard";
import { getalldata } from "../data/products";

const Home = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [currentPage, setCurrentPage] = useState(1);
  const productsPerPage = 8;

  const fetchData = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await getalldata();

      if (!res) {
        // getalldata() ne kuch return hi nahi kiya -> backend tak request pahonchi hi nahi
        setError(
          "Server se connect nahi ho paya. Check karo ki Back-End (npm start) chal raha hai aur Front-End ke .env me VITE_API_URL sahi hai."
        );
        return;
      }

      if (res.status === false) {
        setError(res.message || "Products load karne me error aayi.");
        return;
      }

      let dataList = [];
      if (res && res.data) {
        dataList = res.data;
      } else if (Array.isArray(res)) {
        dataList = res;
      }
      setProducts(dataList);

      if (dataList.length === 0) {
        setError(
          "Database me abhi koi product nahi mila. Back-End folder me 'npm run seed' chalao taaki sample products add ho jaayein, ya Admin Dashboard se product add karo."
        );
      }

      const uniqueCats = [...new Set(dataList.map((p) => p.category))].filter(Boolean);
      
      // Fallback if no categories are found from the backend yet
      if (uniqueCats.length === 0) {
        setCategories(["All", "Mobiles", "Fashion", "Electronics", "Beauty", "Home", "Sports", "Grocery"]);
      } else {
        setCategories(uniqueCats);
      }
    } catch (error) {
      console.error("Failed to fetch products", error);
      setError("Kuch galat ho gaya products load karte waqt. Browser console check karo.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Pagination Logic
  const indexOfLastProduct = currentPage * productsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
  const currentProducts = products.slice(indexOfFirstProduct, indexOfLastProduct);
  const totalPages = Math.ceil(products.length / productsPerPage);

  // Scroll to products section when page changes
  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
    document.getElementById("all-products-section")?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <>
      <section className="relative overflow-hidden bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-slate-950 dark:via-slate-900 dark:to-blue-950">
        <div className="max-w-7xl mx-auto px-4 py-16 md:py-24 grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <span className="inline-block px-4 py-2 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 font-semibold text-sm">
              Mega Sale Live Now
            </span>

            <h1 className="text-4xl md:text-6xl font-black leading-tight mt-5">
              Shop smarter with{" "}
              <span className="text-blue-600">Zenvy</span> modern store.
            </h1>

            <p className="text-lg text-slate-600 dark:text-slate-300 mt-5">
              Discover mobiles, fashion, electronics, home products and daily
              deals in one beautiful responsive e-commerce app.
            </p>

            <div className="flex flex-wrap gap-4 mt-8">
              <Link
                to="/products"
                className="px-6 py-3 rounded-2xl bg-blue-600 text-white font-bold flex items-center gap-2 hover:bg-blue-700 transition-colors"
              >
                Shop Now <ArrowRight />
              </Link>

              <Link
                to="/deals"
                className="px-6 py-3 rounded-2xl border border-slate-300 dark:border-slate-700 font-bold hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors"
              >
                View Deals
              </Link>
            </div>
          </div>

          <div className="relative">
            <div className="absolute inset-8 bg-blue-500 rounded-full blur-3xl opacity-20"></div>

            <img
              className="relative rounded-[2rem] shadow-soft w-full h-[420px] object-cover"
              src="https://images.unsplash.com/photo-1607083206869-4c7672e72a8a?w=1200"
              alt="Shopping"
            />
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 py-12 grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {[
          [Truck, "Free Delivery"],
          [ShieldCheck, "Secure Payment"],
          [RefreshCcw, "Easy Returns"],
          [Headphones, "24/7 Support"],
        ].map(([Icon, text]) => (
          <div
            key={text}
            className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-soft flex items-center gap-4 hover:-translate-y-1 transition-transform cursor-default"
          >
            <Icon className="text-blue-600" />
            <b>{text}</b>
          </div>
        ))}
      </section>

      <section className="max-w-7xl mx-auto px-4 py-10">
        <SectionTitle
          small="Categories"
          title="Shop by Category"
          text="Choose your favorite category and start shopping instantly."
        />

        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
          {categories.map((cat) => (
            <Link
              to={`/products?category=${cat}`}
              key={cat}
              className="bg-white dark:bg-slate-900 rounded-3xl p-5 text-center border border-slate-200 dark:border-slate-800 hover:-translate-y-1 duration-300 shadow-soft group"
            >
              <div className="w-14 h-14 rounded-2xl bg-blue-100 dark:bg-blue-950 mx-auto grid place-items-center text-blue-600 font-black group-hover:bg-blue-600 group-hover:text-white transition-colors duration-300">
                {cat[0]}
              </div>
              <p className="font-bold mt-3 text-sm group-hover:text-blue-600 transition-colors">{cat}</p>
            </Link>
          ))}
        </div>
      </section>

      <section id="all-products-section" className="max-w-7xl mx-auto px-4 py-12">
        <SectionTitle
          small="All Products"
          title="Explore Our Collection"
          text="Browse through all our products carefully selected for you."
        />

        {loading ? (
          <SkeletonGrid count={8} />
        ) : error ? (
          <div className="text-center py-16 bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-900 rounded-3xl px-6">
            <p className="text-amber-700 dark:text-amber-400 font-semibold max-w-xl mx-auto">{error}</p>
            <button
              onClick={fetchData}
              className="mt-4 px-5 py-2.5 rounded-2xl bg-blue-600 text-white font-bold hover:bg-blue-700 transition-colors"
            >
              Retry
            </button>
          </div>
        ) : products.length === 0 ? (
          <SkeletonGrid count={8} />
        ) : (
          <>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {currentProducts.map((p) => (
                <ProductCard key={p._id || p.id} product={p} />
              ))}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-2 mt-12">
                <button
                  onClick={() => handlePageChange(Math.max(currentPage - 1, 1))}
                  disabled={currentPage === 1}
                  className="flex items-center gap-1 px-4 py-3 rounded-xl bg-slate-100 dark:bg-slate-800 font-bold text-sm disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-200 dark:hover:bg-slate-700 transition-all duration-300"
                >
                  <ChevronLeft className="w-4 h-4" /> Prev
                </button>
                
                <div className="flex items-center gap-2 overflow-x-auto px-2 pb-2 sm:pb-0">
                  {[...Array(totalPages)].map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => handlePageChange(idx + 1)}
                      className={`w-11 h-11 flex-shrink-0 rounded-xl font-bold transition-all duration-300 ${
                        currentPage === idx + 1
                          ? "bg-blue-600 text-white shadow-lg shadow-blue-600/30 scale-105"
                          : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
                      }`}
                    >
                      {idx + 1}
                    </button>
                  ))}
                </div>

                <button
                  onClick={() => handlePageChange(Math.min(currentPage + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="flex items-center gap-1 px-4 py-3 rounded-xl bg-slate-100 dark:bg-slate-800 font-bold text-sm disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-200 dark:hover:bg-slate-700 transition-all duration-300"
                >
                  Next <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </>
        )}
      </section>
    </>
  );
};

export default Home;