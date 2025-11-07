import express from "express";
import * as memberController from "../controllers/memberController.js";
import { authenticateToken } from "../middleware/authMiddleware.js";

const router = express.Router();


router.get('/', memberController.sellerMember);


export default router;


