import mongoose from "mongoose";
import { Video } from "../models/video.model.js";
import { Like } from "../models/like.model.js";
import { Subscription } from "../models/subscription.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { expressAsyncHandler } from "../utils/expressAsyncHandler.js";

/**
 * @method GetChannelStats
 */

const getChannelStats = expressAsyncHandler(async (req, res) => {
  // TODO: Get the channel stats like total video views, total subscriber, total videos, total likes etc.

  const statAggregation = await Video.aggregate([
    {
      $match: {
        owner: new mongoose.Types.ObjectId(req?.user._id),
      },
    },
    {
      $lookup: {
        from: "likes",
        localField: "_id",
        foreignField: "video",
        as: "likes",
      },
    },
    {
      $addFields: {
        likes: {
          $size: "$likes",
        },
      },
    },
    {
      $group: {
        _id: null,
        totalViews: {
          $sum: "$views",
        },
        totalVideos: {
          $sum: 1,
        },
        totalLikes: {
          $sum: "$likes",
        },
      },
    },
    {
      $addFields: {
        owner: new mongoose.Types.ObjectId(req?.user_id),
      },
    },
    {
      $lookup: {
        from: "subscriptions",
        localField: "owner",
        foreignField: "channel",
        as: "totalSubscriber",
      },
    },
    {
      $addFields: {
        totalSubscriber: {
          $size: "$totalSubscriber",
        },
      },
    },
    {
      $project: {
        _id: 0,
        owner: 0,
      },
    },
  ]);

  return res.status(200).json(new ApiResponse(200, statAggregation, "Stats get successfully"));
});

/**
 * @method GetChannelVideos
 */

const getChannelVideos = expressAsyncHandler(async (req, res) => {
  // TODO: Get all the videos uploaded bt the channel

  const userId = req.user._id;

  const uploadedVideosByChannel = await Video.aggregate([
    {
      $match: {
        owner: new mongoose.Types.ObjectId(userId),
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "owner",
        foreignField: "_id",
        as: "created_By",
        pipeline: [
          {
            $project: {
              username: 1,
              fullName: 1,
              avatar: 1,
            },
          },
        ],
      },
    },
    {
      $project: {
        isPublished: 0,
        owner: 0,
      },
    },
    {
      $addFields: {
        created_By: {
          $arrayElemAt: ["$created_By", 0],
        },
      },
    },
  ]);

  if (!uploadedVideosByChannel || uploadedVideosByChannel.length <= 0) {
    throw new ApiError(400, "Video list is Empty");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, uploadedVideosByChannel, "Successfully get all videos uploaded by channel"));
});

export { getChannelStats, getChannelVideos };
