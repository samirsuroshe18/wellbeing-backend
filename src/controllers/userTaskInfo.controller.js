import asyncHandler from "../utils/AsyncHandler.js";
import { UserTaskInfo } from "../models/userTaskInfo.model.js";
import ApiResponse from "../utils/ApiResponse.js";
import mongoose from "mongoose";


const acceptTask = asyncHandler(async (req, res)=>{
    const taskInfo = new mongoose.Types.ObjectId(req.body.taskInfo);
    const assignTo = new mongoose.Types.ObjectId(req.user._id);
    const status = "pending";

    const userTaskInfo = UserTaskInfo.create({
        taskInfo,
        assignTo,
        status
    })

    res.status(200).json(
        new ApiResponse(200, {}, "Task accepted")
    )
})


export {acceptTask}