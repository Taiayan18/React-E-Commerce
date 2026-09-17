import { useEffect, useState } from "react";
import { Package, ShoppingBag, Users, Wallet, Plus, Pencil, Trash2, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import { useAuth } from "../context/AuthContext";
import {
  getalldata,
  toggleProductStock,
  createProductApi,
  updateProductApi,
  deleteProductApi,
} from "../data/products";
import { getAllOrders, updateOrderStatus, sendDeliveryOtp } from "../data/orders";

const STATUS_COLORS = {
  Placed: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  Shipped: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  Delivered: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  Cancelled: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
};

const emptyForm = {
  name: "",
  category: "",
  price: "",
  description: "",
  image: "",
  extraImages: "",
  inStock: true,
};

const AdminDashboard = () => {
  const { isAdmin, isLoggedIn } = useAuth();
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [orderStats, setOrderStats] = useState({ count: 0, revenue: 0 });
  const [togglingId, setTogglingId] = useState(null);
  const [updatingOrderId, setUpdatingOrderId] = useState(null);
  const [otpInputs, setOtpInputs] = useState({}); // { [orderId]: "1234" }

  // Add/Edit product form ke liye state
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null); // null = adding new
  const [form, setForm] = useState(emptyForm);
  const [formError, setFormError] = useState("");
  const [saving, setSaving] = useState(false);
  const [deletingName, setDeletingName] = useState(null);

  const fetchProducts = async () => {
    try {
      const data = await getalldata();
      if (data && data.data) {
        setProducts(data.data);
      } else if (Array.isArray(data)) {
        setProducts(data);
      }
    } catch (error) {
      console.error("Failed to fetch products", error);
    }
  };

  const fetchOrderStats = async () => {
    try {
      const data = await getAllOrders();
      if (data && data.status && Array.isArray(data.data)) {
        const revenue = data.data.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
        setOrderStats({ count: data.data.length, revenue });
        setOrders(data.data);
      }
    } catch (error) {
      console.error("Failed to fetch orders", error);
    }
  };

  // Handle status change from the admin orders table
  const handleStatusChange = async (order, newStatus, otp) => {
    setUpdatingOrderId(order._id);
    try {
      const res = await updateOrderStatus(order._id, newStatus, otp);
      if (res && res.status) {
        setOrders((prev) =>
          prev.map((o) => (o._id === order._id ? { ...o, status: newStatus } : o))
        );
        setOtpInputs((prev) => ({ ...prev, [order._id]: "" }));
        toast.success(res.message || `Order marked as ${newStatus}`);
      } else {
        toast.error(res?.message || "Could not update order status");
      }
    } catch (error) {
      toast.error("Something went wrong updating the order");
    } finally {
      setUpdatingOrderId(null);
    }
  };

  // "Shipped" ya "Cancelled" jaise seedhe transitions (OTP ki zaroorat nahi)
  const handleQuickStatus = (order, newStatus) => handleStatusChange(order, newStatus);

  // Admin jab delivery ka time ho tab dabata hai — tabhi OTP generate hokar customer ko email jaata hai
  const handleSendOtp = async (order) => {
    setUpdatingOrderId(order._id);
    try {
      const res = await sendDeliveryOtp(order._id);
      if (res && res.status) {
        setOrders((prev) =>
          prev.map((o) => (o._id === order._id ? { ...o, otpSentAt: new Date().toISOString() } : o))
        );
        toast.success("Delivery OTP customer ko email kar diya gaya");
      } else {
        toast.error(res?.message || "OTP bhejne me error aayi");
      }
    } catch (error) {
      toast.error("Something went wrong sending OTP");
    } finally {
      setUpdatingOrderId(null);
    }
  };

  // "Delivered" — customer se mile OTP ko verify karke deliver mark karta hai
  const handleVerifyDelivery = (order) => {
    const otp = (otpInputs[order._id] || "").trim();
    if (!otp) {
      toast.error("Customer se OTP maango pehle");
      return;
    }
    handleStatusChange(order, "Delivered", otp);
  };

  // Group revenue by day (last 7 entries) for the sales trend chart
  const chartData = (() => {
    const byDate = {};
    orders.forEach((o) => {
      const day = new Date(o.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short" });
      byDate[day] = (byDate[day] || 0) + (o.totalAmount || 0);
    });
    return Object.entries(byDate)
      .map(([date, revenue]) => ({ date, revenue }))
      .slice(-7);
  })();

  useEffect(() => {
    // Agar login nahi hai to login page pe bhejo
    if (!isLoggedIn) {
      navigate("/login", {
        state: { message: "Please login to access the admin dashboard.", from: "/admin" }
      });
      return;
    }
    // Agar logged in hai but admin nahi
    if (!isAdmin) {
      navigate("/", { replace: true });
      return;
    }

    fetchProducts();
    fetchOrderStats();
  }, [isAdmin, isLoggedIn, navigate]);

  // Available/Out of Stock toggle karne ke liye
  const handleToggleStock = async (p) => {
    const id = p._id || p.id;
    if (!id) return;

    const newStatus = !(p.inStock !== false); // current true -> false, false -> true
    setTogglingId(id);
    try {
      const res = await toggleProductStock(id, newStatus);
      if (res && res.status) {
        setProducts((prev) =>
          prev.map((item) =>
            (item._id || item.id) === id ? { ...item, inStock: newStatus } : item
          )
        );
      } else {
        alert(res?.message || "Stock status update nahi ho paya");
      }
    } catch (error) {
      console.error("Failed to toggle stock", error);
    } finally {
      setTogglingId(null);
    }
  };

  // "Add Product" button
  const openAddForm = () => {
    setEditingProduct(null);
    setForm(emptyForm);
    setFormError("");
    setShowForm(true);
  };

  // "Edit" button on a row
  const openEditForm = (p) => {
    setEditingProduct(p);
    setForm({
      name: p.name || "",
      category: p.category || "",
      price: p.price || "",
      description: p.description || "",
      image: p.image || "",
      extraImages: Array.isArray(p.images) ? p.images.join(", ") : "",
      inStock: p.inStock !== false,
    });
    setFormError("");
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingProduct(null);
    setForm(emptyForm);
    setFormError("");
  };

  const handleFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setFormError("");

    if (!form.name || !form.category || !form.price || !form.description || !form.image) {
      setFormError("Please fill all the fields.");
      return;
    }

    setSaving(true);
    try {
      const payload = {
        name: form.name,
        category: form.category,
        price: Number(form.price),
        description: form.description,
        image: form.image,
        images: form.extraImages
          .split(",")
          .map((url) => url.trim())
          .filter(Boolean),
        inStock: form.inStock,
      };

      let res;
      if (editingProduct) {
        // Edit karte waqt name change nahi karne dete (route name se hi product find karta hai)
        res = await updateProductApi(editingProduct.name, payload);
      } else {
        res = await createProductApi(payload);
      }

      if (res && res.status) {
        await fetchProducts();
        closeForm();
      } else {
        setFormError(res?.message || "Product save nahi ho paya. Try again.");
      }
    } catch (error) {
      setFormError("Something went wrong. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  // "Delete" button on a row
  const handleDelete = async (p) => {
    if (!window.confirm(`Are you sure you want to delete "${p.name}"?`)) return;

    setDeletingName(p.name);
    try {
      const res = await deleteProductApi(p.name);
      if (res && res.status) {
        setProducts((prev) => prev.filter((item) => item.name !== p.name));
      } else {
        alert(res?.message || "Product delete nahi ho paya");
      }
    } catch (error) {
      console.error("Failed to delete product", error);
    } finally {
      setDeletingName(null);
    }
  };

  // Jab tak check ho raha hai tab kuch show mat karo
  if (!isLoggedIn || !isAdmin) return null;

  return (
    <section className="max-w-7xl mx-auto px-4 py-10">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black">Admin Dashboard</h1>
          <p className="text-slate-500 mt-2">Welcome, Admin! Manage your store here.</p>
        </div>
        <button
          onClick={openAddForm}
          className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-blue-600 text-white font-bold hover:bg-blue-700 transition-colors shadow-lg shadow-blue-600/20"
        >
          <Plus className="w-5 h-5" /> Add Product
        </button>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 mt-8">
        {[
          [Package, "Products", products.length],
          [ShoppingBag, "Orders", orderStats.count],
          [Users, "Users", 120],
          [Wallet, "Revenue", `₹${orderStats.revenue.toLocaleString("en-IN")}`],
        ].map(([Icon, label, value]) => (
          <div
            key={label}
            className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-soft"
          >
            <Icon className="text-blue-600" />
            <p className="text-slate-500 mt-4">{label}</p>
            <h2 className="text-3xl font-black">{value}</h2>
          </div>
        ))}
      </div>

      {/* Sales Trend Chart */}
      <div className="mt-8 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6">
        <div className="font-bold text-xl mb-4">Revenue Trend</div>
        {chartData.length === 0 ? (
          <p className="text-slate-400 text-sm py-10 text-center">No orders yet to chart.</p>
        ) : (
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" className="opacity-20" />
              <XAxis dataKey="date" fontSize={12} />
              <YAxis fontSize={12} />
              <Tooltip
                formatter={(value) => [`₹${value.toLocaleString("en-IN")}`, "Revenue"]}
                contentStyle={{ borderRadius: 12, border: "none" }}
              />
              <Line type="monotone" dataKey="revenue" stroke="#2563eb" strokeWidth={3} dot={{ r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Orders Management */}
      <div className="mt-8 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden">
        <div className="p-5 font-bold text-xl">Manage Orders</div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-100 dark:bg-slate-800">
              <tr>
                <th className="p-4">Customer</th>
                <th className="p-4">Items</th>
                <th className="p-4">Amount</th>
                <th className="p-4">Payment</th>
                <th className="p-4">Status</th>
              </tr>
            </thead>
            <tbody>
              {orders.slice(0, 10).map((o) => (
                <tr key={o._id} className="border-t border-slate-200 dark:border-slate-800">
                  <td className="p-4">
                    <p className="font-semibold">{o.userName}</p>
                    <p className="text-xs text-slate-400">{o.userEmail}</p>
                  </td>
                  <td className="p-4 text-sm text-slate-500">{o.items?.length || 0} item(s)</td>
                  <td className="p-4 font-bold">₹{o.totalAmount}</td>
                  <td className="p-4">
                    <span
                      className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                        o.paymentStatus === "Paid"
                          ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                          : "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
                      }`}
                    >
                      {o.paymentMethod === "Online" ? "Online" : "COD"}
                    </span>
                  </td>
                  <td className="p-4 min-w-[220px]">
                    <div className="flex flex-col gap-2">
                      <span
                        className={`inline-block w-fit px-3 py-1 rounded-full text-xs font-bold ${STATUS_COLORS[o.status] || ""}`}
                      >
                        {o.status}
                      </span>

                      {/* Placed -> Shipped hone se pehle: Mark Shipped ya Cancel */}
                      {o.status === "Placed" && (
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleQuickStatus(o, "Shipped")}
                            disabled={updatingOrderId === o._id}
                            className="px-3 py-1.5 rounded-xl bg-blue-600 text-white text-xs font-bold hover:bg-blue-700 transition-colors disabled:opacity-50"
                          >
                            Mark Shipped
                          </button>
                          <button
                            onClick={() => handleQuickStatus(o, "Cancelled")}
                            disabled={updatingOrderId === o._id}
                            className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-bold hover:bg-red-50 hover:text-red-600 transition-colors disabled:opacity-50"
                          >
                            Cancel
                          </button>
                        </div>
                      )}

                      {/* Shipped, lekin OTP abhi tak nahi bheja — admin jab delivery ka time ho tab bhejega */}
                      {o.status === "Shipped" && !o.otpSentAt && (
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleSendOtp(o)}
                            disabled={updatingOrderId === o._id}
                            className="px-3 py-1.5 rounded-xl bg-blue-600 text-white text-xs font-bold hover:bg-blue-700 transition-colors disabled:opacity-50"
                          >
                            Send Delivery OTP
                          </button>
                          <button
                            onClick={() => handleQuickStatus(o, "Cancelled")}
                            disabled={updatingOrderId === o._id}
                            className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-bold hover:bg-red-50 hover:text-red-600 transition-colors disabled:opacity-50"
                          >
                            Cancel
                          </button>
                        </div>
                      )}

                      {/* OTP bhej diya gaya hai — ab customer se OTP maango aur verify karo */}
                      {o.status === "Shipped" && o.otpSentAt && (
                        <div className="flex flex-col gap-1.5">
                          <div className="flex gap-2">
                            <input
                              value={otpInputs[o._id] || ""}
                              onChange={(e) =>
                                setOtpInputs((prev) => ({ ...prev, [o._id]: e.target.value }))
                              }
                              placeholder="Customer's OTP"
                              maxLength={4}
                              className="w-24 px-2.5 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 outline-none focus:border-blue-500 text-xs"
                            />
                            <button
                              onClick={() => handleVerifyDelivery(o)}
                              disabled={updatingOrderId === o._id}
                              className="px-3 py-1.5 rounded-xl bg-green-600 text-white text-xs font-bold hover:bg-green-700 transition-colors disabled:opacity-50"
                            >
                              Verify & Deliver
                            </button>
                          </div>
                          <button
                            onClick={() => handleSendOtp(o)}
                            disabled={updatingOrderId === o._id}
                            className="text-[11px] font-semibold text-blue-600 hover:underline text-left"
                          >
                            Resend OTP
                          </button>
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {orders.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-6 text-center text-slate-400">
                    No orders placed yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="mt-8 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden">
        <div className="p-5 font-bold text-xl">All Products</div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-100 dark:bg-slate-800">
              <tr>
                <th className="p-4">Product</th>
                <th className="p-4">Category</th>
                <th className="p-4">Price</th>
                <th className="p-4">Availability</th>
                <th className="p-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => {
                const id = p._id || p.id;
                const inStock = p.inStock !== false; // default true jab tak explicitly false na ho
                return (
                  <tr key={id} className="border-t border-slate-200 dark:border-slate-800">
                    <td className="p-4 font-semibold">{p.name}</td>
                    <td className="p-4">{p.category}</td>
                    <td className="p-4">₹{p.price}</td>
                    <td className="p-4">
                      <button
                        onClick={() => handleToggleStock(p)}
                        disabled={togglingId === id}
                        className={`px-3 py-1.5 rounded-full text-xs font-bold transition-colors disabled:opacity-50 ${
                          inStock
                            ? "bg-green-100 text-green-700 hover:bg-green-200 dark:bg-green-900/30 dark:text-green-400"
                            : "bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-900/30 dark:text-red-400"
                        }`}
                      >
                        {togglingId === id ? "..." : inStock ? "In Stock" : "Out of Stock"}
                      </button>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => openEditForm(p)}
                          className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-blue-600 hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors"
                          aria-label="Edit product"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(p)}
                          disabled={deletingName === p.name}
                          className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-red-600 hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors disabled:opacity-50"
                          aria-label="Delete product"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {products.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-6 text-center text-slate-400">
                    No products yet. Click "Add Product" to create one.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Product Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 md:p-8 w-full max-w-lg border border-slate-200 dark:border-slate-800 shadow-soft max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-black">
                {editingProduct ? "Edit Product" : "Add Product"}
              </h2>
              <button
                onClick={closeForm}
                className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {formError && (
              <div className="mb-4 px-4 py-3 bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-2xl text-sm font-medium">
                {formError}
              </div>
            )}

            <form onSubmit={handleFormSubmit} className="grid gap-4">
              <input
                className="px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 outline-none focus:border-blue-500 transition disabled:opacity-60"
                placeholder="Product Name"
                name="name"
                value={form.name}
                onChange={handleFormChange}
                disabled={!!editingProduct}
              />
              {editingProduct && (
                <p className="text-xs text-slate-400 -mt-3">
                  Name can't be changed while editing (used to identify the product).
                </p>
              )}
              <input
                className="px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 outline-none focus:border-blue-500 transition"
                placeholder="Category"
                name="category"
                value={form.category}
                onChange={handleFormChange}
              />
              <input
                className="px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 outline-none focus:border-blue-500 transition"
                placeholder="Price"
                name="price"
                type="number"
                min="0"
                value={form.price}
                onChange={handleFormChange}
              />
              <input
                className="px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 outline-none focus:border-blue-500 transition"
                placeholder="Image URL"
                name="image"
                value={form.image}
                onChange={handleFormChange}
              />
              <input
                className="px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 outline-none focus:border-blue-500 transition"
                placeholder="Extra gallery image URLs (comma separated, optional)"
                name="extraImages"
                value={form.extraImages}
                onChange={handleFormChange}
              />
              <textarea
                className="px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 outline-none focus:border-blue-500 transition"
                placeholder="Description"
                name="description"
                rows={3}
                value={form.description}
                onChange={handleFormChange}
              />
              <label className="flex items-center gap-2 text-sm font-medium">
                <input
                  type="checkbox"
                  name="inStock"
                  checked={form.inStock}
                  onChange={handleFormChange}
                  className="w-4 h-4"
                />
                In Stock (available for purchase)
              </label>

              <button
                type="submit"
                disabled={saving}
                className="mt-2 py-3 rounded-2xl bg-blue-600 text-white font-bold hover:bg-blue-700 transition disabled:opacity-60"
              >
                {saving ? "Saving..." : editingProduct ? "Update Product" : "Create Product"}
              </button>
            </form>
          </div>
        </div>
      )}
    </section>
  );
};
export default AdminDashboard;
