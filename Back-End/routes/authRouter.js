import { Router } from "express";
import { loginUser, registerUser, verifyAdminKey, forgotPassword, resetPassword } from "../controller/authController.js";

export const authRoutes = Router();

authRoutes.post("/register", registerUser);
authRoutes.post("/login", loginUser);
authRoutes.post("/verify-admin-key", verifyAdminKey);
authRoutes.post("/forgot-password", forgotPassword);
authRoutes.post("/reset-password", resetPassword);
