import asyncHandler from "../utils/AsyncHandler.js";
import { Comment } from "../models/comment.model.js";
import ApiResponse from "../utils/ApiResponse.js";
import mongoose from "mongoose";
import ApiError from "../utils/ApiError.js";

const postComment = asyncHandler(async (req, res) => {
    const { content, multiMedia } = req.body;
    const commentedBy = new mongoose.Types.ObjectId(req.user._id);
    const multiMediaId = new mongoose.Types.ObjectId(multiMedia);

    if(!multiMediaId){
        throw new ApiError(400, "Multimedia id is not found");
    }

    const comment = await Comment.create({
        content,
        commentedBy,
        multiMedia : multiMediaId
    })

    if(!comment){
        throw new ApiError(500, "Something went wrong");
    }

    const response = await Comment.aggregate([
        {
            $match: {
                _id : new mongoose.Types.ObjectId(comment._id)
            }
        },
        {
            $lookup: {
                from: "users",
                localField: "commentedBy",
                foreignField: "_id",
                as: "commentedBy",
                pipeline: [
                    {
                        $project: {
                            _id: 1,
                            userName: 1,
                            pofilePicture: 1
                        }
                    }
                ]
            }
        },
        {
            $addFields: {
                commentedBy: {
                    $first: "$commentedBy"
                }
            }
        },
        {
            $project: {
                _id: 1,
                content: 1,
                commentedBy: 1,
                createdAt : 1
            }
        }
    ])

    return res.status(200).json(
        new ApiResponse(200, response, "comment is posted successfully")
    )
})

const getComments = asyncHandler(async (req, res) => {

    const {multiMedia} = req.body;

    if(!multiMedia){
        throw new ApiError(400, "Multimedia Id is not found !!");
    }

    const comments = await Comment.aggregate([
        {
            $match: {
                multiMedia: new mongoose.Types.ObjectId(multiMedia)
            }
        },
        {
            $lookup: {
                from: "users",
                localField: "commentedBy",
                foreignField: "_id",
                as: "commentedBy",
                pipeline: [
                    {
                        $project: {
                            _id: 1,
                            userName: 1,
                            pofilePicture: 1
                        }
                    }
                ]
            }
        },
        {
            $addFields: {
                commentedBy: {
                    $first: "$commentedBy"
                }
            }
        },
        {
            $project: {
                _id: 1,
                content: 1,
                commentedBy: 1,
                createdAt : 1
            }
        }
    ])

    return res.status(200).json(
        new ApiResponse(200, comments, "comments fetched successfully")
    )
})


export { postComment, getComments }