import { Router } from "express";
import { loginUser, logoutUser, registerUser } from "../controllers/user.controller.js";
import verifyJwt from "../middleware/auth.middleware.js";


const router = Router();

router.route('/register').post(registerUser);
router.route('/login').post(loginUser);


//Secure routes
router.route('/logout').get(verifyJwt, logoutUser);


export default router;