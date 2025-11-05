// models/Buyer.js

import mongoose from "mongoose";

const buyerSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, match: /.+\@.+\..+/ },
  password: { type: String, required: true },
  phone: { type: String, required: true, match: /^[0-9]{10,15}$/ },
  shippingAddress: { type: String },
});

const buyerModel = mongoose.model("Buyer", buyerSchema);
export default buyerModel;
