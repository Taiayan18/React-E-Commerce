import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { placeOrder } from "../data/orders";
import { loadRazorpayScript, createRazorpayOrder, verifyRazorpayPayment } from "../data/payment";
import { ShoppingBag, Tag, X, Wallet, CreditCard } from "lucide-react";

// Demo coupon codes (client-side only). Discount % applied on subtotal.
const COUPONS = {
  SAVE10: 10,
  WELCOME15: 15,
  ZENVY20: 20,
};

const RAZORPAY_KEY_ID = import.meta.env.VITE_RAZORPAY_KEY_ID || "";

const Checkout = () => {
  const { cart, total, clearCart } = useCart();
  const { user, isLoggedIn } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({ phone: "", address: "", city: "", pincode: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [couponInput, setCouponInput] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState("COD"); // "COD" | "Online"

  const discountPercent = appliedCoupon ? COUPONS[appliedCoupon] : 0;
  const discountAmount = Math.round((total * discountPercent) / 100);
  const finalTotal = total - discountAmount;

  const handleApplyCoupon = () => {
    const code = couponInput.trim().toUpperCase();
    if (!code) return;
    if (COUPONS[code]) {
      setAppliedCoupon(code);
      toast.success(`Coupon applied: ${COUPONS[code]}% off`);
    } else {
      toast.error("Invalid coupon code");
    }
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    setCouponInput("");
  };

  // Login zaroori hai checkout ke liye
  useEffect(() => {
    if (!isLoggedIn) {
      navigate("/login", {
        state: { message: "Please login to checkout.", from: "/checkout" },
      });
    }
  }, [isLoggedIn, navigate]);

  // Cart khali hai to checkout page pe kuch nahi karna
  useEffect(() => {
    if (isLoggedIn && cart.length === 0) {
      navigate("/cart");
    }
  }, [cart, isLoggedIn, navigate]);

  if (!isLoggedIn || cart.length === 0) return null;

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const buildOrderData = (paymentExtra = {}) => ({
    userEmail: user.email,
    userName: user.name,
    items: cart.map((item) => ({
      productId: item._id || item.id,
      name: item.name,
      price: item.price,
      qty: item.qty,
      image: item.image,
    })),
    totalAmount: finalTotal,
    shippingAddress: form,
    paymentMethod,
    paymentStatus: paymentMethod === "COD" ? "Pending" : "Paid",
    ...paymentExtra,
  });

  const finalizeOrder = async (orderData) => {
    const res = await placeOrder(orderData);
    if (res && res.status) {
      clearCart();
      navigate("/order-success", { state: { order: res.data } });
    } else {
      setError(res?.message || "Could not place order. Please try again.");
    }
  };

  const handleCodOrder = async () => {
    await finalizeOrder(buildOrderData());
  };

  const handleOnlinePayment = async () => {
    if (!RAZORPAY_KEY_ID) {
      setError("Online payment abhi configure nahi hai. COD choose karo ya admin se contact karo.");
      return;
    }

    const scriptLoaded = await loadRazorpayScript();
    if (!scriptLoaded) {
      setError("Payment gateway load nahi ho paya. Internet connection check karo.");
      return;
    }

    const orderRes = await createRazorpayOrder(finalTotal);
    if (!orderRes || !orderRes.status) {
      setError(orderRes?.message || "Payment order start nahi ho paya.");
      return;
    }

    const razorpayOrder = orderRes.data;

    const options = {
      key: RAZORPAY_KEY_ID,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      name: "Zenvy",
      description: "Order Payment",
      order_id: razorpayOrder.id,
      prefill: {
        name: user?.name,
        email: user?.email,
        contact: form.phone,
      },
      theme: { color: "#2563eb" },
      handler: async (response) => {
        const verifyRes = await verifyRazorpayPayment({
          razorpay_order_id: response.razorpay_order_id,
          razorpay_payment_id: response.razorpay_payment_id,
          razorpay_signature: response.razorpay_signature,
        });

        if (verifyRes && verifyRes.status) {
          toast.success("Payment successful!");
          await finalizeOrder(
            buildOrderData({
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
            })
          );
        } else {
          setError("Payment ho gaya lekin verify nahi ho paya. Support se contact karo.");
        }
        setLoading(false);
      },
      modal: {
        // User payment popup band kar de to loading state reset karo
        ondismiss: () => setLoading(false),
      },
    };

    const razorpayInstance = new window.Razorpay(options);
    razorpayInstance.on("payment.failed", () => {
      toast.error("Payment failed. Please try again.");
      setLoading(false);
    });
    razorpayInstance.open();
  };

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    setError("");

    const { phone, address, city, pincode } = form;
    if (!phone || !address || !city || !pincode) {
      setError("Please fill all the shipping details.");
      return;
    }

    setLoading(true);
    try {
      if (paymentMethod === "COD") {
        await handleCodOrder();
        setLoading(false);
      } else {
        // Online payment ke case me loading Razorpay modal ke handlers khud manage karte hain
        await handleOnlinePayment();
      }
    } catch (err) {
      setError("Something went wrong. Please try again.");
      setLoading(false);
    }
  };

  return (
    <section className="max-w-6xl mx-auto px-4 py-10">
      <h1 className="text-4xl font-black mb-8 flex items-center gap-3">
        <ShoppingBag className="text-blue-600" /> Checkout
      </h1>

      <div className="grid lg:grid-cols-3 gap-8">
        <form
          onSubmit={handlePlaceOrder}
          className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-soft grid gap-4"
        >
          <h2 className="text-xl font-bold">Shipping Details</h2>

          {error && (
            <div className="px-4 py-3 bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-2xl text-sm font-medium">
              {error}
            </div>
          )}

          <input
            className="px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 outline-none focus:border-blue-500 transition"
            placeholder="Full Name"
            value={user?.name || ""}
            disabled
          />
          <input
            className="px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 outline-none focus:border-blue-500 transition"
            placeholder="Email"
            value={user?.email || ""}
            disabled
          />
          <input
            className="px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 outline-none focus:border-blue-500 transition"
            placeholder="Phone Number"
            name="phone"
            value={form.phone}
            onChange={handleChange}
          />
          <input
            className="px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 outline-none focus:border-blue-500 transition"
            placeholder="Address"
            name="address"
            value={form.address}
            onChange={handleChange}
          />
          <div className="grid sm:grid-cols-2 gap-4">
            <input
              className="px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 outline-none focus:border-blue-500 transition"
              placeholder="City"
              name="city"
              value={form.city}
              onChange={handleChange}
            />
            <input
              className="px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 outline-none focus:border-blue-500 transition"
              placeholder="Pincode"
              name="pincode"
              value={form.pincode}
              onChange={handleChange}
            />
          </div>

          <h2 className="text-xl font-bold mt-2">Payment Method</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            <button
              type="button"
              onClick={() => setPaymentMethod("COD")}
              className={`flex items-center gap-3 px-4 py-4 rounded-2xl border-2 transition-colors text-left ${
                paymentMethod === "COD"
                  ? "border-blue-600 bg-blue-50 dark:bg-blue-900/20"
                  : "border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-600"
              }`}
            >
              <Wallet className={paymentMethod === "COD" ? "text-blue-600" : "text-slate-400"} />
              <div>
                <p className="font-bold">Cash on Delivery</p>
                <p className="text-xs text-slate-500">Pay when your order arrives</p>
              </div>
            </button>
            <button
              type="button"
              onClick={() => setPaymentMethod("Online")}
              className={`flex items-center gap-3 px-4 py-4 rounded-2xl border-2 transition-colors text-left ${
                paymentMethod === "Online"
                  ? "border-blue-600 bg-blue-50 dark:bg-blue-900/20"
                  : "border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-600"
              }`}
            >
              <CreditCard className={paymentMethod === "Online" ? "text-blue-600" : "text-slate-400"} />
              <div>
                <p className="font-bold">Pay Online</p>
                <p className="text-xs text-slate-500">UPI, Card, Netbanking (test mode)</p>
              </div>
            </button>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="mt-2 py-4 rounded-2xl bg-blue-600 text-white font-bold text-lg hover:bg-blue-700 transition disabled:opacity-60"
          >
            {loading
              ? "Processing..."
              : paymentMethod === "COD"
              ? `Place Order • ₹${finalTotal}`
              : `Pay ₹${finalTotal} Online`}
          </button>
        </form>

        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 h-fit shadow-soft">
          <h2 className="text-xl font-bold mb-4">Order Summary</h2>
          <div className="grid gap-3 max-h-80 overflow-y-auto pr-1">
            {cart.map((item) => {
              const id = item._id || item.id;
              return (
                <div key={id} className="flex justify-between text-sm">
                  <span className="text-slate-600 dark:text-slate-300">
                    {item.name} <b className="text-slate-400">x{item.qty}</b>
                  </span>
                  <span className="font-semibold">₹{item.price * item.qty}</span>
                </div>
              );
            })}
          </div>
          <hr className="my-4 border-slate-200 dark:border-slate-800" />

          {/* Coupon Code */}
          <div className="mb-4">
            {appliedCoupon ? (
              <div className="flex items-center justify-between px-4 py-3 rounded-2xl bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 text-sm font-semibold">
                <span className="flex items-center gap-2">
                  <Tag className="w-4 h-4" /> {appliedCoupon} applied ({discountPercent}% off)
                </span>
                <button onClick={removeCoupon} aria-label="Remove coupon">
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex gap-2">
                <input
                  value={couponInput}
                  onChange={(e) => setCouponInput(e.target.value)}
                  placeholder="Coupon code (try SAVE10)"
                  className="flex-1 px-4 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 outline-none focus:border-blue-500 transition text-sm"
                />
                <button
                  onClick={handleApplyCoupon}
                  type="button"
                  className="px-4 py-2.5 rounded-2xl bg-slate-100 dark:bg-slate-800 font-bold text-sm hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                >
                  Apply
                </button>
              </div>
            )}
          </div>

          <div className="flex justify-between text-sm text-slate-500">
            <span>Subtotal</span>
            <span>₹{total}</span>
          </div>
          {discountAmount > 0 && (
            <div className="flex justify-between text-sm text-green-600 font-semibold mt-2">
              <span>Discount</span>
              <span>−₹{discountAmount}</span>
            </div>
          )}
          <div className="flex justify-between text-lg mt-3">
            <span className="font-bold">Total</span>
            <b className="text-2xl font-black text-blue-600">₹{finalTotal}</b>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Checkout;
