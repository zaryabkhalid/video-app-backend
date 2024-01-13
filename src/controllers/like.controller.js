import mongoose, { isValidObjectId } from "mongoose";
import { Like } from "../models/like.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { expressAsyncHandler } from "../utils/expressAsyncHandler.js";

/**
 * @method toggleVideoLike
 */
const toggleVideoLike = expressAsyncHandler(async (req, res) => {
  const { videoId } = req.params;
  //TODO: toggle like on video
});

/**
 * @method toggleCommentLike
 */
const toggleCommentLike = expressAsyncHandler(async (req, res) => {
  const { commentId } = req.params;
  //TODO: toggle like on comment
});

/**
 * @method toggleTweetLike
 */
const toggleTweetLike = expressAsyncHandler(async (req, res) => {
  const { tweetId } = req.params;
  //TODO: toggle like on tweet
});

/**
 * @method getLikedVideos
 */
const getLikedVideos = expressAsyncHandler(async (req, res) => {
  //TODO: get all liked videos
});

export { toggleCommentLike, toggleTweetLike, toggleVideoLike, getLikedVideos };
