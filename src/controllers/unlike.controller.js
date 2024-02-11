import asyncHandler from "../utils/AsyncHandler.js";
import ApiResponse from "../utils/ApiResponse.js";
import mongoose from "mongoose";
import { Dislike } from "../models/dislikes.model.js";


const sendDislike = asyncHandler(async (req, res) =>{
    const dislikedBy = new mongoose.Types.ObjectId(req.body.dislikedBy);
    const multiMedia = new mongoose.Types.ObjectId(req.body.multiMedia);

    const like = await Dislike.create({
        dislikedBy,
        multiMedia
    })

    res.send(200).json(
        new ApiResponse(200, {}, "Disliked")
    )
})



export {sendDislike}