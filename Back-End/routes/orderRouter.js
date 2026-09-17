import { Router } from "express";
import { createOrder, getMyOrders, getAllOrders, updateOrderStatus, sendDeliveryOtp } from "../controller/orderlogic.js";
import { verifyToken, adminOnly } from "../middleware/authmiddleware.js";

export const orderRoutes = Router();

// Logged-in user hi order place kar sakta hai / apne orders dekh sakta hai
orderRoutes.post("/create", verifyToken, createOrder);
orderRoutes.get("/my/:email", verifyToken, getMyOrders);

// Admin only - sabke orders dekhne ke liye + status update karne ke liye
orderRoutes.get("/all", verifyToken, adminOnly, getAllOrders);
orderRoutes.patch("/status/:id", verifyToken, adminOnly, updateOrderStatus);
orderRoutes.post("/send-otp/:id", verifyToken, adminOnly, sendDeliveryOtp);
