import Product from "../models/Product.js";
import productModel from "../models/Product.js";

const addProduct = async (req, res) => {
  const sellerId = req.user.id;
  const { name, description, price, stock, category, image} = req.body;
   console.log("add product")
   console.log(req.file)

   console.log('--- Cloudinary Upload Successful ---');
    //   console.log('User ID from Token:', req.user?.id); // Check if seller ID exists
    // console.log('File Status:', req.file ? 'File received' : 'NO FILE RECEIVED')
        console.log('------------------------------------');
  //basic validation 
  if (!name || !price || !stock || !category) {
    return res
      .status(400)
      .json({ message: "Name, Price and Category are required" });
  }

  if (isNaN(price) || isNaN(stock) || price <= 0 || stock < 0) {
    return res.status(400).json({ message: "Price must be a positive number" });
  }

  try {
    const newProduct = new productModel({
      seller: sellerId,
      name,
      description,
      price,
      stock,
      category,
      image: req.file.path,
    });
    await newProduct.save();
    res
      .status(201)
      .json({ message: "Product added successfully", product: newProduct });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to add product", error: error.message });
  }
};

const getSellerProducts = async (req, res) => {
  const sellerId = req.user.id;
  try {
    const products = await productModel.find({ seller: sellerId });
    if (products.length === 0) {
      return res
        .status(404)
        .json({ message: "No products found for this seller" });
    }
    res
      .status(200)
      .json({
        message: "Seller's products fetched successfully",
        count: products.length,
        products,
      });
  } catch (error) {
    res
      .status(500)
      .json({
        message: "Failed to fetch seller products",
        error: error.message,
      });
  }
};

const getAllProducts = async (req, res) => {
  console.log("All products")
  try {
    const products = await productModel.find({});
    console.log(products.length)
    console.log(products)
    res
      .status(200)
      .json({
        message: "All products fetched successfully",
        count: products.length,
        products,
      });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to fetch products", error: error.message });
  }
};

//single product ki details
const getProductDetails = async (req, res) => {
  const productId = req.params.productId;
  console.log("single product detail")
  try {
    const product = await productModel
      .findById(productId)
      .populate("seller", "name businessName");
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    console.log(product);
    res
      .status(200)
      .json({
        message: "Product details fetched successfully",
        product: product,
      });
  } catch (error) {
    res
      .status(500)
      .json({
        message: "Failed to fetch product details",
        error: error.message,
      });
  }
};

const updateProduct = async (req, res) => {
  const productId = req.params.productId;
  // 2. Token se Logged-in Seller ki ID nikaalein (Middleware se aati hai)
  const sellerId = req.user.id;

  const updateFields = req.body;

  try {
    const product = await productModel.findById(productId);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    // 5. Ownership Check (Bahut Zaroori Security Step)
    // .equals() function ka use karein kyunki IDs MongoDB Object ID hoti hain
    if (!product.seller.equals(sellerId)) {
      return res
        .status(403)
        .json({
          message: "Access Denied: You can only update your own products",
        });
    }
    // Product ko update karein
    // findByIdAndUpdate ka use karein taki ek hi query mein update ho jaye
    const updatedProduct = await productModel.findByIdAndUpdate(
      productId,
      { $set: updateFields }, // Sirf woh fields update karein jo req.body mein hain
      { new: true, runValidators: true } // new: true se updated document return hoga, runValidators se Model validation chalegi
    );
    res
      .status(200)
      .json({
        message: "Product updated successfully",
        product: updatedProduct,
      });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to update product", error: error.message });
  }
};

const deleteProduct = async (req, res) => {
  const productId = req.params.productId;
  const sellerId = req.user.id;

  try{
    const product = await productModel.findById(productId);

    if(!product.seller.equals(sellerId)){
      return res.status(403).json({ message: "Access Denied: You can only delete your own products" });
    }

    await productModel.findByIdAndDelete(productId);
    res.status(200).json({ message: "Product deleted successfully" });
  }
  catch(error){
    res.status(500).json({ message: "Failed to delete product", error: error.message });
  }
    
  };

 const getProductsBySeller = async (req, res) => {
  const sellerId = req.params.sellerId;
  console.log("single product detail")
  console.log(sellerId)
  try {
    const products = await productModel.find({ seller: sellerId });
    if (products.length === 0) {x
      return res
        .status(404)
        .json({ message: "No products found for this seller" });
    }
    res
      .status(200)
      .json({
        message: "Seller's products fetched successfully",
        count: products.length,
        products,
      });
  } catch (error) {
    res
      .status(500)
      .json({
        message: "Failed to fetch seller products",
        error: error.message,
      });
  }
};
export default {
  addProduct,
  getSellerProducts,
  getAllProducts,
  getProductDetails,
  updateProduct,
  deleteProduct,
  getProductsBySeller,
};
