import asyncHandler from "../utils/AsyncHandler.js";
import { TaskCollection } from "../models/taskCollection.model.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import ApiResponse from "../utils/ApiResponse.js";
import mongoose from "mongoose";

const createTask = asyncHandler(async (req, res) => {
    const {title, discription, timeToComplete} = req.body;
    const userid = req.user._id;
    const taskReferenceLocalPath = req.file.path;
    const taskReference = await uploadOnCloudinary(taskReferenceLocalPath);

    const createdBy = new mongoose.Types.ObjectId(userid);  //.select("-password -refreshToken -createdAt -updatedAt -__v -task_completed");

    const taskInfo = await TaskCollection.create({
        title,
        discription,
        timeToComplete,
        createdBy,
        taskReference : taskReference.url
    });

    return res.status(200).json(
        new ApiResponse(200, taskInfo, "Task is created successfully")
    );
});


export{createTask}