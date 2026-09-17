import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

import { User } from "../model/userModel.js";
import { sendPasswordResetOtpEmail } from "../utils/sendEmail.js";

// ─── REGISTER ───────────────────────────────────────────────
export const registerUser = async (req, res) => {
  try {
    const { name, email, password, role, adminKey } = req.body;

    if (!name || !email || !password) {
      return res
        .status(400)
        .json({ success: false, message: "All fields are required." });
    }

  
    if (role === "admin") {
      if (!adminKey || adminKey !== process.env.ADMIN_SECRET_KEY) {
        return res
          .status(403)
          .json({
            success: false,
            message: "Invalid Admin Secret Key. Access denied.",
          });
      }
    }

    // Duplicate email check
    const existing = await User.findOne({ email });
    
    
    if (existing) {
      return res
        .status(404)
        .json({
          success: false,
          message: "Email already registered. Please login.",
        });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await User.create({
      name,
      email,
      password: hashedPassword,
      role: role === "admin" ? "admin" : "user",
    });

    // JWT token banao
    const token = jwt.sign(
      { id: newUser._id, email: newUser.email, role: newUser.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" },
    );

    return res.status(201).json({
      success: true,
      token,
      user: { name: newUser.name, email: newUser.email, role: newUser.role },
    });
  } catch (error) {
    console.error("Register error:", error);
    return res
      .status(500)
      .json({ success: false, message: "Server error. Try again." });
  }
};

// ─── LOGIN ──────────────────────────────────────────────────


export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "All fields are required.",
      });
    }

    const found = await User.findOne({ email });

    if (!found) {
      return res.status(404).json({
        success: false,
        message: "Email not registered. Please register first.",
      });
    }

    // Compare entered password with hashed password
    const isMatch = await bcrypt.compare(password, found.password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password.",
      });
    }

    const token = jwt.sign(
      {
        id: found._id,
        email: found.email,
        role: found.role,
      },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    return res.status(200).json({
      success: true,
      token,
      user: {
        name: found.name,
        email: found.email,
        role: found.role,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error. Try again.",
    });
  }
};

// ─── VERIFY ADMIN KEY (extra check endpoint) ────────────────
export const verifyAdminKey = async (req, res) => {
  const { adminKey } = req.body;
  if (!adminKey || adminKey !== process.env.ADMIN_SECRET_KEY) {
    return res
      .status(403)
      .json({ success: false, message: "Invalid Admin Secret Key." });
  }
  return res.status(200).json({ success: true, message: "Key verified." });
};

// ─── FORGOT PASSWORD (Step 1: OTP email karo) ────────────────
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ success: false, message: "Email is required." });
    }

    const user = await User.findOne({ email });

    // Security best-practice: chahe email exist kare ya nahi, same success message
    // dete hain — isse attacker ye pata nahi laga sakta ki konsa email registered hai.
    if (!user) {
      return res.status(200).json({
        success: true,
        message: "Agar ye email registered hai, to OTP bhej diya gaya hai.",
      });
    }

    const otp = String(Math.floor(1000 + Math.random() * 9000)); // 4-digit OTP
    user.resetOtp = otp;
    user.resetOtpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minute valid
    await user.save();

    await sendPasswordResetOtpEmail(user, otp);

    return res.status(200).json({
      success: true,
      message: "Agar ye email registered hai, to OTP bhej diya gaya hai.",
    });
  } catch (error) {
    console.error("Forgot password error:", error);
    return res.status(500).json({ success: false, message: "Server error. Try again." });
  }
};

// ─── RESET PASSWORD (Step 2: OTP verify + naya password set) ─
export const resetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;

    if (!email || !otp || !newPassword) {
      return res.status(400).json({ success: false, message: "All fields are required." });
    }
    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password kam se kam 6 characters ka hona chahiye.",
      });
    }

    const user = await User.findOne({ email });
    if (!user || !user.resetOtp) {
      return res.status(400).json({ success: false, message: "Invalid or expired OTP." });
    }
    if (user.resetOtpExpiry < new Date()) {
      user.resetOtp = null;
      user.resetOtpExpiry = null;
      await user.save();
      return res.status(400).json({
        success: false,
        message: "OTP expire ho gaya hai. Dobara 'Forgot Password' try karo.",
      });
    }
    if (String(otp).trim() !== user.resetOtp) {
      return res.status(400).json({ success: false, message: "Galat OTP." });
    }

    user.password = await bcrypt.hash(newPassword, 10);
    user.resetOtp = null;
    user.resetOtpExpiry = null;
    await user.save();

    return res.status(200).json({
      success: true,
      message: "Password successfully reset ho gaya. Ab login karo.",
    });
  } catch (error) {
    console.error("Reset password error:", error);
    return res.status(500).json({ success: false, message: "Server error. Try again." });
  }
};
