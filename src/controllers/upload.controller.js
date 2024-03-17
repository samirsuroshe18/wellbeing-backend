import asyncHandler from "../utils/AsyncHandler.js";
import { Upload } from "../models/upload.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import mongoose from "mongoose";
import ApiResponse from "../utils/ApiResponse.js";


const uploadPost = asyncHandler(async (req, res) => {
  const { task, description, mediaType } = req.body;

  if (!task?.trim() || !description?.trim() || !mediaType?.trim()) {
    throw new ApiError(400, "All fields are required !!");
  }

  const taskId = new mongoose.Types.ObjectId(task);
  const uploadedBy = new mongoose.Types.ObjectId(req.user._id);
  const multiMediaLocalPath = req.file.path;

  if(!multiMediaLocalPath){
    throw new ApiError(400, "File path is not found !!");
  } 

  const multiMedia = await uploadOnCloudinary(multiMediaLocalPath);
  
  if(!multiMedia){
    throw new ApiError(400, "There is some error uploading a file on cloudinary");
  }

  const duration = Math.round(multiMedia.duration).toString();

  const post = await Upload.create({
    description,
    task: taskId,
    uploadedBy,
    multiMedia: multiMedia.url,
    mediaType,
    duration
  });

  return res.status(200).json(
    new ApiResponse(200, {}, "Post uploaded successfully")
  );

});


const getUploadedPost = asyncHandler(async (req, res) => {
 
  const daysAgo = 2;
  const dateBeforeDaysAgo = new Date(new Date().getTime() - daysAgo * 24 * 60 * 60 * 1000);

  const posts = await Upload.aggregate([
    {
      $match: {
        createdAt: {
          $gt: dateBeforeDaysAgo
        }
      }
    },
    {
      $lookup: {
        from: "likes",
        localField: "_id",
        foreignField: "multiMedia",
        as: "likes"
      }
    },
    {
      $addFields: {
        likes: { $size: "$likes" }
      }
    },
    {
      $match: {
        likes: { $lt: 10 }
      }
    },
    {
      $lookup: {
        from: "users",
        localField: "uploadedBy",
        foreignField: "_id",
        as: "uploadedBy",
        pipeline: [
          {
            $project: {
              _id: 1,
              userName: 1,
              profilePicture: 1
            }
          }
        ]
      }
    },
    {
      $addFields: {
        uploadedBy: {
          $first: "$uploadedBy"
        }
      }
    },
    {
      $lookup: {
        from: "dislikes",
        localField: "_id",
        foreignField: "multiMedia",
        as: "dislikes"
      }
    },
    {
      $addFields: {
        dislikes: { $size: "$dislikes" }
      }
    },
    {
      $lookup: {
        from: "comments",
        localField: "_id",
        foreignField: "multiMedia",
        as: "comments"
      }
    },
    {
      $addFields: {
        comments: { $size: "$comments" }
      }
    },
    {
      $sort: {
        createdAt: -1
      }
    },
    {
      $project: {
        _id: 1,
        uploadedBy: 1,
        createdAt: 1,
        description: 1,
        multiMedia: 1,
        likes: 1,
        dislikes: 1,
        comments: 1,
        mediaType: 1,
        task: 1,
        duration: 1
      }
    }
  ])

  return res.status(200).json(
    new ApiResponse(200, posts, "post fetch successfullly")
  )

})

const getWellPoints = asyncHandler(async (req, res) => {

  const points = await Upload.aggregate([
    {
      $match: {
        uploadedBy: new mongoose.Types.ObjectId(req.user._id)
      }
    },
    {
      $lookup: {
        from: "likes",
        localField: "_id",
        foreignField: "multiMedia",
        as: "likes"
      }
    },
    {
      $addFields: {
        totalLike: { $size: "$likes" }
      }
    },
    {
      $lookup: {
        from: "dislikes",
        localField: "_id",
        foreignField: "multiMedia",
        as: "dislikes"
      }
    },
    {
      $addFields: {
        dislikeCount: { $size: "$dislikes" }
      }
    },
    {
      $addFields: {
        wellpoints: {
          $round: [
            {
              $multiply: [
                {
                  $divide: [
                    { $subtract: ["$totalLike", { $divide: ["$dislikeCount", 2] }] },
                    10
                  ]
                },
                10
              ]
            },
            0
          ]
        }
      }
    },
    {
      $group: {
        _id: null,
        wellpoints: { $sum: "$wellpoints" }
      }
    }
  ]);

  res.status(200).json(
    new ApiResponse(200, points, "wellpoints calculated successfully")
  )
})


export { uploadPost, getUploadedPost, getWellPoints }