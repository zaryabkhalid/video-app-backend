import mongoose from "mongoose";
import { httpStatusCode } from "../utils/httpStatus.js";
import { expressAsyncHandler } from "../utils/expressAsyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { generateAccessAndRefreshTokens } from "../utils/generateTokens.js";
import jwt from "jsonwebtoken";
import { APP_REFRESH_TOKEN_SECRET } from "../config/index.js";

/**
 *
 * @method: ----> Register User ---->
 *
 * */
const registerUser = expressAsyncHandler(async (req, res) => {
  const { username, email, fullName, password } = req.body;
  if ([username, email, fullName, password].some((field) => field?.trim() === "")) {
    throw new ApiError(httpStatusCode.BAD_REQUEST, "All fields are required");
  }

  // User exists
  const existedUser = await User.findOne({ $or: [{ email }, { username }] });
  if (existedUser) {
    throw new ApiError(httpStatusCode.BAD_REQUEST, "User with email or username already exists");
  }

  // Getting files path from our local public folder
  let avatarLocalPath;
  let coverImageLocalPath;

  // checking for avatar image
  if (req.files && Array.isArray(req.files.avatar) && req.files.avatar.length > 0) {
    avatarLocalPath = req.files.avatar[0].path;
  }

  // checking for coverImage
  if (req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0) {
    coverImageLocalPath = req.files.coverImage[0].path;
  }

  if (!avatarLocalPath) {
    throw new ApiError(httpStatusCode.BAD_REQUEST, "Avatar is required");
  }

  const avatar = await uploadOnCloudinary(avatarLocalPath);
  const coverImage = await uploadOnCloudinary(coverImageLocalPath);

  if (!avatar) {
    throw new ApiError(httpStatusCode.BAD_REQUEST, "Avatar is required");
  }

  const user = await User.create({
    username: username.toLowerCase(),
    avatar: avatar.url,
    coverImage: coverImage?.url || "",
    fullName,
    email,
    password,
  });

  const createdUser = await User.findById(user._id).select("-password -refreshTokens");

  if (!createdUser) {
    throw new ApiError(500, "Something went wrong while registering a User");
  }

  return res
    .status(httpStatusCode.CREATED)
    .json(new ApiResponse(httpStatusCode.OK, createdUser, "User Registered Successfully"));
});

/**
 *
 * @method: ----> Login User ---->
 *
 * */
const loginUser = expressAsyncHandler(async (req, res) => {
  const { username, email, password } = req.body;

  if (!(email || username)) {
    throw new ApiError(httpStatusCode.BAD_REQUEST, "Username or Email is required");
  }

  if (!password) {
    throw new ApiError(httpStatusCode.BAD_REQUEST, "Password is required");
  }

  const user = await User.findOne({ $or: [{ email }, { username }] });

  if (!user) {
    throw new ApiError(httpStatusCode.NOT_FOUND, "User does not exist");
  }

  const isPasswordValid = await user.isPasswordCorrect(password);

  if (!isPasswordValid) {
    throw new ApiError(httpStatusCode.BAD_REQUEST, "Invalid user cradentials");
  }

  const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(user._id);

  const loggedInUser = await User.findById(user._id).select("-password -refreshTokens");

  // cookies Options
  const options = {
    httpOnly: true,
    secure: true,
  };

  return res
    .status(httpStatusCode.OK)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(
        httpStatusCode.OK,
        {
          user: loggedInUser,
          accessToken,
          refreshToken,
        },
        "user loggedIn Successfully"
      )
    );
});

/**
 *
 * @method: ----> Logout User ---->
 *
 * */

const logoutUser = expressAsyncHandler(async (req, res) => {
  const user_id = req.user._id;

  await User.findByIdAndUpdate(
    user_id,
    {
      $unset: { refreshTokens: 1 },
    },
    {
      new: true,
    }
  );

  // cookies Options
  const options = {
    httpOnly: true,
    secure: true,
  };

  return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(httpStatusCode.OK, {}, "User logged Out"));
});

