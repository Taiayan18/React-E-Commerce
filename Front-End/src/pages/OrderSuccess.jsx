import { Link, useLocation, Navigate } from "react-router-dom";
import { CheckCircle2 } from "lucide-react";

const OrderSuccess = () => {
  const location = useLocation();
  const order = location.state?.order;

  // Direct URL se aaya ho (order data na ho) to redirect kar do
  if (!order) return <Navigate to="/" replace />;

  return (
    <section className="max-w-2xl mx-auto px-4 py-20 text-center">
      <CheckCircle2 className="w-20 h-20 text-green-500 mx-auto" />
      <h1 className="text-4xl font-black mt-6">Order Placed!</h1>
      <p className="text-slate-500 mt-3">
        Thank you {order.userName}, your order has been placed successfully.
      </p>

      <div className="mt-8 bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-soft text-left">
        <div className="flex justify-between text-sm text-slate-500">
          <span>Order ID</span>
          <span className="font-mono">{order._id}</span>
        </div>
        <div className="flex justify-between text-sm text-slate-500 mt-2">
          <span>Status</span>
          <span className="font-semibold text-green-600">{order.status}</span>
        </div>
        <hr className="my-4 border-slate-200 dark:border-slate-800" />
        {order.items.map((item, i) => (
          <div key={i} className="flex justify-between text-sm mb-2">
            <span>{item.name} x{item.qty}</span>
            <span className="font-semibold">₹{item.price * item.qty}</span>
          </div>
        ))}
        <hr className="my-4 border-slate-200 dark:border-slate-800" />
        <div className="flex justify-between text-lg">
          <span className="font-bold">Total Paid</span>
          <b className="text-blue-600">₹{order.totalAmount}</b>
        </div>
      </div>

      <Link
        to="/products"
        className="inline-block mt-8 px-6 py-3 bg-blue-600 text-white rounded-2xl font-bold hover:bg-blue-700 transition-colors"
      >
        Continue Shopping
      </Link>
    </section>
  );
};

export default OrderSuccess;
