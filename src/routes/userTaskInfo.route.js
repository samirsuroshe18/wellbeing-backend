import verifyJwt from "../middleware/auth.middleware.js";
import { Router } from "express";
import { acceptTask } from "../controllers/userTaskInfo.controller.js";


const router = Router();

router.route('/accept-task').post(verifyJwt, acceptTask);


export default router;