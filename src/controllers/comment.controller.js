import asyncHandler from "../utils/AsyncHandler.js";
import { Comment } from "../models/comment.model.js";
import ApiResponse from "../utils/ApiResponse.js";
import mongoose from "mongoose";

const postComment = asyncHandler(async (req, res) =>{
    const {content} = req.body;
    const multiMediaId = req.body.multiMedia;
    const commentedBy = new mongoose.Types.ObjectId(req.user._id);
    const multiMedia = new mongoose.Types.ObjectId(multiMediaId);

    const comment = Comment.create({
        content,
        commentedBy,
        multiMedia
    })

    return res.status(200).json(
        new ApiResponse(200, comment, "comment is posted successfully")
    )
})


export {postComment}