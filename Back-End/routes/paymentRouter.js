import { Router } from "express";
import { createRazorpayOrder, verifyPayment } from "../controller/paymentlogic.js";
import { verifyToken } from "../middleware/authmiddleware.js";

export const paymentRoutes = Router();

// Logged-in user hi payment start/verify kar sakta hai
paymentRoutes.post("/create-order", verifyToken, createRazorpayOrder);
paymentRoutes.post("/verify", verifyToken, verifyPayment);
