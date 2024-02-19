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
  if (req?.files && Array.isArray(req?.files?.avatar) && req?.files?.avatar.length > 0) {
    avatarLocalPath = req.files.avatar[0].path;
  }

  console.log("Before upload on cloudinary:", avatarLocalPath);

  // checking for coverImage
  if (req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0) {
    coverImageLocalPath = req.files.coverImage[0].path;
  }

  if (!avatarLocalPath) {
    throw new ApiError(httpStatusCode.BAD_REQUEST, "Avatar is required");
  }

  const avatar = await uploadOnCloudinary(avatarLocalPath);

  console.log("After uploaded on Cloudinary:", avatar);

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
const loginUser = expressAsyncHandler(async (req, res, next) => {
  const cookies = req.cookies;

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

  const newRefreshTokenList = !cookies.tokenID
    ? user.refreshTokens
    : user.refreshTokens.filter((rt) => rt !== cookies.tokenID);

  user.refreshTokens = [...newRefreshTokenList, refreshToken];

  await user.save({ validateBeforeSave: false });

  // cookies Options
  const options = {
    httpOnly: true,
    secure: true,
    sameSite: "none",
    maxAge: 1 * 24 * 60 * 60 * 1000,
  };

  return res
    .status(httpStatusCode.OK)
    .cookie("tokenID", refreshToken, options)
    .json(
      new ApiResponse(
        httpStatusCode.OK,
        {
          accessToken,
        },
        "User LogIn Successfull"
      )
    );
});

/**
 *
 * @method: ----> Logout User ---->
 *
 * */

const logoutUser = expressAsyncHandler(async (req, res, next) => {
  const cookies = req.cookies;

  if (!cookies.tokenID || cookies.tokenID === null) {
    return next(new ApiError(httpStatusCode.NO_CONTENT, "No-Content"));
  }

  const refreshTokenID = cookies.tokenID;

  const user = await User.findOne({ refreshTokens: refreshTokenID });

  if (!user) {
    return res
      .status(httpStatusCode.NO_CONTENT)
      .clearCookie("tokenID", { secure: true, httpOnly: true, sameSite: "none" })
      .json(new ApiResponse(httpStatusCode.NO_CONTENT, {}, "No-Content"));
  }

  user.refreshTokens = user.refreshTokens.filter((rt) => rt !== refreshTokenID);
  await user.save({ validateBeforeSave: false });

  return res
    .status(httpStatusCode.OK)
    .clearCookie("tokenID", { httpOnly: true, secure: true, sameSite: "none" })
    .json(new ApiResponse(httpStatusCode.NO_CONTENT, {}, "Logout Successfull..."));
});

/**
 *
 * @method: --> RefreshAccessToken
 *
 * */

const refreshAccessToken = expressAsyncHandler(async (req, res, next) => {
  // Get refresh token from cookies

  const incomingRefreshToken = req.cookies.tokenID || req.body.tokenID;

  if (!incomingRefreshToken || incomingRefreshToken === undefined) {
    return next(new ApiError(httpStatusCode.UNAUTHORIZED, "Unauthorized Request"));
  }

  if (incomingRefreshToken) {
    res.clearCookie("tokenID", { httpOnly: true, sameSite: "none", secure: true });
  }

  // verify RefreshToken
  try {
    const matchedUser = await User.findOne({ refreshTokens: incomingRefreshToken });

    if (!matchedUser) {
      jwt.verify(incomingRefreshToken, APP_REFRESH_TOKEN_SECRET, async (err, decode) => {
        if (err) {
          return next(new ApiError(httpStatusCode.UNAUTHORIZED, "Unauthorized Access."));
        }

        const hackedUser = await User.findOne({ _id: decode._id });
        hackedUser.refreshTokens = [];
        await hackedUser.save({ validateBeforeSave: false });
      });
      return next(new ApiError(httpStatusCode.FORBIDDEN, "Forbidden"));
    }

    const filteredRefreshTokenList = matchedUser.refreshTokens.filter((rt) => rt !== incomingRefreshToken);

    jwt.verify(incomingRefreshToken, APP_REFRESH_TOKEN_SECRET, async (err, decode) => {
      if (err) {
        matchedUser.refreshTokens = [...filteredRefreshTokenList];
        const result = await matchedUser.save({ validateBeforeSave: false });
      }

      if (err || matchedUser._id !== decode._id) {
        return next(new ApiError(httpStatusCode.FORBIDDEN, "Forbidden"));
      }

      const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(matchedUser._id);

      matchedUser.refreshTokens = [...filteredRefreshTokenList, refreshToken];

      const result = await matchedUser.save({ validateBeforeSave: false });

      const options = {
        httpOnly: true,
        secure: true,
        sameSite: "none",
      };

      return res
        .status(httpStatusCode.OK)
        .cookie("tokenID", refreshToken, options)
        .json(new ApiResponse(httpStatusCode.OK, { accessToken }, "Tokens Refreshed Successfully"));
    });

    // Generate new tokens
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
  const { fullName, email, username } = req.body;

  const user = await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set: {
        fullName,
        email,
        username,
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
