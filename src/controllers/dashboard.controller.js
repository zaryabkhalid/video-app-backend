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
});

/**
 * @method GetChannelVideos
 */

const getChannelVideos = expressAsyncHandler(async (req, res) => {
  // TODO: Get all the videos uploaded bt the channel
});

export { getChannelStats, getChannelVideos };
