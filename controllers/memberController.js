import sellerModel from "../models/Seller.js";


// --------------------------------------------------------
const sellerMember = async (req, res) => {
    const allSellers = await sellerModel.find();
    console.log(allSellers.name);
    res.status(200).json({message: "All Sellers", sellers: allSellers});
}

export {
    sellerMember
}
