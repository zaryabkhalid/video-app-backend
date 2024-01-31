import mongoose, { isValidObjectId } from "mongoose";
import { Like } from "../models/like.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { expressAsyncHandler } from "../utils/expressAsyncHandler.js";

/**
 * @method toggleVideoLike
 */
const toggleVideoLike = expressAsyncHandler(async (req, res) => {
  //TODO: toggle like on video
  const { videoId } = req.params;
  const userId = req?.user._id;

  if (!isValidObjectId(videoId)) {
    throw new ApiError(400, "Video Id isn't Valid");
  }

  const data = { videos: new mongoose.Types.ObjectId(videoId), likedBy: new mongoose.Types.ObjectId(userId) };

  try {
    const toggleLikedVideo = await Like.findOne(data);
    if (!toggleLikedVideo) {
      const createVideoLike = await Like.create(data);
      return res.status(201).json(new ApiResponse(200, createVideoLike, "Video Liked Successfully..."));
    } else {
      const removeVideoLike = await Like.findOneAndDelete(data);
      return res.status(200).json(200, removeVideoLike, "Video unliked Successfully...");
    }
  } catch (error) {
    throw new ApiError(500, error.message || "Something went wrong...");
  }
});

/**
 * @method toggleCommentLike
 */
const toggleCommentLike = expressAsyncHandler(async (req, res) => {
  //TODO: toggle like on comment
  const { commentId } = req.params;

  const userId = req?.user._id;

  if (!isValidObjectId(commentId)) {
    throw new ApiError(400, "Comment Id isn't Valid");
  }

  const data = { comment: new mongoose.Types.ObjectId(commentId), likedBy: new mongoose.Types.ObjectId(userId) };

  try {
    const toggleLikedComment = await Like.findOne(data);
    if (!toggleLikedComment) {
      const createCommentLike = await Like.create(data);
      return res.status(201).json(new ApiResponse(200, createCommentLike, "Comment Liked Successfully..."));
    } else {
      const removeCommentLike = await Like.findOneAndDelete(data);
      return res.status(200).json(200, removeCommentLike, "Comment unliked Successfully...");
    }
  } catch (error) {
    throw new ApiError(500, error.message || "Something went wrong...");
  }
});

/**
 * @method toggleTweetLike
 */
const toggleTweetLike = expressAsyncHandler(async (req, res) => {
  //TODO: toggle like on tweet
  const { tweetId } = req.params;

  const userId = req?.user._id;

  if (!isValidObjectId(tweetId)) {
    throw new ApiError(400, "Tweet Id isn't Valid");
  }

  const data = { tweet: new mongoose.Types.ObjectId(tweetId), likedBy: new mongoose.Types.ObjectId(userId) };

  try {
    const toggleLikedTweet = await Like.findOne(data);
    if (!toggleLikedTweet) {
      const createTweetLike = await Like.create(data);
      return res.status(201).json(new ApiResponse(200, createTweetLike, "Tweet Liked Successfully..."));
    } else {
      const removeTweetLiked = await Like.findOneAndDelete(data);
      return res.status(200).json(200, removeTweetLiked, "Tweet unliked Successfully...");
    }
  } catch (error) {
    throw new ApiError(500, error.message || "Something went wrong...");
  }
});

/**
 * @method getLikedVideos
 */
const getLikedVideos = expressAsyncHandler(async (req, res) => {
  //TODO: get all liked videos

  const userId = req?.user._id;

  try {
    const likedVideos = await Like.find({
      likedBy: new mongoose.Types.ObjectId(userId),
      videos: {
        $exists: true,
      },
    });

    if (!likedVideos) {
      throw new ApiError(404, "Liked Video list is empty");
    }

    return res.status(200).json(new ApiResponse(200, likedVideos, "successfully get liked Videos..."));
  } catch (error) {
    throw new ApiError(500, error.message || "Something went wrong");
  }
});

export { toggleCommentLike, toggleTweetLike, toggleVideoLike, getLikedVideos };
