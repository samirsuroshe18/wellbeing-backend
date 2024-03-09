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

  // const posts = await Upload.aggregate([
  //   // Task information
  //     {
  //       $lookup: {
  //         from: "taskcollections",
  //         let: { task: "$task" },
  //         pipeline: [
  //           {
  //             $match: {
  //               $expr: { $eq: ["$_id", "$$task"] },
  //             },
  //           },
  //           {
  //             $lookup: {
  //               from: "users",
  //               let: { userId: "$createdBy" },
  //               pipeline: [
  //                 {
  //                   $match: {
  //                     $expr: {
  //                       $eq: ["$_id", "$$userId"],
  //                     },
  //                   },
  //                 },
  //                 {
  //                   $project: {
  //                     userName: 1,
  //                     email : 1
  //                   },
  //                 },
  //               ],
  //               as: "createdBy",
  //             },
  //           },
  //           {
  //             $addFields: {
  //               createdBy: {
  //                 $first: "$createdBy",
  //               },
  //             },
  //           },
  //           {
  //             $project : {
  //               title : 1,
  //               discription : 1,
  //               createdBy : 1,
  //               timeToComplete : 1,
  //               taskReference : 1
  //             }
  //           }
  //         ],
  //         as: "task",
  //       },
  //     },
  //     {
  //       $addFields: {
  //         task : {
  //           $first : "$task"
  //         }
  //       }
  //     },
  //     // comments 
  //     {
  //       $lookup: {
  //         from: "comments",
  //         let: { id: "$_id" },
  //         pipeline: [
  //           {
  //             $match: {
  //               $expr: {
  //                 $eq: ["$multiMedia", "$$id"],
  //               },
  //             },
  //           },
  //           {
  //             $lookup : {
  //               from : "users",
  //               let : {user : "$commentedBy"},
  //               pipeline : [
  //                 {
  //                   $match : {
  //                     $expr : {
  //                       $eq : ["$_id", "$$user"]
  //                     }
  //                   }
  //                 },
  //                 {
  //                   $project : {
  //                     userName : 1,
  //                     email : 1,
  //                     profilePicture : 1
  //                   }
  //                 }
  //               ],
  //               as : "commentedBy"
  //             }
  //           },
  //           {
  //             $addFields : {
  //               commentedBy : {
  //                 $first : "$commentedBy"
  //               }
  //             }
  //           },
  //           {
  //             $project : {
  //               content : 1,
  //               commentedBy : 1
  //             }
  //           }
  //         ],
  //         as: "comments",
  //       },
  //     },
  //     {
  //       $lookup: {
  //         from: "users",
  //         let : {uploadedBy : "$uploadedBy"},
  //         pipeline : [
  //           {
  //             $match : {
  //               $expr : {
  //                 $eq : ["$_id", "$$uploadedBy"]
  //               }
  //             }
  //           },
  //           {
  //             $project : {
  //               userName : 1,
  //               email : 1,
  //               profilePicture : 1
  //             }
  //           }
  //         ],
  //         as: "uploadedBy"
  //       }
  //     },
  //     {
  //       $addFields: {
  //         uploadedBy : {
  //           $first : "$uploadedBy"
  //         }
  //       }
  //     },
  //     {
  //       $lookup: {
  //         from: "likes",
  //         let : {likes : "$_id"},
  //         pipeline : [
  //           {
  //             $match : {
  //               $expr : {
  //                 $eq : ["$multiMedia", "$$likes"]
  //               }
  //             }
  //           }
  //         ],
  //         as: "likes"
  //       }
  //     },
  //     {
  //       $addFields: {
  //         likes : {
  //           $size : "$likes"
  //         }
  //       }
  //     },
  //     {
  //       $lookup: {
  //         from: "dislikes",
  //         let : {dislikes : "$_id"},
  //         pipeline : [
  //           {
  //             $match : {
  //               $expr : {
  //                 $eq : ["$multiMedia", "$$dislikes"]
  //               }
  //             }
  //           }
  //         ],
  //         as: "dislikes"
  //       }
  //     },
  //     {
  //       $addFields: {
  //         dislikes : {
  //           $size : "$dislikes"
  //         }
  //       }
  //     },
  //     {
  //       $project : {
  //         multiMedia : 1,
  //         uploadedBy : 1,
  //         discription : 1,
  //         comments : 1,
  //         task : 1,
  //         likes : 1,
  //         dislikes : 1
  //       }
  //     }
  //   ]);

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
              pofilePicture: 1
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
        discription: 1,
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

  console.log(posts);
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
  ]
  );

  res.status(200).json(
    new ApiResponse(200, points, "wellpoints calculated successfully")
  )
})


export { uploadPost, getUploadedPost, getWellPoints }