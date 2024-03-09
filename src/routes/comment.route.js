import verifyJwt from "../middleware/auth.middleware.js";
import { Router } from "express";
import { postComment, getComments} from "../controllers/comment.controller.js";

const router = Router();

//Secure Routess
router.route('/post-comment').post(verifyJwt, postComment);
router.route('/get-comment').post(verifyJwt, getComments);


export default router;