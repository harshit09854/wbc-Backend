// =======================================================
// CART ROUTES (Final Version)
// =======================================================

import express from "express";
import * as cartController from "../controllers/cartController.js";
import { authenticateToken } from "../middleware/authMiddleware.js";

const router = express.Router();

// =======================================================
// ROUTES: Cart Management
// =======================================================

// Add item to cart
router.post("/add", authenticateToken, cartController.addToCart);

// Get all cart items for the logged-in user
router.get("/", authenticateToken, cartController.getCart);

// Update quantity of a specific cart item
router.patch(
  "/update/:productId",
  authenticateToken,
  cartController.updateCartItemQuantity
);

// Remove a specific product from the cart
router.delete(
  "/remove/:productId",
  authenticateToken,
  cartController.removeCartItem
);

export default router;
