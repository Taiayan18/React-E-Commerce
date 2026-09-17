import { Link, useNavigate } from "react-router-dom";
import { ShoppingCart, Star, Eye, Heart } from "lucide-react";
import toast from "react-hot-toast";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { useWishlist } from "../context/WishlistContext";
import { getAverageRating } from "../data/reviews";

const ProductCard = ({ product }) => {
  const { addToCart } = useCart();
  const { isLoggedIn } = useAuth();
  const { isWishlisted, toggleWishlist } = useWishlist();
  const navigate = useNavigate();

  if (!product) return null;

  const id = product._id || product.id;
  const off = product.oldPrice && product.price
    ? Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100)
    : 0;
  const fallbackImage = "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=900";
  const inStock = product.inStock !== false; // default true jab tak explicitly false na ho
  const { average, count } = getAverageRating(id, product.rating || 4.5);
  const wishlisted = isWishlisted(id);

  const handleAddToCart = (e) => {
    e.preventDefault();
    if (!inStock) return;
    if (!isLoggedIn) {
      // Login nahi hai to login page pe bhejo, wapas yahan aane ke liye state bhi bhejo
      navigate("/login", {
        state: {
          message: "Please login or register to add items to your cart.",
          from: window.location.pathname,
        },
      });
      return;
    }
    addToCart(product);
    toast.success(`${product.name} added to cart`);
  };

  const handleWishlist = (e) => {
    e.preventDefault();
    if (!isLoggedIn) {
      navigate("/login", {
        state: {
          message: "Please login to save items to your wishlist.",
          from: window.location.pathname,
        },
      });
      return;
    }
    toggleWishlist(product);
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-soft border border-slate-200 dark:border-slate-800 overflow-hidden group hover:shadow-xl hover:border-blue-200 dark:hover:border-blue-900 transition-all duration-300 flex flex-col h-full relative transform hover:-translate-y-1">
      <Link
        to={`/products/${id}`}
        className="block relative h-56 overflow-hidden bg-slate-100 dark:bg-slate-800"
      >
        <img
          src={product.image || fallbackImage}
          alt={product.name || "Product"}
          className="w-full h-full object-contain transition-transform duration-700 group-hover:scale-110 p-3"
          onError={(e) => { e.target.src = fallbackImage; }}
        />
        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
          <div className="bg-white/90 text-slate-900 px-4 py-2 rounded-full font-semibold flex items-center gap-2 transform translate-y-4 group-hover:translate-y-0 transition-all duration-300 backdrop-blur-sm shadow-lg">
            <Eye className="w-4 h-4" /> View Info
          </div>
        </div>
        {product.tag && (
          <span className="absolute top-3 left-3 bg-blue-600/90 backdrop-blur-sm text-white text-xs px-3 py-1 rounded-full shadow-md font-medium tracking-wide">
            {product.tag}
          </span>
        )}
        {off > 0 && inStock && (
          <span className="absolute top-3 right-3 bg-red-500/90 backdrop-blur-sm text-white text-xs px-3 py-1 rounded-full shadow-md font-bold tracking-wide">
            {off}% OFF
          </span>
        )}
        {!inStock && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <span className="bg-white text-slate-900 text-sm px-4 py-1.5 rounded-full font-bold tracking-wide">
              Out of Stock
            </span>
          </div>
        )}
      </Link>

      <button
        onClick={handleWishlist}
        aria-label={wishlisted ? "Remove from wishlist" : "Add to wishlist"}
        className={`absolute top-3 z-10 p-2 rounded-full backdrop-blur-sm shadow-md transition-all duration-300 active:scale-90 ${
          off > 0 && inStock ? "right-3 top-14" : "right-3"
        } ${
          wishlisted
            ? "bg-red-500 text-white"
            : "bg-white/90 text-slate-500 hover:text-red-500"
        }`}
      >
        <Heart className={`w-4 h-4 ${wishlisted ? "fill-white" : ""}`} />
      </button>

      <div className="p-5 flex flex-col flex-grow">
        <div className="flex justify-between gap-3 mb-2">
          <p className="text-xs font-semibold text-blue-600 bg-blue-50 dark:bg-blue-900/30 px-2 py-1 rounded-md">
            {product.category || "General"}
          </p>
          <p className="flex items-center gap-1 text-sm font-medium text-slate-600 dark:text-slate-300">
            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
            {average}
            {count > 0 && <span className="text-slate-400">({count})</span>}
          </p>
        </div>

        <Link to={`/products/${id}`}>
          <h3 className="font-bold text-lg leading-tight mt-1 line-clamp-2 hover:text-blue-600 transition-colors duration-200">
            {product.name}
          </h3>
        </Link>

        <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 line-clamp-2 flex-grow">
          {product.description || "No description available for this product."}
        </p>

        <div className="flex items-center justify-between mt-5 pt-4 border-t border-slate-100 dark:border-slate-800">
          <div>
            <span className="text-xl font-black text-slate-900 dark:text-white">
              ₹{product.price}
            </span>
          </div>
          <button
            onClick={handleAddToCart}
            disabled={!inStock}
            className={`p-3 rounded-xl transition-all duration-300 active:scale-95 group/btn ${
              inStock
                ? "bg-slate-100 dark:bg-slate-800 text-blue-600 hover:bg-blue-600 hover:text-white dark:hover:bg-blue-600 hover:shadow-lg hover:shadow-blue-600/20"
                : "bg-slate-100 dark:bg-slate-800 text-slate-400 cursor-not-allowed opacity-60"
            }`}
            aria-label={inStock ? "Add to cart" : "Out of stock"}
          >
            <ShoppingCart className="w-5 h-5 transition-transform duration-300 group-hover/btn:scale-110" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
