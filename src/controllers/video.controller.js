import mongoose from "mongoose";
import { User } from "../models/user.model.js";
import { Video } from "../models/video.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { expressAsyncHandler } from "../utils/expressAsyncHandler.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";

/**
 * @method GetAllVideos
 */
const getAllVideos = expressAsyncHandler(async (req, res) => {
  // TODO: get all videos from db using queries like pagination, sort and limit=10;
});

/**
 * @method PulishVideo
 */
const publishAVideo = expressAsyncHandler(async (req, res) => {
  // TODO: Get upload video on a cloudinary and save its link on db.
});

/**
 * @method GetVideoById
 */
const getVideoById = expressAsyncHandler(async (req, res) => {
  // TODO: get video by using video ID
});

/**
 * @method UpdateVideo
 */
const updateVideo = expressAsyncHandler(async (req, res) => {
  // TODO: Update video details like title, description, thumbnail
});

/**
 * @method deleteVideo
 */

const deleteVideo = expressAsyncHandler(async (req, res) => {
  const { videoId } = req.params;
  //TODO: delete video from the database
});

/**
 * @method togglePublishVideoStatus
 */
const togglePublishStatus = expressAsyncHandler(async (req, res) => {
  // TODO: Make video publish or draft
  const { videoId } = req.params;
});

export {
  getAllVideos,
  getVideoById,
  publishAVideo,
  updateVideo,
  deleteVideo,
  togglePublishStatus,
};
