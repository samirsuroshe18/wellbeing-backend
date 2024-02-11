import { Router } from "express";
import verifyJwt from "../middleware/auth.middleware.js";
import { upload } from "../middleware/multer.middleware.js";
import { uploadPost, getUploadedPost } from "../controllers/upload.controller.js";


const router = Router();

router.route('/upload-post').post(verifyJwt, upload.single("multiMedia"), uploadPost); 
router.route('/get-post').get(verifyJwt, getUploadedPost);


export default router;