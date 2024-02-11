import asyncHandler from "../utils/AsyncHandler.js";
import { Like } from "../models/likes.model.js";
import ApiResponse from "../utils/ApiResponse.js";
import mongoose from "mongoose";


const sendLike = asyncHandler(async (req, res) =>{
    const likedBy = new mongoose.Types.ObjectId(req.body.likedBy);
    const multiMedia = new mongoose.Types.ObjectId(req.body.multiMedia);

    const like = await Like.create({
        likedBy,
        multiMedia
    })

    res.send(200).json(
        new ApiResponse(200, {}, "liked")
    )
})



export {sendLike}