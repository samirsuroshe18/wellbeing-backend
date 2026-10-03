import asyncHandler from "../utils/AsyncHandler.js";
import ApiResponse from "../utils/ApiResponse.js";
import ApiError from "../utils/ApiError.js";
import mongoose from "mongoose";
import { Dislike } from "../models/dislikes.model.js";
import { Like } from "../models/likes.model.js";


const sendDislike = asyncHandler(async (req, res) =>{
    const {multiMedia} = req.body;

    if(!multiMedia || !mongoose.isValidObjectId(multiMedia)){
        throw new ApiError(400, "MultiMedia id is not found")
    }
    const dislikedBy = new mongoose.Types.ObjectId(req.user._id);
    const multiMediaId = new mongoose.Types.ObjectId(multiMedia);

    // Toggle dis-like
    const existingDislike = await Dislike.findOne({ dislikedBy, multiMedia : multiMediaId });

    if (existingDislike) {
        // If the dislike exists, remove it
        await Dislike.deleteMany({ dislikedBy, multiMedia : multiMediaId });

        const totalDislike = await Dislike.countDocuments({ multiMedia : multiMediaId });

        return res.status(200).json(
            new ApiResponse(200, {totalDislike}, "Dislike removed")
        )
    }

    // If the dislike doesn't exist, add it
    await Dislike.create({
        dislikedBy,
        multiMedia : multiMediaId
    })

    // A post can't be liked and disliked by the same user
    await Like.deleteMany({ likedBy : dislikedBy, multiMedia : multiMediaId });

    const totalDislike = await Dislike.countDocuments({ multiMedia : multiMediaId });

    if(!(totalDislike<10)){
        return res.status(200).json(
            new ApiResponse(200, {totalDislike}, "Limit reached")
        )
    }

    return res.status(200).json(
        new ApiResponse(200, {totalDislike}, "Disliked")
    )
})



export {sendDislike}
