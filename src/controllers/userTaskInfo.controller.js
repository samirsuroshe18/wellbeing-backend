import asyncHandler from "../utils/AsyncHandler.js";
import { UserTaskInfo } from "../models/userTaskInfo.model.js";
import { TaskCollection } from "../models/taskCollection.model.js";
import ApiResponse from "../utils/ApiResponse.js";
import mongoose from "mongoose";
import { Upload } from "../models/upload.model.js";


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

  const currentTask = await UserTaskInfo.findById(userTaskInfo._id);
  const timeDifference = new Date().getTime() - Date.parse(userTaskInfo.createdAt);

  const task = await TaskCollection.findById(currentTask.taskInfo);
  const timeToComplete = task.timeToComplete;

  const millis = (timeToComplete * 24 * 60 * 60 * 1000) - timeDifference;

  let seconds = Math.floor(millis / 1000);

  // Calculate hours, minutes, and remaining seconds
  let days = Math.floor(seconds / (3600 * 24));
  seconds %= 3600 * 24;
  let hours = Math.floor(seconds / 3600);
  seconds %= 3600;
  let minutes = Math.floor(seconds / 60);
  seconds %= 60;
  const remainingTime = days.toString() + " Days : " + hours.toString() + " Hours : " + minutes.toString() + " Minutes : " + seconds.toString() + " Seconds.";
  const _id = currentTask._id

  res.status(200).json(
    new ApiResponse(200, { _id, remainingTime }, "Task accepted")
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
        mediaType: 1,
        taskReference: 1,
        createdBy: 1,
        timeToComplete: 1
      }
    }
  ])
  console.log(randomTask)
  res.status(200).json(
    new ApiResponse(200, randomTask, "Random task fetched successfully")
  )
})

const getTaskCurrentState = asyncHandler(async (req, res) => {
  const currentTask = await UserTaskInfo.findById(req.body._id);
  const post = await Upload.findOne({"task" : currentTask.taskInfo});
  
  const timeDifference = new Date().getTime() - new Date(currentTask.createdAt).getTime();

  const task = await TaskCollection.findById(currentTask.taskInfo);
  const timeToComplete = task.timeToComplete;
  const dayTimeLimit = new Date(new Date().getTime() - timeToComplete * 24 * 60 * 60 * 1000);

  const millis = timeToComplete * 24 * 60 * 60 * 1000 - timeDifference;

  let seconds = Math.floor(millis / 1000);

  // Calculate hours, minutes, and remaining seconds
  let days = Math.floor(seconds / (3600 * 24));
  seconds %= 3600 * 24;
  let hours = Math.floor(seconds / 3600);
  seconds %= 3600;
  let minutes = Math.floor(seconds / 60);
  seconds %= 60;
  const remainingTime = `${days} Days : ${hours} Hours : ${minutes} Minutes : ${seconds} Seconds.`;

  const status = await UserTaskInfo.aggregate([
    {
      $match: {
        _id: new mongoose.Types.ObjectId(req.body._id) // assuming ObjectId is defined
      }
    },
    // {
    //   $addFields: {
    //     status: {
    //       $cond: {
    //         if: { $lt: [dayTimeLimit, "$createdAt"] },
    //         then: "pending",
    //         else: "incompleted"
    //       }
    //     }
    //   }
    // }
    {
      $addFields: {
        status: {
          $switch: {
            branches: [
              {
                case: {
                  $ne: [post, null]
                },
                then: "completed"
              },
              {
                case: {
                  $lt: [dayTimeLimit, "$createdAt"]
                },
                then: "pending"
              },
              {
                case: {
                  $gt: [dayTimeLimit, "$createdAt"]
                },
                then: "incompleted"
              }
            ]
          }
        }
      }
    },
    {
      $addFields: {
        remainingTime: remainingTime
      }
    },
    {
      $lookup: {
        from: "taskcollections",
        localField: "taskInfo",
        foreignField: "_id",
        as: "taskInfo",
        pipeline: [
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
                    pofilePicture: 1 // Typo: should be "profilePicture"
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
              title: 1,
              description: 1,
              taskReference: 1,
              mediaType: 1,
              createdBy: 1,
              timeToComplete: 1
            }
          }
        ]
      }
    },
    {
      $addFields: {
        taskInfo: {
          $first: "$taskInfo"
        }
      }
    },
    {
      $project: {
        taskInfo: 1,
        status: 1,
        remainingTime: 1
      }
    }
  ]);

  const response = status[0];
  if (response.status === "incompleted") {
    currentTask.status = "incompleted";
    await currentTask.save(); // await for the save operation
  }

  if (response.status === "completed") {
    currentTask.status = "completed";
    await currentTask.save(); // await for the save operation
  }
console.log(response)
  return res.status(200).json(
    new ApiResponse(200, response, "Current task status fetched successfully")
  );
});



export { acceptTask, getTask, getTaskCurrentState }