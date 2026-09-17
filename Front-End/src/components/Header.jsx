import { Link, NavLink, useNavigate } from "react-router-dom";
import { Menu, Moon, Search, ShoppingCart, Sun, User, X, LayoutDashboard, LogOut, Heart, Package } from "lucide-react";
import { useState } from "react";
import { useCart } from "../context/CartContext";
import { useTheme } from "../context/ThemeContext";
import { useAuth } from "../context/AuthContext";
import { useWishlist } from "../context/WishlistContext";

const links = [
  ["/", "Home"], ["/products", "Products"], ["/deals", "Deals"], ["/about", "About"], ["/contact", "Contact"]
];

const Header = () => {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [mobileSearch, setMobileSearch] = useState("");
  const { count } = useCart();
  const { count: wishCount } = useWishlist();
  const { theme, toggleTheme } = useTheme();
  const { user, isLoggedIn, isAdmin, logout } = useAuth();
  const navigate = useNavigate();

  const navClass = ({ isActive }) =>
    isActive
      ? "text-blue-600 dark:text-blue-400 font-semibold"
      : "text-slate-700 dark:text-slate-200 hover:text-blue-600 dark:hover:text-blue-400";

  const handleLogout = () => {
    logout();
    setOpen(false);
    navigate("/");
  };

  const runSearch = (value) => {
    const q = value.trim();
    navigate(q ? `/products?search=${encodeURIComponent(q)}` : "/products");
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    runSearch(search);
  };

  const handleMobileSearchSubmit = (e) => {
    e.preventDefault();
    runSearch(mobileSearch);
    setOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 bg-white/90 dark:bg-slate-950/90 backdrop-blur border-b border-slate-200 dark:border-slate-800">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-2xl bg-blue-600 text-white grid place-items-center font-black">Z</div>
          <div>
            <h1 className="text-xl font-black leading-none">Zenvy</h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">Online Store</p>
          </div>
        </Link>

        <nav className="hidden lg:flex items-center gap-7">
          {links.map(([to, label]) => (
            <NavLink key={to} to={to} className={navClass}>{label}</NavLink>
          ))}
        </nav>

        <form
          onSubmit={handleSearchSubmit}
          className="hidden md:flex items-center max-w-sm flex-1 bg-slate-100 dark:bg-slate-900 rounded-2xl px-4 py-2 border border-slate-200 dark:border-slate-800 focus-within:border-blue-400 transition-colors"
        >
          <button type="submit" aria-label="Search">
            <Search className="w-4 h-4 text-slate-500" />
          </button>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search products..."
            className="w-full bg-transparent outline-none px-3 text-sm"
          />
        </form>

        <div className="flex items-center gap-2">
          <button
            onClick={toggleTheme}
            className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-900"
          >
            {theme === "dark" ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>

          {/* Admin Dashboard - sirf admin ko dikhao */}
          {isAdmin && (
            <Link
              to="/admin"
              className="hidden sm:block p-2 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-900"
              title="Admin Dashboard"
            >
              <LayoutDashboard className="w-5 h-5" />
            </Link>
          )}

          {/* My Orders - sirf logged-in user ko dikhao */}
          {isLoggedIn && (
            <Link
              to="/orders"
              className="hidden sm:block p-2 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-900"
              title="My Orders"
            >
              <Package className="w-5 h-5" />
            </Link>
          )}

          {/* Login/Logout/User button */}
          {isLoggedIn ? (
            <div className="hidden sm:flex items-center gap-2">
              <span className="text-xs text-slate-500 dark:text-slate-400 font-medium hidden md:block">
                Hi, {user.name.split(" ")[0]}
              </span>
              <button
                onClick={handleLogout}
                className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-red-50 hover:border-red-200 hover:text-red-600 dark:hover:bg-red-900/20 transition"
                title="Logout"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          ) : (
            <Link
              to="/login"
              className="hidden sm:block p-2 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-900"
              title="Login"
            >
              <User className="w-5 h-5" />
            </Link>
          )}

          <Link
            to="/wishlist"
            className="relative p-2 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-900"
            title="Wishlist"
          >
            <Heart className="w-5 h-5" />
            {wishCount > 0 && (
              <span className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-red-500 text-white text-xs grid place-items-center">
                {wishCount}
              </span>
            )}
          </Link>

          <Link
            to="/cart"
            className="relative p-2 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-900"
          >
            <ShoppingCart className="w-5 h-5" />
            {count > 0 && (
              <span className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-red-500 text-white text-xs grid place-items-center">
                {count}
              </span>
            )}
          </Link>

          <button
            onClick={() => setOpen(!open)}
            className="lg:hidden p-2 rounded-xl border border-slate-200 dark:border-slate-800"
          >
            {open ? <X /> : <Menu />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {open && (
        <div className="lg:hidden px-4 pb-4 bg-white dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800">
          <form
            onSubmit={handleMobileSearchSubmit}
            className="flex items-center bg-slate-100 dark:bg-slate-900 rounded-2xl px-4 py-2 my-3"
          >
            <button type="submit" aria-label="Search">
              <Search className="w-4 h-4 text-slate-500" />
            </button>
            <input
              value={mobileSearch}
              onChange={(e) => setMobileSearch(e.target.value)}
              placeholder="Search..."
              className="w-full bg-transparent outline-none px-3 text-sm"
            />
          </form>
          <div className="grid gap-3">
            {links.map(([to, label]) => (
              <NavLink onClick={() => setOpen(false)} key={to} to={to} className={navClass}>
                {label}
              </NavLink>
            ))}
            <NavLink to="/wishlist" onClick={() => setOpen(false)} className={navClass}>
              Wishlist {wishCount > 0 && `(${wishCount})`}
            </NavLink>
            {isLoggedIn && (
              <NavLink to="/orders" onClick={() => setOpen(false)} className={navClass}>
                My Orders
              </NavLink>
            )}
            {isAdmin && (
              <NavLink to="/admin" onClick={() => setOpen(false)} className={navClass}>
                Admin Dashboard
              </NavLink>
            )}
            {isLoggedIn ? (
              <button
                onClick={handleLogout}
                className="text-left text-red-500 font-semibold hover:text-red-700"
              >
                Logout ({user.name})
              </button>
            ) : (
              <>
                <NavLink to="/login" onClick={() => setOpen(false)} className={navClass}>Login</NavLink>
                <NavLink to="/register" onClick={() => setOpen(false)} className={navClass}>Register</NavLink>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
export default Header;
