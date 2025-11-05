// controllers/cartController.js

import cartModel from '../models/Cart.js';
import productModel from '../models/Product.js'; 

// --------------------------------------------------------
// 1. ADD ITEM TO CART (POST /api/cart/add)
// --------------------------------------------------------
const addToCart = async (req, res) => {
    // The buyerId is extracted from the JWT payload by authenticateToken middleware
    const buyerId = req.user.id; 
    const { productId, quantity } = req.body;
    console.log("add to cart")
    
    // Ensure quantity is an integer, defaulting to 1
    const qty = parseInt(quantity || 1); 

    if (!productId || qty < 1) {
        return res.status(400).json({ message: "Invalid product ID or quantity." });
    }

    try {
        // 1. Check Product existence and stock
        const product = await productModel.findById(productId);
        if (!product || product.stock < qty) {
            return res.status(404).json({ message: "Product not available or insufficient stock." });
        }

        // 2. Find existing cart for the buyer or create a new one
        let cart = await cartModel.findOne({ buyer: buyerId });
        if (!cart) {
            cart = new cartModel({ buyer: buyerId, items: [] });
        }

        // 3. Check if product is already in cart
        const itemIndex = cart.items.findIndex(item => item.product.toString() === productId);

        if (itemIndex > -1) {
            // Product exists: update quantity
            cart.items[itemIndex].quantity += qty;
        } else {
            // New product: add item
            cart.items.push({ product: productId, quantity: qty });
        }

        await cart.save();
        res.status(200).json({ message: "Item added to cart successfully", cart });

    } catch (error) {
        console.error("Cart Add Error:", error);
        res.status(500).json({ message: "Failed to add item to cart", error: error.message });
    }
};

// --------------------------------------------------------
// 2. GET CART CONTENTS (GET /api/cart)
// --------------------------------------------------------
const getCart = async(req, res) => {
    const buyerId = req.user.id;
    
    try {
        // Find cart and populate product details (name, price, etc.)
        const cart = await cartModel.findOne({ buyer: buyerId })
                                    .populate('items.product', 'name price stock seller'); 

        if (!cart) {
            return res.status(200).json({ message: "Cart not found", items: [] }); // Return 200 with empty array for empty cart
        }
        console.log("cart details")
        console.log(cart)

        res.status(200).json({ message: "Cart fetched successfully", items: cart.items });

    } catch (error) {
        console.error("Cart Fetch Error:", error);
        res.status(500).json({ message: "Failed to fetch cart", error: error.message });
    }
};

// --------------------------------------------------------
// 3. UPDATE CART ITEM QUANTITY (PATCH /api/cart/update/:productId)
// --------------------------------------------------------
const updateCartItemQuantity = async (req, res) => {
    const buyerId = req.user.id;
    const productId = req.params.productId;
    const { quantity } = req.body;
    const newQty = parseInt(quantity);

    if (isNaN(newQty) || newQty < 0) {
        return res.status(400).json({ message: 'Invalid quantity provided.' });
    }

    try {
        const cart = await cartModel.findOne({ buyer: buyerId });
        if (!cart) {
            return res.status(404).json({ message: 'Cart not found.' });
        }

        const itemIndex = cart.items.findIndex(item => item.product.toString() === productId);

        if (itemIndex > -1) {
            if (newQty === 0) {
                // If quantity is 0, remove the item
                cart.items.splice(itemIndex, 1);
            } else {
                // Update quantity (optional stock check can be done here)
                cart.items[itemIndex].quantity = newQty;
            }
            
            await cart.save();
            return res.status(200).json({ message: 'Cart quantity updated successfully', items: cart.items });
        } else {
            return res.status(404).json({ message: 'Product not found in cart.' });
        }

    } catch (error) {
        console.error("Cart Update Error:", error);
        res.status(500).json({ message: 'Error updating cart quantity.', error: error.message });
    }
};

// --------------------------------------------------------
// 4. REMOVE ITEM FROM CART (DELETE /api/cart/remove/:productId)
// --------------------------------------------------------
const removeCartItem = async (req, res) => {
    const buyerId = req.user.id;
    const productId = req.params.productId;

    try {
        const cart = await cartModel.findOne({ buyer: buyerId });

        if (!cart) {
            return res.status(404).json({ message: 'Cart not found.' });
        }

        // Use $pull to remove item from array cleanly
        cart.items = cart.items.filter(item => item.product.toString() !== productId);
        
        await cart.save();
        
        return res.status(200).json({ message: 'Product removed from cart successfully', items: cart.items });

    } catch (error) {
        console.error("Cart Remove Error:", error);
        res.status(500).json({ message: 'Error removing item from cart.', error: error.message });
    }
};


export { addToCart, getCart, updateCartItemQuantity, removeCartItem };