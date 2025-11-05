import mongoose from "mongoose";

const orderItemSchema = new mongoose.Schema({
    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true
    },
    seller:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Seller',
        required: true
    },
    name:String,
    quantity:Number,
    price:Number,

    });

    const orderSchema = new mongoose.Schema({ 
      buyer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Buyer',
        required: true
      },
      items: [orderItemSchema],
      totalAmount:{
        type: Number,
        required: true
      },
      shippingAddress:{
        address:String,
        city:String,
        state:String,
        pincode:String
      
      },
      status:{
        type: String,
        enum: ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'],
        default: 'Pending'
      },
      paymentMethod:String,
      },{timestamps:true});

const orderModel = mongoose.model('Order', orderSchema);
export default orderModel;