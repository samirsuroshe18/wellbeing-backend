import { sendDislike } from "../controllers/unlike.controller.js";
import verifyJwt from "../middleware/auth.middleware.js";
import { Router } from "express";



const router = Router();

router.route('/send-dislike').post(verifyJwt, sendDislike);


export default router;