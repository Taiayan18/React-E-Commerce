import { Link } from "react-router-dom";
import { Heart } from "lucide-react";
import { useWishlist } from "../context/WishlistContext";
import ProductCard from "../components/ProductCard";

const Wishlist = () => {
  const { wishlist, clearWishlist } = useWishlist();

  if (!wishlist.length) {
    return (
      <section className="max-w-7xl mx-auto px-4 py-20 text-center">
        <Heart className="w-14 h-14 mx-auto text-slate-300 dark:text-slate-700" />
        <h1 className="text-4xl font-black mt-4">Your Wishlist is Empty</h1>
        <p className="text-slate-500 mt-3">Save products you like by tapping the heart icon.</p>
        <Link
          to="/products"
          className="inline-block mt-6 px-6 py-3 bg-blue-600 text-white rounded-2xl font-bold hover:bg-blue-700 transition-colors"
        >
          Browse Products
        </Link>
      </section>
    );
  }

  return (
    <section className="max-w-7xl mx-auto px-4 py-10">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-4xl font-black flex items-center gap-3">
            <Heart className="text-red-500 fill-red-500" /> My Wishlist
          </h1>
          <p className="text-slate-500 mt-2">{wishlist.length} item(s) saved</p>
        </div>
        <button
          onClick={clearWishlist}
          className="px-4 py-2 rounded-2xl bg-slate-100 dark:bg-slate-800 font-bold text-sm hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
        >
          Clear All
        </button>
      </div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {wishlist.map((p) => (
          <ProductCard key={p._id || p.id} product={p} />
        ))}
      </div>
    </section>
  );
};

export default Wishlist;
