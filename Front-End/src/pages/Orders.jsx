import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Package, CheckCircle2, Truck, XCircle, ClipboardList, KeyRound } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { getMyOrders } from "../data/orders";

const STEPS = ["Placed", "Shipped", "Delivered"];

const StatusStepper = ({ status }) => {
  if (status === "Cancelled") {
    return (
      <div className="flex items-center gap-2 text-red-600 font-bold text-sm">
        <XCircle className="w-5 h-5" /> Order Cancelled
      </div>
    );
  }

  const currentIndex = STEPS.indexOf(status);

  return (
    <div className="flex items-center w-full max-w-md">
      {STEPS.map((step, idx) => {
        const done = idx <= currentIndex;
        return (
          <div key={step} className="flex items-center flex-1 last:flex-none">
            <div className="flex flex-col items-center gap-1">
              <div
                className={`w-8 h-8 rounded-full grid place-items-center text-xs font-bold transition-colors ${
                  done
                    ? "bg-blue-600 text-white"
                    : "bg-slate-100 dark:bg-slate-800 text-slate-400"
                }`}
              >
                {done ? <CheckCircle2 className="w-4 h-4" /> : idx + 1}
              </div>
              <span
                className={`text-[11px] font-semibold ${
                  done ? "text-blue-600" : "text-slate-400"
                }`}
              >
                {step}
              </span>
            </div>
            {idx !== STEPS.length - 1 && (
              <div
                className={`flex-1 h-1 mx-1 rounded-full transition-colors ${
                  idx < currentIndex ? "bg-blue-600" : "bg-slate-100 dark:bg-slate-800"
                }`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
};

const Orders = () => {
  const { user, isLoggedIn } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isLoggedIn) {
      navigate("/login", {
        state: { message: "Please login to view your orders.", from: "/orders" },
      });
      return;
    }

    const fetchOrders = async () => {
      try {
        const res = await getMyOrders(user.email);
        if (res && res.status && Array.isArray(res.data)) {
          setOrders(res.data);
        }
      } catch (error) {
        console.error("Failed to fetch orders", error);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, [isLoggedIn, user, navigate]);

  if (!isLoggedIn) return null;

  if (loading) {
    return (
      <section className="max-w-5xl mx-auto px-4 py-20 text-center text-slate-500">
        Loading your orders...
      </section>
    );
  }

  if (!orders.length) {
    return (
      <section className="max-w-5xl mx-auto px-4 py-20 text-center">
        <ClipboardList className="w-14 h-14 mx-auto text-slate-300 dark:text-slate-700" />
        <h1 className="text-4xl font-black mt-4">No Orders Yet</h1>
        <p className="text-slate-500 mt-3">Your placed orders will show up here.</p>
        <Link
          to="/products"
          className="inline-block mt-6 px-6 py-3 bg-blue-600 text-white rounded-2xl font-bold hover:bg-blue-700 transition-colors"
        >
          Start Shopping
        </Link>
      </section>
    );
  }

  return (
    <section className="max-w-5xl mx-auto px-4 py-10">
      <h1 className="text-4xl font-black mb-8 flex items-center gap-3">
        <Package className="text-blue-600" /> My Orders
      </h1>

      <div className="grid gap-6">
        {orders.map((order) => (
          <div
            key={order._id}
            className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-soft p-6"
          >
            <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
              <div>
                <p className="text-xs text-slate-400 font-medium">
                  Order ID: {order._id}
                </p>
                <p className="text-sm text-slate-500 mt-1">
                  Placed on {new Date(order.createdAt).toLocaleDateString("en-IN", {
                    day: "numeric", month: "short", year: "numeric",
                  })}
                </p>
              </div>
              <div className="text-right">
                <span className="text-xl font-black text-blue-600 block">
                  ₹{order.totalAmount}
                </span>
                <span
                  className={`inline-block mt-1 text-[11px] font-bold px-2.5 py-1 rounded-full ${
                    order.paymentStatus === "Paid"
                      ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                      : "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
                  }`}
                >
                  {order.paymentMethod === "Online" ? "Paid Online" : "Cash on Delivery"}
                </span>
              </div>
            </div>

            <StatusStepper status={order.status} />

            {order.status === "Shipped" && order.deliveryOtp && (
              <div className="mt-5 flex items-center gap-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-900 rounded-2xl px-4 py-3">
                <KeyRound className="w-5 h-5 text-blue-600 shrink-0" />
                <div>
                  <p className="text-sm font-bold text-blue-700 dark:text-blue-400">
                    Delivery OTP: <span className="tracking-widest">{order.deliveryOtp}</span>
                  </p>
                  <p className="text-xs text-blue-600/70 dark:text-blue-400/70">
                    Product milne par delivery person ko ye OTP batayein.
                  </p>
                </div>
              </div>
            )}

            <div className="mt-5 pt-5 border-t border-slate-100 dark:border-slate-800 grid gap-3">
              {order.items.map((item, idx) => (
                <div key={idx} className="flex items-center gap-3">
                  <img
                    src={item.image || "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=900"}
                    alt={item.name}
                    className="w-12 h-12 rounded-xl object-cover bg-slate-100 dark:bg-slate-800"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm truncate">{item.name}</p>
                    <p className="text-xs text-slate-400">Qty: {item.qty}</p>
                  </div>
                  <p className="font-bold text-sm">₹{item.price * item.qty}</p>
                </div>
              ))}
            </div>

            <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center gap-2 text-sm text-slate-500">
              <Truck className="w-4 h-4" />
              Shipping to {order.shippingAddress?.city}, {order.shippingAddress?.pincode}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default Orders;
