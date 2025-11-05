import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import multer from 'multer';
import dotenv from 'dotenv';


// Load environment variables if this file is imported outside of server.js
// If server.js runs first, this is redundant but harmless.
dotenv.config();


// 1. Configure Cloudinary with credentials from .env
// You must set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

// 2. Create the Cloudinary storage engine
const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        // Folder in Cloudinary where files will be stored
        folder: 'e_commerce_products',
        // Set file format (e.g., 'jpeg', 'png')
        format: async (req, file) => 'jpeg' , 
        // Generates a unique public ID for each file
        public_id: (req, file) => {
            const fileName = file.originalname.split('.')[0];
            // Use the product name or a unique identifier for better management
            return `${fileName}-${Date.now()}`;
        },
        // Optional: Apply transformations upon upload (e.g., resize for previews)
        transformation: [{ width: 800, height: 800, crop: "limit" }]
    },
});

console.log()
// 3. Configure Multer to use the Cloudinary storage
// We set a file size limit of 10MB here.
const uploadCloud = multer({ 
    storage: storage,
    limits: { fileSize: 10 * 1024 * 1024 } // 10MB file size limit
});

// Export the configured Multer instance for use in routes
export default uploadCloud;