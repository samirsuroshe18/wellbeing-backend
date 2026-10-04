import mongoose from "mongoose";
import { User } from "../models/user.model.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/AsyncHandler.js";
import { deleteCloudinary, uploadOnCloudinary } from "../utils/cloudinary.js";
import mailSender from "../utils/mailSender.js";


const generateAccessAndRefreshToken = async (userId) => {
    try {
        const user = await User.findById(userId);
        const accessToken = user.generateAccessToken();
        const refreshToken = user.generateRefreshToken();

        user.refreshToken = refreshToken;

        // when we use save() method is used then all the fields are neccesary so to avoid that we have to pass an object with property {validatBeforeSave:false}
        await user.save({ validateBeforeSave: false });

        return { accessToken, refreshToken }
    } catch (error) {
        throw new ApiError(500, "Something went wrong while generating refresh and access token");
    }
}

const registerUser = asyncHandler(async (req, res) => {
    const { userName, email, password } = req.body;

    if ([userName, email, password].some((field) => typeof field !== "string" || !field.trim())) {
        throw new ApiError(400, "All fields are required");
    }

    const existedUser = await User.findOne({
        $or: [{ userName }, { email }]
    });

    if (existedUser) {
        throw new ApiError(409, 'User with same email or username already exists');
    }

    const userProfileLocalPath = req.file?.path;

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
        profilePicture: profilePicture.secure_url || '',
        expireDocAfterSeconds: new Date()
    });

    const createdUser = await User.findById(user._id);

    if (!createdUser) {
        throw new ApiError(500, "Something went wrong");
    }

    const mailResponse = await mailSender(email, createdUser._id, "VERIFY");

    if (mailResponse) {
        return res.status(200).json(
            new ApiResponse(200, {}, "An email sent to your account please verify in 10 minutes")
        );
    }

    // without the verification mail the account can never be activated, so remove it and let the user register again
    await User.findByIdAndDelete(createdUser._id);
    await deleteCloudinary(profilePicture.secure_url);

    throw new ApiError(500, "Something went wrong!! An email couldn't sent to your account");
});

const loginUser = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    if ([email, password].some((field) => typeof field !== "string" || !field.trim())) {
        throw new ApiError(400, "All fields are required");
    }

    const user = await User.findOne({ email });

    if (!user) {
        throw new ApiError(404, "User not found");
    }

    // you cant access isPasswordCorrect method directly through 'User' beacause User is mogoose object 
    // these methods is applied only the instance of the user when mongoose return its instance
    // you can acces User.findOne() but you cant access User.isPasswordCorrect()
    const isPasswordValid = user.password ? await user.isPasswordCorrect(password) : false;

    if (!isPasswordValid) {
        throw new ApiError(401, "Invalid user credential");
    }

    if (!user?.isVerified) {
        throw new ApiError(403, "Your email is not verified. Please use the verification link sent to your email");
    }

    const { accessToken, refreshToken } = await generateAccessAndRefreshToken(user._id);

    const loggedInUser = await User.findById(user._id).select("-password -refreshToken -__v");

    //option object is created beacause we dont want to modified the cookie to front side
    const option = {
        httpOnly: true,
        secure: true
    }

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
                        then: { $first: "$wellpoints" },
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
                        then: { $first: "$wellpoints" },
                        else: { _id: null, wellpoints: 0 }
                    }
                }
            },
        },
        {
            $addFields: {
                userWellpoints: "$wellpoints.wellpoints" // Extract the array of user ObjectIds from wellpoints
            }
        },
        {
            $sort: { userWellpoints: -1 }, // Sort documents based on wellpoints in descending order
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
        new ApiResponse(200, user, "User info fetched successfully")
    )
})

const forgotPassword = asyncHandler(async (req, res) => {
    const { email } = req.body;

    if (typeof email !== "string" || !email.trim()) {
        throw new ApiError(400, "Email is required");
    }

    const user = await User.findOne({ email });

    if (!user || !user?.isVerified) {
        throw new ApiError(404, "Invalid email or email is not verified");
    }

    const mailResponse = await mailSender(email, user._id, "RESET");

    if (mailResponse) {
        return res.status(200).json(
            new ApiResponse(200, {}, "An email sent to your account please reset your password in 10 minutes")
        );
    }

    throw new ApiError(500, "Something went wrong!! An email couldn't sent to your account");
});

const updateAccountDetails = asyncHandler(async (req, res) => {
    const file = req.file;
    // a name of only spaces is no name: the current one is kept
    const userName = typeof req.body.userName === "string" && req.body.userName.trim()
        ? req.body.userName.trim()
        : req.user.userName;

    // user names are unique at sign up, so they stay unique here
    const nameTaken = await User.findOne({ userName, _id: { $ne: req.user._id } });

    if (nameTaken) {
        throw new ApiError(409, "User with same username already exists");
    }

    if (file) {
        const profileImg = await uploadOnCloudinary(file.path);

        if (!profileImg?.secure_url) {
            throw new ApiError(400, "Error while uploading on profile");
        }

        await deleteCloudinary(req.user.profilePicture);

        const user = await User.findByIdAndUpdate(req.user?._id, {
            $set: {
                userName,
                profilePicture: profileImg?.secure_url || ''
            }
        }, { new: true }).select("-password -refreshToken");

        return res.status(200).json(
            new ApiResponse(200, user, "Account details updated successfully")
        );
    }

    const user = await User.findByIdAndUpdate(req.user?._id, {
        $set: {
            userName,
        }
    }, { new: true }).select("-password -refreshToken");

    return res.status(200).json(
        new ApiResponse(200, user, "Account details updated successfully")
    );
});

export { registerUser, loginUser, logoutUser, getLeaderboardList, getUserDetails, forgotPassword, updateAccountDetails }