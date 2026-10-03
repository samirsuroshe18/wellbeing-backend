import { User } from '../models/user.model.js';
import ApiResponse from '../utils/ApiResponse.js';
import ApiError from '../utils/ApiError.js';
import asyncHandler from '../utils/AsyncHandler.js';
import dotenv from "dotenv";
dotenv.config();

const verifyEmail = asyncHandler(async (req, res) => {
  const token = req.query.token;

  if (!token || typeof token !== "string") {
    return res.render("invalid")
  }

  const user = await User.findOne({ verifyToken: token, verifyTokenExpiry: { $gt: Date.now() } });

  if (!user) {
    return res.render("invalid")
  }

  user.isVerified = true;
  user.verifyToken = undefined;
  user.verifyTokenExpiry = undefined;
  user.expireDocAfterSeconds = undefined;
  await user.save()

  return res.render("success");
});

const resetPassword = asyncHandler(async (req, res) => {
  const token = req.query.token;

  if (!token || typeof token !== "string") {
    return res.render("invalidForgotLink")
  }

  const user = await User.findOne({ forgotPasswordToken: token, forgotPasswordTokenExpiry: { $gt: Date.now() } });

  if (!user) {
    return res.render("invalidForgotLink")
  }

  return res.render("forgotPasswordSuccess", {
    apiBaseUrl: process.env.DOMAIN_NAME
  });
})

const verifyPassword = asyncHandler(async (req, res) => {
  const token = req.query.token;
  const { password, confirmPassword } = req.body;

  if (!token || typeof token !== "string") {
    throw new ApiError(400, "Invalid or expired token");
  }

  if (typeof password !== "string" || !password.trim()) {
    throw new ApiError(400, "Password is required");
  }

  if (password !== confirmPassword) {
    throw new ApiError(400, "Password do not match");
  }

  const user = await User.findOne({ forgotPasswordToken: token, forgotPasswordTokenExpiry: { $gt: Date.now() } });

  if (!user) {
    throw new ApiError(400, "Invalid or expired token");
  }

  user.forgotPasswordToken = undefined;
  user.forgotPasswordTokenExpiry = undefined;
  user.password = password
  await user.save()

  return res.status(200).json(
    new ApiResponse(200, {}, "Password reset successful")
  )
});

export { verifyEmail, resetPassword, verifyPassword }
