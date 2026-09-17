import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, KeyRound, MailCheck } from "lucide-react";
import toast from "react-hot-toast";
import { useAuth } from "../context/AuthContext";

const ForgotPassword = () => {
  const { forgotPassword, resetPassword } = useAuth();
  const navigate = useNavigate();

  const [step, setStep] = useState(1); // 1 = email, 2 = otp + new password
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRequestOtp = async (e) => {
    e.preventDefault();
    setError("");
    if (!email) {
      setError("Please enter your email.");
      return;
    }
    setLoading(true);
    const res = await forgotPassword(email);
    setLoading(false);
    if (res.success) {
      toast.success("Agar email registered hai to OTP bhej diya gaya hai");
      setStep(2);
    } else {
      setError(res.message || "Something went wrong.");
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError("");
    if (!otp || !newPassword || !confirmPassword) {
      setError("Please fill all fields.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    if (newPassword.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    setLoading(true);
    const res = await resetPassword(email, otp, newPassword);
    setLoading(false);
    if (res.success) {
      toast.success("Password reset ho gaya! Ab login karo.");
      navigate("/login", { state: { message: "Password reset successful. Please login with your new password." } });
    } else {
      setError(res.message || "Something went wrong.");
    }
  };

  return (
    <section className="max-w-md mx-auto px-4 py-16">
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 border border-slate-200 dark:border-slate-800 shadow-soft">
        {step === 1 ? (
          <>
            <MailCheck className="w-10 h-10 text-blue-600 mb-3" />
            <h1 className="text-3xl font-black">Forgot Password</h1>
            <p className="text-slate-500 mt-2">
              Apna registered email daalo, hum aapko ek OTP bhej denge.
            </p>

            {error && (
              <div className="mt-4 px-4 py-3 bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-2xl text-sm font-medium">
                {error}
              </div>
            )}

            <form className="grid gap-4 mt-6" onSubmit={handleRequestOtp}>
              <input
                className="px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 outline-none focus:border-blue-500 transition"
                placeholder="Email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <button
                type="submit"
                disabled={loading}
                className="py-3 rounded-2xl bg-blue-600 text-white font-bold hover:bg-blue-700 transition disabled:opacity-60"
              >
                {loading ? "Sending OTP..." : "Send OTP"}
              </button>
            </form>
          </>
        ) : (
          <>
            <KeyRound className="w-10 h-10 text-blue-600 mb-3" />
            <h1 className="text-3xl font-black">Reset Password</h1>
            <p className="text-slate-500 mt-2">
              <b>{email}</b> pe bheja gaya OTP daalo aur naya password set karo.
            </p>

            {error && (
              <div className="mt-4 px-4 py-3 bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-2xl text-sm font-medium">
                {error}
              </div>
            )}

            <form className="grid gap-4 mt-6" onSubmit={handleResetPassword}>
              <input
                className="px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 outline-none focus:border-blue-500 transition tracking-widest text-center font-bold"
                placeholder="4-digit OTP"
                maxLength={4}
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
              />
              <div className="relative">
                <input
                  className="w-full px-4 py-3 pr-12 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 outline-none focus:border-blue-500 transition"
                  placeholder="New Password"
                  type={showPass ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <input
                className="px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 outline-none focus:border-blue-500 transition"
                placeholder="Confirm New Password"
                type={showPass ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
              <button
                type="submit"
                disabled={loading}
                className="py-3 rounded-2xl bg-blue-600 text-white font-bold hover:bg-blue-700 transition disabled:opacity-60"
              >
                {loading ? "Resetting..." : "Reset Password"}
              </button>
              <button
                type="button"
                onClick={() => setStep(1)}
                className="text-sm text-slate-500 hover:underline"
              >
                Wrong email? Go back
              </button>
            </form>
          </>
        )}

        <p className="text-sm mt-5">
          Remember your password?{" "}
          <Link to="/login" className="text-blue-600 font-bold">
            Login
          </Link>
        </p>
      </div>
    </section>
  );
};
export default ForgotPassword;
