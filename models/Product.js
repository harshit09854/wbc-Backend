// models/Product.js

import mongoose from 'mongoose';

// Define the schema first
const productSchema = new mongoose.Schema({
    seller: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Seller', // Links to the Seller model
        required: true
    },
    name: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    stock: {
        type: Number,
        required: true,
        min: 0 // Stock cannot be negative
    },
    category: {
        type: String,
        required: true
    },
    // Product image URLs
    image: [{
        type: String 
    }]
}, { timestamps: true }); // Automatically adds createdAt and updatedAt fields

// 💡 The FIX: Use mongoose.models to check for existence before compiling.
// If the model exists, use it; otherwise, compile and return the new model.
const Product = mongoose.models.Product || mongoose.model('Product', productSchema);

export default Product;