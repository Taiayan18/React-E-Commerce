import { useState, useEffect } from "react";
import ProductCard from "../components/ProductCard";
import { getalldata } from "../data/products";

const Deals = () => {
  const [deals, setDeals] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDeals = async () => {
      try {
        const data = await getalldata();
        let productsList = [];
        if (data && data.data) {
          productsList = data.data;
        } else if (Array.isArray(data)) {
          productsList = data;
        }
        
        // Ensure oldPrice exists before calculating
        const dealsList = productsList.filter(
          (p) => p.oldPrice && p.price && ((p.oldPrice - p.price) / p.oldPrice) * 100 >= 60
        );
        setDeals(dealsList);
      } catch (error) {
        console.error("Failed to fetch deals", error);
      } finally {
        setLoading(false);
      }
    };
    fetchDeals();
  }, []);

  return (
    <section className="max-w-7xl mx-auto px-4 py-10">
      <h1 className="text-4xl font-black">Deals 60% Off</h1>
      <p className="text-slate-500 mt-2 mb-8">
        Only products with 60% or more discount.
      </p>
      
      {loading ? (
        <div className="text-center py-20">Loading deals...</div>
      ) : deals.length > 0 ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {deals.map((p) => (
            <ProductCard key={p._id || p.id} product={p} />
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-white dark:bg-slate-900 rounded-3xl">
          No deals currently available.
        </div>
      )}
    </section>
  );
};
export default Deals;