/**
 *
 * @method: --> RefreshAccessToken
 *
 * */

const refreshAccessToken = expressAsyncHandler(async (req, res) => {
  // Get refresh token from cookies

  const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken;

  if (!incomingRefreshToken) {
    throw new ApiError(httpStatusCode.UNAUTHORIZED, "Unauthorized Request");
  }

  // verify RefreshToken
  try {
    const decodedRefreshToken = await jwt.verify(incomingRefreshToken, APP_REFRESH_TOKEN_SECRET);
    if (!decodedRefreshToken) {
      throw new ApiError(httpStatusCode.UNAUTHORIZED, "Unauthorized Access.");
    }

    const matchedUser = await User.findById(decodedRefreshToken._id);

    if (!matchedUser) {
      throw new ApiError(httpStatusCode.BAD_REQUEST, "Invalid User");
    }

    if (incomingRefreshToken !== matchedUser?.refreshTokens) {
      throw new ApiError(httpStatusCode.UNAUTHORIZED, "Unauthorized User");
    }

    // Generate new tokens

    const options = {
      httpOnly: true,
      secure: true,
    };

    const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(matchedUser._id);

    return res
      .status(httpStatusCode.OK)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", refreshToken, options)
      .json(
        new ApiResponse(httpStatusCode.OK, { accessToken, refreshToken: refreshToken }, "Tokens Refreshed Successfully")
      );
  } catch (error) {
    throw new ApiError(httpStatusCode.BAD_REQUEST, error?.message || "Invalid Refresh Token");
  }
});

/**
 *
 * @method: --> Change User Current Password
 *
 * */

const changeCurrentUserPassword = expressAsyncHandler(async (req, res) => {
  const { oldPassword, newPassword } = req.body;
  const user = await User.findById(req.user?._id);

  const isUserPasswordCorrect = await user.isPasswordCorrect(oldPassword);

  if (!isUserPasswordCorrect) {
    throw new ApiError(httpStatusCode.BAD_REQUEST, "Invalid Old Password");
  }

  user.password = newPassword;

  await user.save({ validateBeforeSave: false });

  return res.status(httpStatusCode.OK).json(new ApiResponse(httpStatusCode.OK, {}, "Password Changed Successfully"));
});

/**
 *
 * @method: --> Get Current User
 *
 * */

const getCurrentUser = expressAsyncHandler(async (req, res) => {
  return res
    .status(httpStatusCode.OK)
    .json(new ApiResponse(httpStatusCode.OK, req.user, "Current User Fetched Successfully"));
});

/**
 *
 * @method: --> Update Current User Details
 *
 * */

const updateUserDetails = expressAsyncHandler(async (req, res) => {
  const { fullName, email } = req.body;

  if (!fullName || !email) {
    throw new ApiError(httpStatusCode.BAD_REQUEST, "FullName and Email are required");
  }

  const user = await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set: {
        fullName,
        email,
      },
    },
    { new: true }
  ).select("-password -refreshTokens");

  return res
    .status(httpStatusCode.OK)
    .json(new ApiResponse(httpStatusCode.OK, user, "User Details Updated Successfully"));
});

/**
 *
 * @method: --> Update Current User Avatar
 *
 * */

const updateUserAvatar = expressAsyncHandler(async (req, res) => {
  const avatarLocalPath = req.file?.path;

  if (!avatarLocalPath) {
    throw new ApiError(httpStatusCode.BAD_REQUEST, "Avatar is required");
  }

  const avatar = await uploadOnCloudinary(avatarLocalPath);
  if (!avatar.url) {
    throw new ApiError(httpStatusCode.BAD_REQUEST, "Error While uploading Avatar");
  }

  const user = await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set: {
        avatar: avatar.url,
      },
    },
    { new: true }
  ).select("-password -refreshTokens");

  return res
    .status(httpStatusCode.OK)
    .json(new ApiResponse(httpStatusCode.OK, user, "User Avatar Updated Successfully"));
});

