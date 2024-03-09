import asyncHandler from "../utils/AsyncHandler.js";
import { TaskCollection } from "../models/taskCollection.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import ApiResponse from "../utils/ApiResponse.js";
import mongoose from "mongoose";
import ApiError from "../utils/ApiError.js";

const createTask = asyncHandler(async (req, res) => {
    const {title, description, timeToComplete} = req.body;

    if(!title?.trim() || !description?.trim() || !timeToComplete?.trim()){
        throw new ApiError(400, "All fields are required !!");
    }

    const createdBy = new mongoose.Types.ObjectId(req.user._id);
    const taskReferenceLocalPath = req.file.path;

    if(!taskReferenceLocalPath){
        throw new ApiError(400, "File path is not found !!");
    }

    const taskReference = await uploadOnCloudinary(taskReferenceLocalPath);

    if(!taskReference){
        throw new ApiError(500, "Something went wrong");
    }

    const taskInfo = await TaskCollection.create({
        title,
        description,
        timeToComplete,
        createdBy,
        taskReference : taskReference?.url
    });

    return res.status(200).json(
        new ApiResponse(200, {}, "Task is created successfully")
    );
});


export{createTask}