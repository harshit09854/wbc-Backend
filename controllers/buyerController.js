// controllers/buyerController.js (FINAL CORRECTED VERSION)

import bcrypt from "bcrypt";
import buyerModel from "../models/Buyer.js";
import jwt from "jsonwebtoken";
// NOTE: Product is needed for Cart functions, so keep it imported.
// import cartModel from "../models/Cart.js"; // Uncomment when adding Cart functions

const JWT_SECRET = process.env.JWT_SECRET_BUYER || "meihubuyer";
// console.log('JWT_SECRET:', JWT_SECRET ? 'Set' : 'Not set!'); // Debug line, can be removed

// --------------------------------------------------------
// 1. BUYER SIGNUP
// --------------------------------------------------------
const buyerSignup = async (req, res) => {
  const { name, email, password, phone, confirmPassword } = req.body;
  console.log("buyer Signup")
  try {
    if (password !== confirmPassword) {
      return res.status(400).json({ message: "Passwords do not match" });
    }

    const existingBuyer = await buyerModel.findOne({ email });
    if (existingBuyer) {
      return res.status(400).json({ message: "Buyer already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newBuyer = new buyerModel({
      name,
      email,
      password: hashedPassword,
      phone,
    });

    await newBuyer.save();

    const token = jwt.sign({ id: newBuyer._id, role: "buyer" }, JWT_SECRET, {
      expiresIn: "1h",
    });

    res.status(201).json({
      message: "Buyer registered successfully",
      token,
      role: "buyer",
    });
  } catch (error) {
    console.error("Signup error:", error);
    res
      .status(500)
      .json({ message: "Error during signup", error: error.message });
  }
};

// --------------------------------------------------------
// 2. BUYER LOGIN
// --------------------------------------------------------
const buyerLogin = async (req, res) => {
  const { email, password } = req.body;
  console.log("Buyer Login")
  console.log(email, password);
  try {
    const buyer = await buyerModel.findOne({ email });
    if (!buyer) {
      return res.status(400).json({ message: "Invalid credentials" });
    }
    const isPasswordValid = await bcrypt.compare(password, buyer.password);
    if (!isPasswordValid) {
      return res.status(400).json({ message: "Invalid credentials" });
    }
    const token = jwt.sign({ id: buyer._id, role: "buyer" }, JWT_SECRET, {
      expiresIn: "1h",
    });

    // Send user data without sensitive information
    const userData = {
      name: buyer.name,
      email: buyer.email,
      phone: buyer.phone,
      role: "buyer",
      id: buyer._id,
    };

    res.status(200).json({
      message: "Login successful",
      token,
      user: userData,
      role: "buyer",
      name: buyer.name,
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: error.message });
  }
};

// --------------------------------------------------------
// 3. BUYER DASHBOARD
// --------------------------------------------------------
const buyerDashboard = async (req, res) => {
  const buyerId = req.user.id;
  console.log("buyer dashboard");
  
  try {
    const buyerData = await buyerModel.findById(buyerId).select("-password"); // Exclude password
    if (!buyerData) {
      return res.status(404).json({ message: "Buyer not found" });
    }
    console.log(buyerData);
    res
      .status(200)
      .json({ message: "Buyer   Dashboard", buyerData: buyerData });
  } catch (error) {
    console.error("Dashboard error:", error);
    res.status(500).json({ message: error.message });
  }
};

// --------------------------------------------------------
// 4. BUYER LOGOUT
// --------------------------------------------------------
const buyerLogout = (req, res) => {
  res.status(200).json({
    message: "Successfully logged out. Please discard your token.",
    success: true,
  });
};

// --------------------------------------------------------
// 5. USER'S WISHLISTS ITEMS
// --------------------------------------------------------
const getWishlistItems = async (req, res) => {
  const buyerId = req.user.id;
  
  try {
    const buyer = await buyerModel.findById(buyerId);

    if (!buyer) {
      return res.status(404).json({ message: "Buyer not found" });
    }

    const wishlistItems = buyer.wishlist;
    res
      .status(200)
      .json({ message: "Wishlist items fetched successfully", wishlistItems });
  } catch (error) {
    console.error("Wishlist error:", error);
    res.status(500).json({ message: error.message });
  }
};

// --------------------------------------------------------
// 6. Payment(Price)
// --------------------------------------------------------
const payment = async (req, res) => {
  try {
    const data = req.body;
    const token = req.headers.authorization.split(" ")[1];
    console.log(token);
    console.log(data);
    return res.status(200).json({ message: "success" });
  } catch (err) {
    console.log(err);
  }
};

// --------------------------------------------------------
// 7. UPDATE BUYER PROFILE
// --------------------------------------------------------
const updateBuyerProfile = async (req, res) => {
  const buyerId = req.user.id;
  const { name, phone, address } = req.body;

  try {
    const updatedBuyer = await buyerModel.findByIdAndUpdate(
      buyerId,
      { name, phone, address },
      { new: true, runValidators: true }
    ).select("-password");

    if (!updatedBuyer) return res.status(404).json({ message: "Buyer not found" });

    res.status(200).json({ message: "Profile updated successfully", user: updatedBuyer });
  } catch (error) {
    res.status(500).json({ message: "Failed to update profile", error: error.message });
  }
};

// --------------------------------------------------------
// 6. EXPORT THE FUNCTIONS
// --------------------------------------------------------
export default {
  buyerSignup,
  buyerLogin,
  buyerDashboard,
  buyerLogout,
  getWishlistItems,
  payment,
  updateBuyerProfile,
  // NOTE: Cart functions (addToCart, getCart) are defined and exported in cartController.js
};
