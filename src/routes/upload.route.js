import { Router } from "express";
import verifyJwt from "../middleware/auth.middleware.js";
import { upload } from "../middleware/multer.middleware.js";
import { uploadPost, getUploadedPost, getWellPoints } from "../controllers/upload.controller.js";

const router = Router();

//Secure Routes
router.route('/upload-post').post(verifyJwt, upload.single("multiMedia"), uploadPost); 
router.route('/get-post').get(verifyJwt, getUploadedPost);
router.route('/get-points').get(verifyJwt, getWellPoints);


export default router;