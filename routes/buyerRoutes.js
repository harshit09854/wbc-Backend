// routes/buyerRoutes.js (CORRECTED FINAL STRUCTURE)

import express from "express";
const router = express.Router();

// 💡 FIX 1: Import the functions directly via default import
import controller from "../controllers/buyerController.js";
import { authenticateToken } from "../middleware/authMiddleware.js";

// 💡 FIX 2: Use the imported functions directly
router.post("/signup", controller.buyerSignup);
router.post("/login", controller.buyerLogin);
router.post("/logout", authenticateToken, controller.buyerLogout);
router.get("/dashboard", authenticateToken, controller.buyerDashboard);
router.get("/wishlist", authenticateToken, controller.getWishlistItems);
router.post("/payment", authenticateToken, controller.payment);

// ... (Order routes will use orderController functions) ...

export default router;
