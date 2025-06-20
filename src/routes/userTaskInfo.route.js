import verifyJwt from "../middleware/auth.middleware.js";
import { Router } from "express";
import { acceptTask, getTask, getTaskCurrentState, viewAcceptedTask } from "../controllers/userTaskInfo.controller.js";

const router = Router();

//Secure Routes
router.route('/accept-task').post(verifyJwt, acceptTask);
router.route('/get-task').get(verifyJwt, getTask);
router.route('/get-status').post(verifyJwt, getTaskCurrentState);
router.route('/view-task').post(verifyJwt, viewAcceptedTask);

export default router;