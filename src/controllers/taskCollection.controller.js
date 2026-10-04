import asyncHandler from "../utils/AsyncHandler.js";
import { TaskCollection } from "../models/taskCollection.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import ApiResponse from "../utils/ApiResponse.js";
import mongoose from "mongoose";
import ApiError from "../utils/ApiError.js";
import fs from "fs";

const createTask = asyncHandler(async (req, res) => {
    const {title, description, timeToComplete, mediaType} = req.body;

    if([title, description, timeToComplete].some((field) => typeof field !== "string" || !field.trim())){
        throw new ApiError(400, "All fields are required !!");
    }

    const days = Number(timeToComplete);

    if(!Number.isFinite(days) || days < 1){
        throw new ApiError(400, "Time to complete must be at least 1 day");
    }

    const existedTask = await TaskCollection.findOne({ title : title.trim() });

    if(existedTask){
        throw new ApiError(409, "Task with same title already exists");
    }

    const createdBy = new mongoose.Types.ObjectId(req.user._id);
    const taskReferenceLocalPath = req.file?.path;
    
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
        mediaType,
        timeToComplete : days,
        createdBy,
        taskReference : taskReference?.secure_url
    });

    return res.status(200).json(
        new ApiResponse(200, {}, "Task is created successfully")
    );
    
});


export{createTask}