import asyncHandler from "../utils/AsyncHandler.js";
import { Like } from "../models/likes.model.js";
import ApiResponse from "../utils/ApiResponse.js";
import mongoose from "mongoose";
import ApiError from "../utils/ApiError.js";


const sendLike = asyncHandler(async (req, res) =>{
    const {multiMedia} = req.body;

    if(!multiMedia){
        throw new ApiError(500, "MultiMedia id is not found")
    }

    const likedBy = new mongoose.Types.ObjectId(req.user._id);
    const multiMediaId = new mongoose.Types.ObjectId(multiMedia);

    // Toggle like
    const existingLike = await Like.findOne({ likedBy, multiMedia : multiMediaId });

    if (existingLike) {
        // If the like exists, remove it (unlike)
        const totalLikes = await Like.countDocuments({ multiMedia });

    if(!totalLikes){
        throw new ApiError(500, "Something went wrong!!");
    }

    if(!(totalLikes<10)){
        return res.status(200).json(
            new ApiResponse(200, {totalLikes}, "Limit reached")
        )
    }

    return res.status(200).json(
        new ApiResponse(200, {totalLikes}, "liked")
    )
    } else {
        // If the like doesn't exist, add it (like)
        const like = await Like.create({
            likedBy,
            multiMedia : multiMediaId
        })

        if(!like){
            throw new ApiError(500, "Something went wrong!!");
        }

        const totalLikes = await Like.countDocuments({ multiMedia });

    if(!totalLikes){
        throw new ApiError(500, "Something went wrong!!");
    }

    if(!(totalLikes<10)){
        return res.status(200).json(
            new ApiResponse(200, {totalLikes}, "Limit reached")
        )
    }

    return res.status(200).json(
        new ApiResponse(200, {totalLikes}, "liked")
    )
    }

    
})



export {sendLike}