import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Eye, EyeOff, ShieldCheck, User } from "lucide-react";

const Register = () => {
  const { register, login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [name, setName] = useState("");
  const [email, setEmail] = useState(location.state?.email || "");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("user");
  const [adminKey, setAdminKey] = useState("");
  const [showKey, setShowKey] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");
    if (!name || !email || !password) {
      setError("Please fill in all fields.");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    if (role === "admin" && !adminKey) {
      setError("Admin Secret Key is required.");
      return;
    }
    setLoading(true);
    setTimeout(async () => {
      const result = await register(name, email, password, role, adminKey);
      if (result.success) {
        setLoading(false);
        if (result.role === "admin") {
          navigate("/admin");
        } else {
          navigate("/");
        }
      } else {
        if (result.status === 409) {
          setError("Email already registered. Logging you in...");
          const loginResult = await login(email, password);
          setLoading(false);
          if (loginResult.success) {
            if (loginResult.role === "admin") {
              navigate("/admin");
            } else {
              navigate("/");
            }
          } else {
            setError(`Email already registered. Login failed: ${loginResult.error}`);
          }
        } else {
          setLoading(false);
          setError(result.error);
        }
      }
    }, 400);
  };

  return (
    <section className="max-w-md mx-auto px-4 py-16">
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 border border-slate-200 dark:border-slate-800 shadow-soft">
        <h1 className="text-3xl font-black">Create Account</h1>
        <p className="text-slate-500 mt-2">Join Zenvy and start shopping.</p>

        {error && (
          <div className="mt-4 px-4 py-3 bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-2xl text-sm font-medium">
            {error}
          </div>
        )}

        {location.state?.message && !error && (
          <div className="mt-4 px-4 py-3 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-2xl text-sm font-medium">
            {location.state.message}
          </div>
        )}

        <form className="grid gap-4 mt-6" onSubmit={handleSubmit}>
          {/* Full Name */}
          <input
            className="px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 outline-none focus:border-blue-500 transition"
            placeholder="Full Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          {/* Email */}
          <input
            className="px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 outline-none focus:border-blue-500 transition"
            placeholder="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          {/* Password */}
          <div className="relative">
            <input
              className="w-full px-4 py-3 pr-12 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 outline-none focus:border-blue-500 transition"
              placeholder="Password (min 6 characters)"
              type={showPass ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <button
              type="button"
              onClick={() => setShowPass(!showPass)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>

          {/* Role Selection */}
          <div>
            <p className="text-sm font-semibold text-slate-600 dark:text-slate-300 mb-2">
              Register as:
            </p>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => { setRole("user"); setAdminKey(""); }}
                className={`flex items-center justify-center gap-2 py-3 rounded-2xl border-2 font-semibold text-sm transition ${
                  role === "user"
                    ? "border-blue-600 bg-blue-50 dark:bg-blue-900/30 text-blue-600"
                    : "border-slate-200 dark:border-slate-700 text-slate-500 hover:border-blue-300"
                }`}
              >
                <User className="w-4 h-4" />
                User
              </button>
              <button
                type="button"
                onClick={() => setRole("admin")}
                className={`flex items-center justify-center gap-2 py-3 rounded-2xl border-2 font-semibold text-sm transition ${
                  role === "admin"
                    ? "border-purple-600 bg-purple-50 dark:bg-purple-900/30 text-purple-600"
                    : "border-slate-200 dark:border-slate-700 text-slate-500 hover:border-purple-300"
                }`}
              >
                <ShieldCheck className="w-4 h-4" />
                Admin
              </button>
            </div>
          </div>

          {/* Admin Secret Key - sirf tab dikhao jab admin select ho */}
          {role === "admin" && (
            <div className="relative">
              <input
                className="w-full px-4 py-3 pr-12 rounded-2xl bg-purple-50 dark:bg-purple-950/30 border-2 border-purple-300 dark:border-purple-700 outline-none focus:border-purple-500 transition text-sm"
                placeholder="Enter Admin Secret Key"
                type={showKey ? "text" : "password"}
                value={adminKey}
                onChange={(e) => setAdminKey(e.target.value)}
              />
              <button
                type="button"
                onClick={() => setShowKey(!showKey)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-purple-400 hover:text-purple-600"
              >
                {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
              <p className="text-xs text-purple-500 dark:text-purple-400 mt-1 ml-1">
                🔒 Secret key required for admin access
              </p>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className={`py-3 rounded-2xl text-white font-bold transition disabled:opacity-60 ${
              role === "admin"
                ? "bg-purple-600 hover:bg-purple-700"
                : "bg-blue-600 hover:bg-blue-700"
            }`}
          >
            {loading ? "Creating account..." : `Register as ${role === "admin" ? "Admin" : "User"}`}
          </button>
        </form>

        <p className="text-sm mt-5">
          Already registered?{" "}
          <Link to="/login" className="text-blue-600 font-bold">
            Login
          </Link>
        </p>
      </div>
    </section>
  );
};
export default Register;
