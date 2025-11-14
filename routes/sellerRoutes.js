import express from "express";
const router = express.Router();
import sellerController from "../controllers/sellerController.js";
import { authenticateToken, isSeller } from "../middleware/authMiddleware.js";
import productController from "../controllers/productController.js";
import orderController from "../controllers/orderController.js";
import uploadCloud from "../config/cloudinaryConfig.js";
// Seller ke routes alag
router.post(
  "/signup",
  (req, res, next) => {
    console.log("Incoming signup request");
    next();
  },
  uploadCloud.fields([
    // { name: "qr", maxCount: 1 },
    { name: "profileImage", maxCount: 1 },
  ]),
  (req, res, next) => {
    console.log("Files:", req.files);
    console.log("Body:", req.body);
    next();
  },
  sellerController.sellerSignup
);


router.post("/login", sellerController.sellerLogin);

// 1. SELLER PROFILE ROUTE (Basic Info)
// URL: /api/seller/profile
router.get(
  "/profile",
  authenticateToken,
  isSeller,
  sellerController.getSellerProfile
);

// 2. SELLER DASHBOARD STATS ROUTE (Analytics)
// URL: /api/seller/dashboard

router.get("/dashboard", authenticateToken, sellerController.sellerDashboard);

//Product management routes
//Router for adding a new product
router.post(
  "/product/add",
  authenticateToken,
  isSeller,
  uploadCloud.single("productImage"),
  productController.addProduct
);

//Seller ke sare products dekane ke liye
router.get(
  "/products",
  authenticateToken,
  isSeller,
  productController.getSellerProducts
);

// PRODUCT UPDATION ROUTE (Protected aur ID ke saath)
// Method: PUT ya PATCH (PATCH behtar hai partial update ke liye, lekin PUT bhi chalta hai)
// URL: /api/seller/product/:productId  (jahan :productId woh product ki ID hai jise update karna hai)
router.put(
  "/product/:productId",
  authenticateToken,
  isSeller,
  productController.updateProduct
);

router.patch(
  "/product/:productId",
  authenticateToken,
  isSeller,
  productController.updateProduct
); // Dono use kar sakte hain

router.delete(
  "/product/:productId",
  authenticateToken,
  isSeller,
  productController.deleteProduct
);

// ORDER MANAGEMENT ROUTES (Seller)
// 1. Seller ke saare orders dekhna
// URL: /api/seller/orders
router.get(
  "/orders",
  authenticateToken,
  isSeller,
  orderController.getSellerOrders
);

// 2. Order ka status update karna
// URL: /api/seller/order/:orderId/status
// router.patch('/order/:orderId/status', authenticateToken, isSeller, orderController.updateOrderStatus);

export default router;
