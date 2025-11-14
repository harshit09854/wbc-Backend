import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import sellerModel from "../models/Seller.js";
const JWT_SECRET = process.env.JWT_SECRET_SELLER || "meihuseller";
import productModel from "../models/Product.js";

// Seller Signup
const sellerSignup = async (req, res) => {
  const role = "seller";
  console.log("Signup request received");

  const {
    email,
    password,
    name,
    phone,
    businessName,
    businessType,
    businessAddress,
    businessDescription,
    pincode,
  } = req.body;

  console.log("Request body:", req.body);
  console.log("Files received:", req.files);

  // Access files correctly when using upload.fields()
  const qrFile = req.files?.qr?.[0];
  const profileFile = req.files?.profileImage?.[0];

  if ( !profileFile) {
    return res.status(400).json({ message: "Both QR and Profile Image are required" });
  }

  // console.log("QR File:", qrFile.path);
  console.log("Profile File:", profileFile.path);

  try {
    const existingSeller = await sellerModel.findOne({ email });
    if (existingSeller) {
      return res.status(400).json({ message: "Seller already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newSeller = new sellerModel({
      email,
      password: hashedPassword,
      name,
      phone,
      businessName,
      businessType,
      businessAddress,
      businessDescription,
      pincode,

      // Use the path from Cloudinary or multer's file object
      // qr: qrFile.path,           // <-- changed from req.file.filename
      profileImage: profileFile.path,  // <-- changed from req.file.filename
    });

    await newSeller.save();
    console.log("New seller created:", newSeller);
    const token = jwt.sign({ id: newSeller._id, role: role }, JWT_SECRET, {
      expiresIn: "1h",
    });

    console.log("Token:", token);

    res.status(201).json({ message: "Seller registered successfully", token, role });
  } catch (error) {
    console.error("Server signup error:", error);
    res.status(500).json({ message: "Server error" });
  }
};


// Seller Login
const sellerLogin = async (req, res) => {
  const { email, password } = req.body;
  const role = "seller";
  try {
    const seller = await sellerModel.findOne({ email });
    if (!seller) {
      return res.status(400).json({ message: "Invalid credentials" });
    }
    const isPasswordValid = await bcrypt.compare(password, seller.password);

    if (!isPasswordValid) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign({ id: seller._id, role: role }, JWT_SECRET, {
      expiresIn: "1h",
    });

    res.status(200).json({
      message: "Login successful",
      token: token,
      role: role, // Changed from user.role to seller.role
      businessName: seller.businessName, // Changed from user.businessName to seller.businessName
      name: seller.name, // Changed from user.name to seller.name
    });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// Seller Dashboard
const sellerDashboard = async (req, res) => {
  const sellerId = req.user.id;
  console.log(sellerId);

  try {
    // 1. Seller existence check (Optional, as auth middleware confirms the user exists)
    const sellerExists = await sellerModel.findById(sellerId).select("_id");
    if (!sellerExists) {
      return res.status(404).json({ message: "Seller not found" });
    }

    // 2. Calculate Statistics
    const totalProducts = await productModel.countDocuments({
      seller: sellerId,
    });
    // NOTE: totalOrders, monthlySales logic will go here eventually

    // 3. Send Data to Frontend
    res.status(200).json({
      message: "Seller dashboard stats fetched successfully",
      stats: {
        totalProducts: totalProducts,

        // totalOrders: totalOrders,
        // monthlySales: monthlySales
      },
    });

    // ❌ Note: The original code block below was unreachable and caused confusion. It is removed.
    // res.status(200).json({ message: "Seller Dashboard", sellerData });
  } catch (error) {
    console.error("Seller Dashboard Error:", error);
    res.status(500).json({
      message: "Error fetching seller dashboard data.",
      error: error.message,
    });
  }
};

// Get Seller Profile
const getSellerProfile = async (req, res) => {
  const sellerId = req.user.id;
  console.log(sellerId);
  try {
    // ✅ Correctly selecting specific fields and excluding sensitive ones (like password)
    const sellerProfile = await sellerModel
      .findById(sellerId)
      .select(
        "name email businessName businessAddress businessDescription pincode"
      );

    if (!sellerProfile) {
      return res.status(404).json({ message: "Seller not found" });
    }

    res.status(200).json({
      message: "Seller profile fetched successfully",
      profile: sellerProfile,
    });
  } catch (error) {
    console.error("Get Seller Profile Error:", error);
    res.status(500).json({
      message: "Failed to fetch seller profile",
      error: error.message,
    });
  }
};
// const getSellerDashboardStats = async (req, res) => {
//   const sellerId = req.user.id;

//   const today = new Date();
//   const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

//   try{
//     const totalProducts = await productModel.countDocuments({ seller: sellerId });

//     // 2. All Pending Orders Count
//         // NOTE: Order Model mein items ko Seller se link karna zaroori hai.
//     const pendingOrdersCount = await Order.countDocuments({
//             status: 'Pending',
//             'items.seller': mongoose.Types.ObjectId(sellerId) // Example: Order items mein seller ID check karna
//         });

//         // 3. Monthly Sales Calculation (Current month ka Revenue)
//         const salesResult = await Order.aggregate([
//             {
//                 // Step 1: Filter Orders (current month, completed status, aur is seller ke items ho)
//                 $match: {
//                     createdAt: { $gte: startOfMonth },
//                     status: 'Completed',
//                     'items.seller': mongoose.Types.ObjectId(sellerId)
//                 }
//             },
//             {
//                 // Step 2: Items array ko break karna
//                 $unwind: '$items'
//             },
//             {
//                 // Step 3: Ensure ki item isi seller ka ho
//                 $match: {
//                     'items.seller': mongoose.Types.ObjectId(sellerId)
//                 }
//             },
//             {
//                 // Step 4: Total monthly revenue sum karna
//                 $group: {
//                     _id: null,
//                     totalRevenue: { $sum: '$items.price' } // Assuming items array mein product ki 'price' stored hai
//                 }
//             }
//         ]);

//         const monthlySales = salesResult.length > 0 ? salesResult[0].totalRevenue : 0;

//         res.status(200).json({
//             message: 'Seller dashboard statistics fetched successfully',
//             stats: {
//                 totalProducts: totalProducts,
//                 monthlySales: monthlySales.toFixed(2), // 2 decimal places tak
//                 pendingOrders: pendingOrdersCount,
//             }
//         });

//     } catch (error) {
//         res.status(500).json({ message: 'Error fetching dashboard stats.', error: error.message });
//     }
// };

// ✅ **FIX 4: Add this new function to your controller file**
const getSellerProducts = async (req, res) => {
  try {
    // req.user.id comes from your authentication middleware (e.g., isSellerAuth)
    const sellerId = req.user.id;

    // Find all products where the 'seller' field matches the logged-in seller's ID
    const products = await productModel.find({ seller: sellerId });

    if (!products) {
      // This case is unlikely if 'find' is used, but good to have
      return res.status(404).json({ message: "No products found." });
    }

    res.status(200).json({
      message: "Products fetched successfully",
      products: products,
    });
  } catch (error) {
    console.error("Error fetching seller products:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ✅ **FIX 5: Add 'getSellerProducts' to your export**
export default {
  sellerSignup,
  sellerLogin,
  getSellerProfile,
  sellerDashboard,
  getSellerProducts, // <-- Add it here
};

// export default { sellerSignup, sellerLogin, getSellerProfile, sellerDashboard };
