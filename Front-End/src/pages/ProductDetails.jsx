import { useParams, Link, useNavigate } from "react-router-dom";
import { Star, ShoppingCart, ArrowLeft, Minus, Plus, Heart } from "lucide-react";
import { useCart } from "../context/CartContext";
import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { getalldata } from "../data/products";
import { useAuth } from "../context/AuthContext";
import { useWishlist } from "../context/WishlistContext";
import { getReviews, addReview, getAverageRating } from "../data/reviews";
import { getRecentlyViewed, addRecentlyViewed } from "../data/recentlyViewed";
import StarRating from "../components/StarRating";
import ProductCard from "../components/ProductCard";
import ImageGallery from "../components/ImageGallery";

const fallbackImage = "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=900";

const ProductDetails = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [allProducts, setAllProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [qty, setQty] = useState(1);
  const { addToCart } = useCart();
  const { isLoggedIn } = useAuth();
  const { isWishlisted, toggleWishlist } = useWishlist();
  const navigate = useNavigate();

  const [reviews, setReviews] = useState([]);
  const [reviewForm, setReviewForm] = useState({ name: "", rating: 5, comment: "" });
  const [recentlyViewed, setRecentlyViewed] = useState([]);

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      setQty(1);
      try {
        const data = await getalldata();
        let productsList = [];
        if (data && data.data) {
          productsList = data.data;
        } else if (Array.isArray(data)) {
          productsList = data;
        }
        setAllProducts(productsList);

        // Find product by id or _id
        const found = productsList.find((p) => p._id === id || String(p.id) === String(id));
        setProduct(found);

        if (found) {
          addRecentlyViewed(found);
          setReviews(getReviews(id));
        }
        setRecentlyViewed(getRecentlyViewed().filter((p) => (p._id || p.id) !== id));
      } catch (error) {
        console.error("Failed to fetch product", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [id]);

  if (loading) {
    return (
      <section className="max-w-7xl mx-auto px-4 py-10">
        <div className="grid lg:grid-cols-2 gap-10 bg-white dark:bg-slate-900 rounded-[2rem] p-5 md:p-8 border border-slate-200 dark:border-slate-800 animate-pulse">
          <div className="w-full h-[360px] md:h-[520px] rounded-[2rem] bg-slate-200 dark:bg-slate-800" />
          <div className="space-y-4 flex flex-col justify-center">
            <div className="h-4 w-24 bg-slate-200 dark:bg-slate-800 rounded-full" />
            <div className="h-10 w-3/4 bg-slate-200 dark:bg-slate-800 rounded-xl" />
            <div className="h-4 w-1/2 bg-slate-200 dark:bg-slate-800 rounded-full" />
            <div className="h-20 w-full bg-slate-200 dark:bg-slate-800 rounded-xl" />
            <div className="h-12 w-40 bg-slate-200 dark:bg-slate-800 rounded-2xl" />
          </div>
        </div>
      </section>
    );
  }

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">Product not found</div>
    );
  }

  const inStock = product.inStock !== false;
  const wishlisted = isWishlisted(id);
  const { average, count } = getAverageRating(id, product.rating || 4.5);

  const relatedProducts = allProducts
    .filter((p) => (p._id || p.id) !== id && p.category === product.category)
    .slice(0, 4);

  const handleAddToCart = () => {
    if (!inStock) return;
    if (!isLoggedIn) {
      navigate("/login", {
        state: {
          message: "Please login or register to add items to your cart.",
          from: window.location.pathname,
        },
      });
      return;
    }
    for (let i = 0; i < qty; i++) addToCart(product);
    toast.success(`${qty} × ${product.name} added to cart`);
  };

  const handleWishlist = () => {
    if (!isLoggedIn) {
      navigate("/login", {
        state: { message: "Please login to save items to your wishlist.", from: window.location.pathname },
      });
      return;
    }
    toggleWishlist(product);
  };

  const handleReviewSubmit = (e) => {
    e.preventDefault();
    if (!reviewForm.comment.trim()) {
      toast.error("Please write a short comment");
      return;
    }
    const saved = addReview(id, {
      name: reviewForm.name.trim() || "Anonymous",
      rating: reviewForm.rating,
      comment: reviewForm.comment.trim(),
    });
    setReviews((prev) => [saved, ...prev]);
    setReviewForm({ name: "", rating: 5, comment: "" });
    toast.success("Thanks for your review!");
  };

  return (
    <section className="max-w-7xl mx-auto px-4 py-10">
      <Link
        to="/products"
        className="inline-flex gap-2 items-center mb-6 text-blue-600 font-bold"
      >
        <ArrowLeft /> Back
      </Link>
      <div className="grid lg:grid-cols-2 gap-10 bg-white dark:bg-slate-900 rounded-[2rem] p-5 md:p-8 border border-slate-200 dark:border-slate-800 shadow-soft">
        <div className="relative">
          <ImageGallery
            images={[product.image, ...(Array.isArray(product.images) ? product.images : [])].filter(Boolean)}
            alt={product.name}
          />
          <button
            onClick={handleWishlist}
            aria-label={wishlisted ? "Remove from wishlist" : "Add to wishlist"}
            className={`absolute top-4 right-4 p-3 rounded-full shadow-md transition-all duration-300 active:scale-90 z-10 ${
              wishlisted ? "bg-red-500 text-white" : "bg-white/90 text-slate-500 hover:text-red-500"
            }`}
          >
            <Heart className={`w-5 h-5 ${wishlisted ? "fill-white" : ""}`} />
          </button>
        </div>
        <div className="flex flex-col justify-center">
          <p className="text-blue-600 font-bold">{product.category}</p>
          <h1 className="text-3xl md:text-5xl font-black mt-3">
            {product.name}
          </h1>
          <p className="flex items-center gap-2 mt-4">
            <Star className="fill-yellow-400 text-yellow-400" />{" "}
            {average} Rating {count > 0 && <span className="text-slate-400">({count} reviews)</span>} •{" "}
            {inStock ? (
              <span className="text-green-600 font-semibold">In Stock</span>
            ) : (
              <span className="text-red-600 font-semibold">Out of Stock</span>
            )}
          </p>
          <p className="text-slate-600 dark:text-slate-300 mt-6 text-lg">
            {product.desc || product.description}
          </p>
          <div className="mt-7">
            <span className="text-4xl font-black">₹{product.price}</span>
            {product.oldPrice && (
              <span className="text-xl text-slate-400 line-through ml-3">
                ₹{product.oldPrice}
              </span>
            )}
          </div>

          {inStock && (
            <div className="flex items-center gap-3 mt-6 bg-slate-50 dark:bg-slate-800/60 rounded-2xl p-1 w-fit">
              <button
                onClick={() => setQty((q) => Math.max(1, q - 1))}
                className="p-3 rounded-xl bg-white dark:bg-slate-800 shadow-sm hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
              >
                <Minus size={16} />
              </button>
              <b className="w-8 text-center text-lg">{qty}</b>
              <button
                onClick={() => setQty((q) => q + 1)}
                className="p-3 rounded-xl bg-white dark:bg-slate-800 shadow-sm hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
              >
                <Plus size={16} />
              </button>
            </div>
          )}

          <button
            onClick={handleAddToCart}
            disabled={!inStock}
            className={`mt-6 px-6 py-4 rounded-2xl font-bold flex items-center justify-center gap-2 ${
              !inStock
                ? "bg-slate-300 dark:bg-slate-700 text-slate-500 cursor-not-allowed"
                : "bg-blue-600 text-white hover:bg-blue-700"
            }`}
          >
            <ShoppingCart /> {!inStock ? "Out of Stock" : `Add to Cart • ₹${product.price * qty}`}
          </button>
        </div>
      </div>

      {/* Reviews Section */}
      <div className="mt-14 grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <h2 className="text-2xl font-black mb-6">Customer Reviews ({reviews.length})</h2>
          {reviews.length === 0 ? (
            <p className="text-slate-500">No reviews yet. Be the first to review this product!</p>
          ) : (
            <div className="grid gap-4">
              {reviews.map((r) => (
                <div
                  key={r.id}
                  className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800"
                >
                  <div className="flex items-center justify-between">
                    <p className="font-bold">{r.name}</p>
                    <span className="text-xs text-slate-400">
                      {new Date(r.date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                    </span>
                  </div>
                  <StarRating value={r.rating} size={14} />
                  <p className="text-slate-600 dark:text-slate-300 mt-2 text-sm">{r.comment}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 h-fit">
          <h3 className="font-bold text-lg mb-4">Write a Review</h3>
          <form onSubmit={handleReviewSubmit} className="grid gap-3">
            <input
              placeholder="Your name (optional)"
              value={reviewForm.name}
              onChange={(e) => setReviewForm({ ...reviewForm, name: e.target.value })}
              className="px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 outline-none focus:border-blue-500 transition text-sm"
            />
            <div>
              <p className="text-sm font-semibold mb-2">Your Rating</p>
              <StarRating
                value={reviewForm.rating}
                interactive
                onChange={(v) => setReviewForm({ ...reviewForm, rating: v })}
                size={22}
              />
            </div>
            <textarea
              placeholder="Share your experience..."
              rows={3}
              value={reviewForm.comment}
              onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })}
              className="px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 outline-none focus:border-blue-500 transition text-sm"
            />
            <button
              type="submit"
              className="py-3 rounded-2xl bg-blue-600 text-white font-bold hover:bg-blue-700 transition"
            >
              Submit Review
            </button>
          </form>
        </div>
      </div>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <div className="mt-16">
          <h2 className="text-2xl font-black mb-6">You May Also Like</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {relatedProducts.map((p) => (
              <ProductCard key={p._id || p.id} product={p} />
            ))}
          </div>
        </div>
      )}

      {/* Recently Viewed */}
      {recentlyViewed.length > 0 && (
        <div className="mt-16">
          <h2 className="text-2xl font-black mb-6">Recently Viewed</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {recentlyViewed.slice(0, 4).map((p) => (
              <ProductCard key={p._id || p.id} product={p} />
            ))}
          </div>
        </div>
      )}
    </section>
  );
};
export default ProductDetails;
