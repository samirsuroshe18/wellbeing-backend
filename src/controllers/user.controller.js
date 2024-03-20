import mongoose from "mongoose";
import { User } from "../models/user.model.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/AsyncHandler.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";


const generateAccessAndRefreshToken = async (userId) => {
    try {
        const user = await User.findById(userId);
        const accessToken = await user.generateAccessToken();
        const refreshToken = await user.generateRefreshToken();

        user.refreshToken = refreshToken;

        // when we use save() method then all the fields are neccesary so to avoid that we have to pass an object with property {validatBeforeSave:false}
        await user.save({ validateBeforeSave: false });

        return { accessToken, refreshToken }
    } catch (error) {
        throw new ApiError(500, "Something went wrong while generating refresh and access token");
    }
}


const registerUser = asyncHandler(async (req, res) => {
    const { userName, email, password } = req.body;

    if (!userName?.trim() || !email?.trim() || !password?.trim()) {
        throw new ApiError(400, "All fields are required");
    }

    const existedUser = await User.findOne({
        $or: [{ userName }, { email }]
    });

    if (existedUser) {
        throw new ApiError(409, 'User with same email or username already exists');
    }

    const userProfileLocalPath = req.file.path;

    if (!userProfileLocalPath) {
        throw new ApiError(400, "File path is not found !!");
    }

    const profilePicture = await uploadOnCloudinary(userProfileLocalPath);

    if (!profilePicture) {
        throw new ApiError(400, "There is some error uploading a file on cloudinary");
    }

    const user = await User.create({
        email,
        password,
        userName,
        profilePicture: profilePicture?.url
    });

    const { accessToken, refreshToken } = await generateAccessAndRefreshToken(user._id);

    const createdUser = await User.findById(user._id).select("-password -refreshToken");

    if (!createdUser) {
        throw new ApiError(500, "Something went wrong");
    }

    return res.status(200).json(
        new ApiResponse(200, { createdUser, accessToken, refreshToken }, "User registered successfully")
    );
});


const loginUser = asyncHandler(async (req, res) => {
    const { userName, email, password } = req.body;

    if (!userName && !email) {
        throw new ApiError(400, "username or email is required")
    }

    const user = await User.findOne({
        $or: [{ userName }, { email }]
    });

    if (!user) {
        throw new ApiError(404, "User does not exist");
    }

    const isPasswordValid = await user.isPasswordCorrect(password);

    if (!isPasswordValid) {
        throw new ApiError(401, "Invalid user credential");
    }

    const { accessToken, refreshToken } = await generateAccessAndRefreshToken(user._id);

    const loggedInUser = await User.findById(user._id).select("-password -refreshToken");

    return res.status(200).json(
        new ApiResponse(200, { loggedInUser, accessToken, refreshToken }, "User logged in sucessully")
    )

})


const logoutUser = asyncHandler(async (req, res) => {
    await User.findByIdAndUpdate(req.user._id, { $unset: { refreshToken: 1 } }, { new: true });

    return res.status(200).json(
        new ApiResponse(200, {}, "User logged out successfully")
    )
})

const getLeaderboardList = asyncHandler(async (req, res) => {

    const leaderboardList = await User.aggregate([
        {
            $lookup: {
                from: "uploads",
                localField: "_id",
                foreignField: "uploadedBy",
                as: "wellpoints",
                pipeline: [
                    {
                        $lookup: {
                            from: "likes",
                            localField: "_id",
                            foreignField: "multiMedia",
                            as: "likes",
                        },
                    },
                    {
                        $addFields: {
                            totalLike: { $size: "$likes" },
                        },
                    },
                    {
                        $lookup: {
                            from: "dislikes",
                            localField: "_id",
                            foreignField: "multiMedia",
                            as: "dislikes",
                        },
                    },
                    {
                        $addFields: {
                            dislikeCount: { $size: "$dislikes" },
                        },
                    },
                    {
                        $addFields: {
                            wellpoints: {
                                $round: [
                                    {
                                        $multiply: [
                                            {
                                                $divide: [
                                                    {
                                                        $subtract: [
                                                            "$totalLike",
                                                            {
                                                                $divide: [
                                                                    "$dislikeCount",
                                                                    2,
                                                                ],
                                                            },
                                                        ],
                                                    },
                                                    10,
                                                ],
                                            },
                                            10,
                                        ],
                                    },
                                    0,
                                ],
                            },
                        },
                    },
                    {
                        $group: {
                            _id: null,
                            wellpoints: { $sum: "$wellpoints" },
                        },
                    },
                ],
            },
        },
        {
            $addFields: {
                wellpoints: {
                    $cond: {
                        if: { $gt: [{ $size: "$wellpoints" }, 0] },
                        then: {   $first: "$wellpoints"  },
                        else: { _id: null, wellpoints: 0 }
                    }
                }
            },
        },
        {
            $sort: { wellpoints: -1 } // Sort documents based on wellpoints in descending order
        },
        {
            $project: {
                _id: 1,
                userName: 1,
                profilePicture: 1,
                wellpoints: 1
            }
        }
    ])

    res.status(200).json(
        new ApiResponse(200, leaderboardList, "User data fetched")
    )
})

