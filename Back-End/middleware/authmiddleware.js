import jwt from "jsonwebtoken";

// JWT token verify karo - protected routes ke liye
export const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    console.error("Auth Error: Authorization header missing or does not start with Bearer");
    return res.status(401).json({ success: false, message: "No token provided." });
  }
  const token = authHeader.split(" ")[1];
  try {
    if (!process.env.JWT_SECRET) {
      throw new Error("JWT_SECRET is not defined in environment variables");
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    console.error("JWT Verification Error:", error.message);
    return res.status(401).json({ success: false, message: "Invalid or expired token." });
  }
};

// Sirf admin allow karo
export const adminOnly = (req, res, next) => {
  if (req.user?.role !== "admin") {
    return res.status(403).json({ success: false, message: "Admin access only." });
  }
  next();
};
