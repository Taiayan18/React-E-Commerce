import { Minus, Plus, Trash2 } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";

const Cart = () => {
  const { cart, total, updateQty, removeFromCart, clearCart } = useCart();
  const { isLoggedIn } = useAuth();
  const navigate = useNavigate();

  const handleRemove = (id, name) => {
    removeFromCart(id);
    toast(`${name} removed from cart`, { icon: "🗑️" });
  };

  const handleClear = () => {
    clearCart();
    toast("Cart cleared", { icon: "🧹" });
  };

  const handleCheckout = () => {
    if (!isLoggedIn) {
      navigate("/login", {
        state: { message: "Please login to checkout.", from: "/checkout" },
      });
      return;
    }
    navigate("/checkout");
  };
  
  if (!cart.length) {
    return (
      <section className="max-w-7xl mx-auto px-4 py-20 text-center">
        <h1 className="text-4xl font-black">Cart is Empty</h1>
        <p className="text-slate-500 mt-3">Add products to your cart.</p>
        <Link to="/products" className="inline-block mt-6 px-6 py-3 bg-blue-600 text-white rounded-2xl font-bold hover:bg-blue-700 transition-colors">
          Shop Products
        </Link>
      </section>
    );
  }

  return (
    <section className="max-w-7xl mx-auto px-4 py-10">
      <h1 className="text-4xl font-black mb-8">My Cart</h1>
      <div className="grid lg:grid-cols-3 gap-8 items-start">
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-soft overflow-hidden">
          <div className="px-5 sm:px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <h2 className="font-bold text-lg">
              Cart Items <span className="text-slate-400 font-medium">({cart.length})</span>
            </h2>
          </div>

          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {cart.map((item) => {
              const id = item._id || item.id;
              const fallbackImage = "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=900";
              return (
                <div key={id} className="p-5 sm:p-6 flex flex-col sm:flex-row gap-4 sm:items-center">
                  <img 
                    src={item.image || fallbackImage} 
                    onError={(e) => { e.target.src = fallbackImage; }}
                    className="w-full sm:w-24 sm:h-24 h-40 object-cover rounded-2xl bg-slate-100 dark:bg-slate-800 shrink-0" 
                    alt={item.name}
                  />
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-lg leading-tight truncate">{item.name}</h3>
                    <p className="text-blue-600 font-semibold mt-1">₹{item.price}</p>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-6 sm:gap-8">
                    <div className="flex items-center gap-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl p-1">
                      <button 
                        onClick={() => updateQty(id, item.qty - 1)} 
                        className="p-2 rounded-lg bg-white dark:bg-slate-800 shadow-sm hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                      >
                        <Minus size={16}/>
                      </button>
                      <b className="w-4 text-center">{item.qty}</b>
                      <button 
                        onClick={() => updateQty(id, item.qty + 1)} 
                        className="p-2 rounded-lg bg-white dark:bg-slate-800 shadow-sm hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                      >
                        <Plus size={16}/>
                      </button>
                    </div>

                    <div className="text-right min-w-[72px]">
                      <p className="font-black">₹{item.price * item.qty}</p>
                    </div>

                    <button 
                      onClick={() => handleRemove(id, item.name)} 
                      className="p-2 rounded-xl bg-red-50 text-red-600 dark:bg-red-950 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900 transition-colors shrink-0"
                      title="Remove from cart"
                    >
                      <Trash2 size={18}/>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="px-5 sm:px-6 py-4 border-t border-slate-200 dark:border-slate-800">
            <Link to="/products" className="text-blue-600 font-semibold text-sm hover:underline">
              ← Continue Shopping
            </Link>
          </div>
        </div>
        
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-soft sticky top-24">
          <h2 className="text-2xl font-black">Order Summary</h2>
          <div className="flex justify-between mt-6">
            <span className="text-slate-500">Subtotal</span>
            <b className="text-lg">₹{total}</b>
          </div>
          <div className="flex justify-between mt-3">
            <span className="text-slate-500">Delivery</span>
            <b className="text-green-600">Free</b>
          </div>
          <hr className="my-5 border-slate-200 dark:border-slate-800"/>
          <div className="flex justify-between text-xl items-center">
            <span className="font-bold">Total</span>
            <b className="text-2xl font-black text-blue-600">₹{total}</b>
          </div>
          <button 
            onClick={handleCheckout}
            className="w-full mt-8 py-4 rounded-2xl bg-blue-600 text-white font-bold text-lg hover:bg-blue-700 transition-colors shadow-lg shadow-blue-600/30"
          >
            Checkout
          </button>
          <button 
            onClick={handleClear} 
            className="w-full mt-3 py-3 rounded-2xl bg-slate-100 dark:bg-slate-800 font-bold hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
          >
            Clear Cart
          </button>
        </div>
      </div>
    </section>
  );
};

export default Cart;
