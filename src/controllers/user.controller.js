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


const registerUser = asyncHandler(async (req, res)=>{
    const {userName, email, password} = req.body;

    if (!userName?.trim() || !email?.trim() || !password?.trim()) {
        throw new ApiError(400, "All fields are required");
    }

    const existedUser = await User.findOne({
        $or : [{userName}, {email}]
    });
    
    if (existedUser) {
        throw new ApiError(409, 'User with same email or username already exists');
    }

    const userProfileLocalPath = req.file.path;

    if(!userProfileLocalPath){
        throw new ApiError(400, "File path is not found !!");
    } 

    const profilePicture = await uploadOnCloudinary(userProfileLocalPath);

    if(!profilePicture){
        throw new ApiError(400, "There is some error uploading a file on cloudinary");
      }

    const user = await User.create({
        email,
        password,
        userName,
        profilePicture : profilePicture?.url
    });

    const { accessToken, refreshToken } = await generateAccessAndRefreshToken(user._id);

    const createdUser = await User.findById(user._id).select("-password -refreshToken");

    if (!createdUser) {
        throw new ApiError(500, "Something went wrong");
    }

    return res.status(200).json(
        new ApiResponse(200, {createdUser, accessToken, refreshToken}, "User registered successfully")
    );
});


const loginUser = asyncHandler(async (req, res) =>{
    const {userName, email, password} = req.body;

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
        new ApiResponse(200, {loggedInUser, accessToken, refreshToken}, "User logged in sucessully")
    )

})


const logoutUser = asyncHandler(async (req, res)=>{
    await User.findByIdAndUpdate(req.user._id, { $unset: { refreshToken: 1 } }, { new: true });

    return res.status(200).json(
        new ApiResponse(200, {}, "User logged out successfully")
    )
})


export {registerUser, loginUser, logoutUser}