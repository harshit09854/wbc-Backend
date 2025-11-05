// server.js (FINAL COMPLETED VERSION)

// =======================================================
// 1. ENVIRONMENT & IMPORTS (MUST BE FIRST)
// =======================================================
import dotenv from "dotenv";
dotenv.config(); // Load environment variables first!

import express from "express";
import mongoose from "mongoose";
import cors from "cors";
// import authRoutes from "./routes/authRoutes.js";
import connectDB from "./config/db.js";
// Route Imports
import sellerRoutes from "./routes/sellerRoutes.js";
import buyerRoutes from "./routes/buyerRoutes.js";
import productRoutes from "./routes/ProductRoutes.js";
import cartRoutes from "./routes/cartRoutes.js";

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());
const port = process.env.PORT || 5000;

// =======================================================
// 2. MIDDLEWARE (MUST RUN BEFORE ROUTES)
// =======================================================

// Database Connection (Should run early)
connectDB();

// CORS Configuration (Adjust origin to match your current frontend port, e.g., 5174)
const corsOptions = {
  origin: [
    "https://wbcfrontend.vercel.app/",
    "http://127.0.0.1:5173",
    "http://localhost:5174",
    "http://127.0.0.1:5174",
  ],
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
};
app.use(cors(corsOptions));

// Body Parsing: Must be placed BEFORE routes that handle POST/PUT requests.
app.use(express.json()); // For parsing application/json
app.use(express.urlencoded({ extended: true })); // For parsing form data

// =======================================================
// 3. ROUTES
// =======================================================
app.use("/api/seller", sellerRoutes);
app.use("/api/buyer", buyerRoutes);
app.use("/api/products", productRoutes);
app.use("/api/cart", cartRoutes);

// =======================================================
// 4. SERVER START
// =======================================================
app.listen(port, () =>
  console.log(`Server running on http://localhost:${port}`)
);
