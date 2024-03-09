import verifyJwt from "../middleware/auth.middleware.js";
import { Router } from "express";
import { acceptTask, getTask } from "../controllers/userTaskInfo.controller.js";

const router = Router();

//Secure Routes
router.route('/accept-task').post(verifyJwt, acceptTask);
router.route('/get-task').get(verifyJwt, getTask);


export default router;