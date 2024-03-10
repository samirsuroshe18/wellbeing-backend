import verifyJwt from "../middleware/auth.middleware.js";
import { Router } from "express";
import { acceptTask, getTask, getTaskCurrentState } from "../controllers/userTaskInfo.controller.js";

const router = Router();

//Secure Routes
router.route('/accept-task').post(verifyJwt, acceptTask);
router.route('/get-task').get(verifyJwt, getTask);
router.route('/get-status').post(verifyJwt, getTaskCurrentState);


export default router;