import sellerModel from "../models/Seller.js";


// --------------------------------------------------------
const sellerMember = async (req, res) => {
    const allSellers = await sellerModel.find();
    console.log(allSellers.name);
    res.status(200).json({message: "All Sellers", sellers: allSellers});
}

const sellerMemberById = async (req, res) => {
    const sellerId = req.params.sellerId;
    const seller = await sellerModel.findById(sellerId);
    console.log(seller);
    if (!seller) {
        return res.status(404).json({message: "Seller not found"});
    }
    res.status(200).json({message: "Seller found", seller: seller});
} 

export default {sellerMember, sellerMemberById};

