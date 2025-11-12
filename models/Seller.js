// models/Seller.js
import mongoose from "mongoose"

const sellerSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true }, // Hashed
    name: { type: String, required: true }, // Seller ka naam
    businessName: { type: String, required: true },
    businessAddress: { type: String, required: true },
    businessDescription: { type: String, required: false },
    pincode: { type: String, required: true },
    isVerified: { type: Boolean, default: false }, 
    profileImage:{type:String,required:true},
    qr:{type:String,required:true}
    // Admin verification ke liye
    // Aur koi seller specific field jaise bank details
});

const sellerModel = mongoose.model("Seller", sellerSchema);
export default sellerModel;