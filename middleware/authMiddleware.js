// middleware/authMiddleware.js (CORRECTED FINAL VERSION)

// middleware/authMiddleware.js (Final Secret Check)

// middleware/authMiddleware.js (CORRECTED FINAL VERSION)

import jwt from 'jsonwebtoken';
// ... (Secret key definitions are fine) ...
const JWT_SECRET_VERIFY_SELLER = process.env.JWT_SECRET_SELLER || 'meihuseller'; // Should be 'meihuseller'
console.log('JWT_SECRET_VERIFY_SELLER:', JWT_SECRET_VERIFY_SELLER);
const JWT_SECRET_VERIFY_BUYER = process.env.JWT_SECRET_BUYER || 'meihubuyer';   // Should be 'meihubuyer'
const authenticateToken = (req, res, next) => {
    // 💡 FIX 1: DEFINE authHeader by reading the Authorization header
    const authHeader = req.headers.authorization; 
    console.log('authHeader:', authHeader); 
    let token = null;
    // 💡 FIX 2: Check if the header exists and extract the token part after 'Bearer '
     token = authHeader && authHeader.startsWith('Bearer ') 
        ? authHeader.split(' ')[1] 
        : null;
        console.log('token:', token);


    if (!token) {
        return res.status(401).json({ message: 'Access Denied: No Token Provided or Invalid Format' });
    }

    // 1. Try verifying with Seller Secret
    jwt.verify(token, JWT_SECRET_VERIFY_SELLER, (errSeller, sellerUser) => {
        
        if (errSeller) {
            console.log("mei hu buyer");
            // 2. If Seller verification fails, try Buyer Secret
            jwt.verify(token, JWT_SECRET_VERIFY_BUYER, (errBuyer, buyerUser) => {
                if (errBuyer) {
                    // Fails both: Token is truly invalid or expired.
                    return res.status(403).json({ message: 'Invalid or Expired Token' });
                }
                // Passes as Buyer
                req.user = buyerUser; 
                next();
            });
        } else {
            // Passes as Seller
            req.user = sellerUser;
            next();
        }
    });
};

// ... (rest of the file is correct) ...

const isSeller = (req, res, next) => {
    // This function is fine, as it checks the role attached by authenticateToken
    if(req.user && req.user.role === 'seller'){
        next();
    }
    else{
        res.status(403).json({ message: "Access Denied: Sellers Only" });
    }
};

export { authenticateToken, isSeller };