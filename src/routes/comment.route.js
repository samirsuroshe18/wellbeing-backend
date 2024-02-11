import verifyJwt from "../middleware/auth.middleware.js";
import { Router } from "express";
import { postComment } from "../controllers/comment.controller.js";


const router = Router();

router.route('/post-comment').post(verifyJwt, postComment);


export default router;