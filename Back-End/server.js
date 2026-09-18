import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env relative to server.js
dotenv.config({ path: path.resolve(__dirname, ".env") });

import express from "express";
import cors from "cors";
import { connectDB } from "./config/db.js";
import { routes } from "./routes/productRouter.js";
import { authRoutes } from "./routes/authRouter.js";
import { orderRoutes } from "./routes/orderRouter.js";
import { paymentRoutes } from "./routes/paymentRouter.js";


const app = express();

app.use(express.json());
app.use(cors({
  origin: [
    "https://react-e-commerce-ruddy-nu.vercel.app/"
  ],
  credentials : true
}));

await connectDB();

// Product routes
app.use("/api/product", routes);

// Auth routes (register, login, verify-admin-key)
app.use("/api/auth", authRoutes);

// Order routes (place order, get orders)
app.use("/api/order", orderRoutes);

// Payment routes (Razorpay: create order, verify payment)
app.use("/api/payment", paymentRoutes);

const PORT = process.env.PORT ;

app.listen(PORT, () => {
  console.log(`Server is Running on PORT ${PORT}`);
});
