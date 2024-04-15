import asyncHandler from "../utils/AsyncHandler.js";
import ApiResponse from "../utils/ApiResponse.js";
import mongoose from "mongoose";
import { Dislike } from "../models/dislikes.model.js";


const sendDislike = asyncHandler(async (req, res) =>{
    const {multiMedia} = req.body;

    if(!multiMedia){
        throw new ApiError(500, "MultiMedia id is not found")
    }
    const dislikedBy = new mongoose.Types.ObjectId(req.user._id);
    const multiMediaId = new mongoose.Types.ObjectId(multiMedia);

    // Toggle dis-like
    const existingDislike = await Dislike.findOne({ dislikedBy, multiMedia : multiMediaId });

    if (existingDislike) {
        // If the like exists, remove it (unlike)
        const totalDislike = await Dislike.countDocuments({ multiMedia });

    if(!totalDislike){
        throw new ApiError(500, "Something went wrong!!");
    }

    if(!(totalDislike<10)){
        return res.status(200).json(
            new ApiResponse(200, {totalDislike}, "Limit reached")
        )
    }

    return res.status(200).json(
        new ApiResponse(200, {totalDislike}, "Disliked")
    )
    } else {
        // If the like doesn't exist, add it (like)
        const dislike = await Dislike.create({
            dislikedBy,
            multiMedia : multiMediaId
        })

        if(!dislike){
            throw new ApiError(500, "Something went wrong!!");
        }

        const totalDislike = await Dislike.countDocuments({ multiMedia });

    if(!totalDislike){
        throw new ApiError(500, "Something went wrong!!");
    }

    if(!(totalDislike<10)){
        return res.status(200).json(
            new ApiResponse(200, {totalDislike}, "Limit reached")
        )
    }

    return res.status(200).json(
        new ApiResponse(200, {totalDislike}, "Disliked")
    )
    }

    const dislike = await Dislike.create({
        dislikedBy,
        multiMedia : multiMediaId
    });

    if(!dislike){
        throw new ApiError(500, "Something went wrong!!");
    }

    const totalDislikes = await Dislike.countDocuments({ multiMedia });

    if(!totalDislikes){
        throw new ApiError(500, "Something went wrong!!");
    }

    if(totalDislikes>=10){
        return res.status(200).json(
            new ApiResponse(200, {totalDislikes}, "Limit reached")
        )
    }

    res.status(200).json(
        new ApiResponse(200, {totalDislikes}, "Disliked")
    )
})



export {sendDislike}