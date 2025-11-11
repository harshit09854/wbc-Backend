import express from "express";
import productController from "../controllers/productController.js";
import { authenticateToken } from "../middleware/authMiddleware.js";

const router = express.Router();

// ✅ Public route (anyone can see all products)
router.get("/",  productController.getAllProducts);

// ✅ Seller routes (require authentication)
router.post("/add", authenticateToken, productController.addProduct);
router.get("/seller", authenticateToken, productController.getSellerProducts);
router.get("/:productId", productController.getProductDetails);
router.put("/:productId", authenticateToken, productController.updateProduct);
router.delete(
  "/:productId",
  authenticateToken,
  productController.deleteProduct
);
router.get("/showSellerProds/:sellerId", productController.getProductsBySeller);

export default router;
