import { Router } from "express";
import { loginUser, logoutUser, registerUser } from "../controllers/user.controller.js";
import verifyJwt from "../middleware/auth.middleware.js";
import { upload } from "../middleware/multer.middleware.js";

const router = Router();

router.route('/register').post(upload.single("profilePicture"), registerUser);
router.route('/login').post(loginUser);

//Secure routes
router.route('/logout').get(verifyJwt, logoutUser);


export default router;