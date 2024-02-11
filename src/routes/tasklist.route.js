import { Router } from "express";
import { createTask } from "../controllers/taskCollection.controller.js";
import verifyJwt from "../middleware/auth.middleware.js";
import { upload } from "../middleware/multer.middleware.js";


const router = Router();

router.route('/create-task').post(verifyJwt, upload.single("taskReference"), createTask);


export default router;