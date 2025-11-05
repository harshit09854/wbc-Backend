import mongoose from "mongoose";

const cartItemSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: [1, "Quantity must be at least 1"],
      default: 1,
    },
  },
  { _id: false } // prevents extra _id for each subdocument
);

const cartSchema = new mongoose.Schema(
  {
    buyer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Buyer",
      required: true,
      unique: true, // Each buyer has only one cart
    },
    items: {
      type: [cartItemSchema],
      default: [],
    },
  },
  { timestamps: true } // Adds createdAt and updatedAt automatically
);

const Cart = mongoose.model("Cart", cartSchema);
export default Cart;