const getUserDetails = asyncHandler(async (req, res) => {

    const userId = new mongoose.Types.ObjectId(req.user._id);

    const user = await User.aggregate([
        {
            $lookup: {
                from: "uploads",
                localField: "_id",
                foreignField: "uploadedBy",
                as: "wellpoints",
                pipeline: [
                    {
                        $lookup: {
                            from: "likes",
                            localField: "_id",
                            foreignField: "multiMedia",
                            as: "likes",
                        },
                    },
                    {
                        $addFields: {
                            totalLike: { $size: "$likes" },
                        },
                    },
                    {
                        $lookup: {
                            from: "dislikes",
                            localField: "_id",
                            foreignField: "multiMedia",
                            as: "dislikes",
                        },
                    },
                    {
                        $addFields: {
                            dislikeCount: { $size: "$dislikes" },
                        },
                    },
                    {
                        $addFields: {
                            wellpoints: {
                                $round: [
                                    {
                                        $multiply: [
                                            {
                                                $divide: [
                                                    {
                                                        $subtract: [
                                                            "$totalLike",
                                                            {
                                                                $divide: [
                                                                    "$dislikeCount",
                                                                    2,
                                                                ],
                                                            },
                                                        ],
                                                    },
                                                    10,
                                                ],
                                            },
                                            10,
                                        ],
                                    },
                                    0,
                                ],
                            },
                        },
                    },
                    {
                        $group: {
                            _id: "$uploadedBy",
                            wellpoints: { $sum: "$wellpoints" },
                        },
                    },
                ],
            },
        },
        {
            $lookup: {
                from: "usertaskinfos",
                localField: "_id",
                foreignField: "assignTo",
                as: "task_completed",
                pipeline: [
                    {
                        $match: {
                            status: "completed",
                        },
                    },
                ],
            },
        },
        {
            $addFields: {
                task_completed: {
                    $cond: {
                        if: {
                            $gt: [
                                { $size: "$task_completed" },
                                0,
                            ],
                        },
                        then: {
                            $size: "$task_completed",
                        },
                        else: 0,
                    },
                },
            },
        },
        {
            $lookup: {
                from: "usertaskinfos",
                localField: "_id",
                foreignField: "assignTo",
                as: "successRate",
            },
        },
        {
            $addFields: {
                totalTask: {
                    $size: "$successRate",
                },
            },
        },
        {
            $addFields: {
                successRate: {
                    $cond: {
                        if: { $eq: ["$totalTask", 0] },
                        then: 0, // or any default value you prefer
                        else: { $multiply: [{ $divide: ["$task_completed", "$totalTask"] }, 100] }
                    }
                },
            },
        },
        {
            $addFields: {
                wellpoints: {
                    $cond: {
                        if: { $gt: [{ $size: "$wellpoints" }, 0] },
                        then: {   $first: "$wellpoints"  },
                        else: { _id: null, wellpoints: 0 }
                    }
                }
            },
        },
        {
            $addFields: {
                userWellpoints: "$wellpoints._id" // Extract the array of user ObjectIds from wellpoints
            }
        },
        {
            $sort: { wellpoints: 1 }, // Sort documents based on wellpoints in descending order
        },
        {
            $group: {
                _id: null,
                documents: { $push: "$$ROOT" }
            }
        },
        {
            $addFields: {
                documents: {
                    $map: {
                        input: { $range: [0, { $size: "$documents" }] },
                        as: "rank",
                        in: {
                            $mergeObjects: [
                                { $arrayElemAt: ["$documents", "$$rank"] },
                                { rank: "$$rank" }
                            ]
                        }
                    }
                }
            }
        },
        { $unwind: "$documents" },
        {
            $replaceRoot: { newRoot: "$documents" }
        },
        {
            $match: {
                _id: userId
            }
        },
        {
            $project: {
                _id: 1,
                userName: 1,
                email: 1,
                profilePicture: 1,
                task_completed: 1,
                successRate: 1,
                wellpoints: 1,
                createdAt: 1,
                documents: 1,
                rank: 1
            }
        }
    ])

    return res.status(200).json(
        new ApiResponse(200, user,"User info fetched successfully")
    )
})


export { registerUser, loginUser, logoutUser, getLeaderboardList, getUserDetails }