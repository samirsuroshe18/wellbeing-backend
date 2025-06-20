import { Router } from "express";
import { deleteUnwantedFiles, getAllResources, updateCloudinaryUrls } from "../controllers/cloudinary.controller.js";

const router = Router();

//Secure Routess
router.route('/get-all').get(getAllResources);
router.route('/delete-all').get(deleteUnwantedFiles);
router.route('/update-url').get(updateCloudinaryUrls);


export default router;