import { Router } from "express";
import { bulkData, createProduct, deleteData, getallproduct, Updateproduct, toggleStock } from "../controller/productlogic.js";
import { verifyToken, adminOnly } from "../middleware/authmiddleware.js";

export const routes = Router()

// Public - koi bhi products dekh sakta hai
routes.get("/getdata", getallproduct)

// Admin only - product create/edit/delete/stock change
routes.post("/create", verifyToken, adminOnly, createProduct)
routes.post("/bulkdata", verifyToken, adminOnly, bulkData)
routes.put("/update/:name", verifyToken, adminOnly, Updateproduct)
routes.delete("/delete/:name", verifyToken, adminOnly, deleteData)
routes.patch("/toggle-stock/:id", verifyToken, adminOnly, toggleStock)