/**
 *
 * @method: --> Update Current User Cover Image
 *
 * */

const updateUserCoverImage = expressAsyncHandler(async (req, res) => {
  const coverImageLocalPath = req.file?.path;
  if (!coverImageLocalPath) {
    throw new ApiError(httpStatusCode.BAD_REQUEST, "Cover Image is required");
  }

  const coverImage = await uploadOnCloudinary(coverImageLocalPath);

  if (!coverImage.url) {
    throw new ApiError(httpStatusCode.BAD_REQUEST, "Error While uploading Cover Image");
  }

  const user = await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set: {
        coverImage: coverImage.url,
      },
    },
    {
      new: true,
    }
  ).select("-password -refreshTokens");
  return res
    .status(httpStatusCode.OK)
    .json(new ApiResponse(httpStatusCode.OK, user, "User Cover Image Updated Successfully"));
});

/**
 *
 * @method: --> Get User Channel Profile
 * @description: This controller uses the mongodb aggregration pipelines to get the user profile along with the subscriber and subscribed to count.
 * */

const getUserChannelProfile = expressAsyncHandler(async (req, res) => {
  const { username } = req.params;
  if (!username?.trim()) {
    throw new ApiError(httpStatusCode.BAD_REQUEST, "Username is missing");
  }

  const channel = await User.aggregate([
    {
      $match: {
        username: username?.toLowerCase(),
      },
    },
    {
      $lookup: {
        from: "subscriptions",
        localField: "_id",
        foreignField: "channel",
        as: "subscribers",
      },
    },
    {
      $lookup: {
        from: "subscriptions",
        localField: "_id",
        foreignField: "subscriber",
        as: "subscribedTo",
      },
    },
    {
      $addFields: {
        subscribersCount: {
          $size: "$subscribers",
        },
        channelsSubscribedToCount: {
          $size: "$subscribedTo",
        },
        isSubscribed: {
          $cond: {
            if: { $in: [req.user?._id, "$subscribers.subscriber"] },
            then: true,
            else: false,
          },
        },
      },
    },
    {
      $project: {
        fullName: 1,
        username: 1,
        email: 1,
        avatar: 1,
        coverImage: 1,
        subscribersCount: 1,
        channelsSubscribedToCount: 1,
        isSubscribed: 1,
      },
    },
  ]);

  if (!channel?.length) {
    throw new ApiError(httpStatusCode.NOT_FOUND, "Channel Not Found");
  }

  return res
    .status(httpStatusCode.OK)
    .json(new ApiResponse(httpStatusCode.OK, channel[0], "Channel Profile Fetched Successfully"));
});

const getWatchHistory = expressAsyncHandler(async (req, res) => {
  const user = await User.aggregate([
    {
      $match: {
        _id: new mongoose.Types.ObjectId(req.user._id),
      },
    },

    {
      $lookup: {
        from: "vedios",
        localField: "_id",
        foreignField: "owner",
        as: "watchHistory",
        pipeline: [
          {
            $lookup: {
              from: "users",
              localField: "owner",
              foreignField: "_id",
              as: "owner",
              pipeline: [
                {
                  $project: {
                    fullname: 1,
                    username: 1,
                    avatar: 1,
                  },
                },
              ],
            },
          },
          {
            $addFields: {
              owner: {
                $first: "$owner",
              },
            },
          },
        ],
      },
    },
  ]);

  return res
    .status(httpStatusCode.OK)
    .json(new ApiResponse(httpStatusCode.OK, user[0].watchHistory, "Watch History Fetched Successfully"));
});

export {
  registerUser,
  loginUser,
  logoutUser,
  refreshAccessToken,
  changeCurrentUserPassword,
  getCurrentUser,
  updateUserDetails,
  updateUserAvatar,
  updateUserCoverImage,
  getUserChannelProfile,
  getWatchHistory,
};
