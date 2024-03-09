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