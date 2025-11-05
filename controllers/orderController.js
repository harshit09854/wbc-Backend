import orderModel from "../models/Order.js";
import cartModel from "../models/Cart.js";
import Product from "../models/Product.js";

const palceOrder = async(req,res)=>{
  const buyerId = req.user.id;
  const { shippingAddress, paymentMethod } = req.body;

  if(!shippingAddress || !paymentMethod){
    return res.status(400).json({ message: "Shipping address and payment method are required" });
  }

  try{
    const cart = await cartModel.findOne({ buyer: buyerId }).populate({
      path: 'items.product',
      select:'name price stock seller'
    });
    if(!cart || cart.items.length === 0){
      return res.status(404).json({ message: "Cannot place order, cart is empty" });
    }
    let totalAmount = 0;
    const orderItems = [];
    for(const item of cart.items){
      const product = item.product;

      if(product.stock < item.quantity){
        return res.status(400).json({ message: `Insufficient stock for product: ${product.name}` });
      }

      orderItems.push({
        product: product._id,
        seller: product.seller,
        name: product.name,
        quantity: item.quantity,
        price: product.price,
      });

      totalAmount += product.price * item.quantity;
    }
    // 3. Product stock update karein (Optional, but Zaroori)
    await  productModel.findByIdAndUpdate( product._id, { $inc: { stock: -item.quantity } });

    const newOrder = new orderModel({
      buyer: buyerId,
      items: orderItems,
      totalAmount:totalAmount,
      shippingAddress:shippingAddress,
      paymentMethod:paymentMethod === 'COD' ? 'Pending' : 'Pending',
      status: 'Pending'
    });

    await newOrder.save();  
    await cartModel.deleteOne({ buyer: buyerId });

    res.status(201).json({ message: "Order placed successfully", order: newOrder._id, totalAmount:totalAmount});
  }
  catch(error){
    res.status(500).json({ message: "Failed to place order", error: error.message });
  }
}

const getBuyerOrders = async(req,res)=>{
  const buyerId = req.user.id;
  try{
    const orders = await orderModel.find({buyer:buyerId}).sort({createdAt: -1}).populate('items.product',image);

    res.status(200).json({ message: "Orders fetched successfully", orders });
  }
  catch(error){
    res.status(500).json({ message: "Failed to fetch orders", error: error.message });
  }
}

const getSellerOrders = async(req,res)=>{
      const sellerId = req.user.id;
      try{
        const orders = await orderModel.find({'items.seller':mongoose.Types.ObjectId(sellerId)}).sort({createdAt: -1}).populate('buyer','name shippingAddress');

// Har order mein se sirf is Seller ke items filter karne ka logic yahan aayega 
        // (Yeh frontend par bhi kiya ja sakta hai, par backend par karna zyada efficient hai)

        const sellerOrders = orders.map(order => {
          return {
            ...order.toObject(),
            items: order.items.filter(item => item.seller.equals(sellerId))
          } 
        });

        res.status(200).json({ message: "Seller's orders fetched successfully", orders: sellerOrders});
      }
  catch(error ){
      res.status(500).json({ message: "Failed to fetch seller's orders", error: error.message }); 
  }
 }

//  const updateOrderStatus = async(req,res)=>{
//   const orderId = req.params.orderId;
//   const sellerId = req.user.id;
//   const { newStatus } = req.body;
  
//   const validStatuses = [ 'Processing', 'Shipped', 'Delivered', 'Cancelled'];

//   if(!validStatuses.includes(newStatus)){
//     return res.status(400).json({ message: "Invalid order status" });
//   }

//   try{
//     const order = await orderModel.findById(orderId);
//     if(!order){
//       return res.status(404).json({ message: "Order not found" });
//     }

//     const isSellerInOrder = order.items.some(item => item.seller.equals(sellerId));

//     if(!isSellerInOrder){
//       return res.status(403).json({ message: "Access Denied: You can only update your own orders" });
//     }

//     order.status = newStatus;
//     await order.save();

//   }
//  }

export default {
  palceOrder,
  getBuyerOrders,
  getSellerOrders,
  }

