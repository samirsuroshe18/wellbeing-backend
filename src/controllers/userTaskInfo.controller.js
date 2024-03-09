import asyncHandler from "../utils/AsyncHandler.js";
import { UserTaskInfo } from "../models/userTaskInfo.model.js";
import { TaskCollection } from "../models/taskCollection.model.js";
import ApiResponse from "../utils/ApiResponse.js";
import mongoose from "mongoose";


const acceptTask = asyncHandler(async (req, res) => {
  const { taskInfo, status } = req.body;

  if (!taskInfo?.trim() || !status?.trim()) {
    throw new ApiError(400, "Task Id or status is not found !!");
  }
  const assignTo = new mongoose.Types.ObjectId(req.user._id);

  const userTaskInfo = await UserTaskInfo.create({
    taskInfo,
    assignTo,
    status
  })

  res.status(200).json(
    new ApiResponse(200, {}, "Task accepted")
  )

})


const getTask = asyncHandler(async (req, res) => {
  const userId = new mongoose.Types.ObjectId(req.user._id);

  const assignedTaskIds = await UserTaskInfo.find({ assignTo: userId })
    .then(tasksAssignedToUser => tasksAssignedToUser.map(task => task.taskInfo))
    .catch(err => {
      console.error(err);
    });

  const randomTask = await TaskCollection.aggregate([
    // Match tasks that are not assigned to the user
    {
      $match: {
        _id: { $nin: assignedTaskIds }
      }
    },
    // Add a random score to each task
    {
      $addFields: {
        randomScore: { $rand: {} }
      }
    },
    // Sort the tasks by the random score to get a random order
    {
      $sort: { randomScore: 1 }
    },
    // Limit the result to one task
    {
      $limit: 1
    },
    {
      $lookup: {
        from: "users",
        localField: "createdBy",
        foreignField: "_id",
        as: "createdBy",
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
        createdBy: {
          $first: "$createdBy"
        }
      }
    },
    {
      $project: {
        _id: 1,
        title: 1,
        description: 1,
        taskReference: 1,
        createdBy: 1,
        timeToComplete: 1
      }
    }
  ])

  res.status(200).json(
    new ApiResponse(200, {}, "Random task fetched successfully")
  )
})

const getTaskCurrentState = asyncHandler(async (req, res)=>{
  
})


export { acceptTask, getTask }