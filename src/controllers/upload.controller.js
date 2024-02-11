import asyncHandler from "../utils/AsyncHandler.js";
import { Upload } from "../models/upload.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import mongoose from "mongoose";
import ApiResponse from "../utils/ApiResponse.js";


const uploadPost = asyncHandler(async (req, res)=>{
    const {task, discription} = req.body;
    const multiMediaLocalPath = req.file.path;

    const multiMedia = await uploadOnCloudinary(multiMediaLocalPath);

    const userId = req.user._id;
    const uploadedBy = new mongoose.Types.ObjectId(userId);
    const taskId = new mongoose.Types.ObjectId(task);

    const post = await Upload.create({
        discription,
        task : taskId,
        uploadedBy,
        multiMedia : multiMedia.url
    });

    console.log(post)

    return res.status(200).json(
        new ApiResponse(200, post, "Posted successfully")
    );
});


const getUploadedPost = asyncHandler(async (req, res)=> {
    
    const posts = await Upload.aggregate([
        {
          $lookup: {
            from: "taskcollections",
            let: { task: "$task" },
            pipeline: [
              {
                $match: {
                  $expr: { $eq: ["$_id", "$$task"] },
                },
              },
              {
                $lookup: {
                  from: "users",
                  let: { userId: "$createdBy" },
                  pipeline: [
                    {
                      $match: {
                        $expr: {
                          $eq: ["$_id", "$$userId"],
                        },
                      },
                    },
                    {
                      $project: {
                        userName: 1,
                        email : 1
                      },
                    },
                  ],
                  as: "createdBy",
                },
              },
              {
                $addFields: {
                  createdBy: {
                    $first: "$createdBy",
                  },
                },
              },
              {
                $project : {
                  title : 1,
                  discription : 1,
                  createdBy : 1,
                  timeToComplete : 1,
                  taskReference : 1
                }
              }
            ],
            as: "task",
          },
        },
        {
          $addFields: {
            task : {
              $first : "$task"
            }
          }
        },
        {
          $lookup: {
            from: "comments",
            let: { id: "$_id" },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $eq: ["$multiMedia", "$$id"],
                  },
                },
              },
              {
                $lookup : {
                  from : "users",
                  let : {user : "$commentedBy"},
                  pipeline : [
                    {
                      $match : {
                        $expr : {
                          $eq : ["$_id", "$$user"]
                        }
                      }
                    },
                    {
                      $project : {
                        userName : 1,
                        email : 1,
                        profilePicture : 1
                      }
                    }
                  ],
                  as : "commentedBy"
                }
              },
              {
                $addFields : {
                  commentedBy : {
                    $first : "$commentedBy"
                  }
                }
              },
              {
                $project : {
                  content : 1,
                  commentedBy : 1
                }
              }
            ],
            as: "comments",
          },
        },
        {
          $lookup: {
            from: "users",
            let : {uploadedBy : "$uploadedBy"},
            pipeline : [
              {
                $match : {
                  $expr : {
                    $eq : ["$_id", "$$uploadedBy"]
                  }
                }
              },
              {
                $project : {
                  userName : 1,
                  email : 1,
                  profilePicture : 1
                }
              }
            ],
            as: "uploadedBy"
          }
        },
        {
          $addFields: {
            uploadedBy : {
              $first : "$uploadedBy"
            }
          }
        },
        {
          $lookup: {
            from: "likes",
            let : {likes : "$_id"},
            pipeline : [
              {
                $match : {
                  $expr : {
                    $eq : ["$multiMedia", "$$likes"]
                  }
                }
              }
            ],
            as: "likes"
          }
        },
        {
          $addFields: {
            likes : {
              $size : "$likes"
            }
          }
        },
        {
          $lookup: {
            from: "dislikes",
            let : {dislikes : "$_id"},
            pipeline : [
              {
                $match : {
                  $expr : {
                    $eq : ["$multiMedia", "$$dislikes"]
                  }
                }
              }
            ],
            as: "dislikes"
          }
        },
        {
          $addFields: {
            dislikes : {
              $size : "$dislikes"
            }
          }
        },
        {
          $project : {
            multiMedia : 1,
            uploadedBy : 1,
            discription : 1,
            comments : 1,
            task : 1,
            likes : 1,
            dislikes : 1
          }
        }
      ]);

    console.log(posts);
    return res.status(200).json(
      new ApiResponse(200, posts, "post fetch successfullly")
    )
})
  

export {uploadPost, getUploadedPost}