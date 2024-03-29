import { sendLike } from "../controllers/like.controller.js";
import verifyJwt from "../middleware/auth.middleware.js";
import { Router } from "express";

const router = Router();

//Secure Routes
router.route('/send-like').post(verifyJwt, sendLike);


export default router;