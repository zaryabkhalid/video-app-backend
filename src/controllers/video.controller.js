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

  const { title, description } = req.body;

  if ([title, description].some((field) => field?.trim() === "")) {
    throw new ApiError("Title or Description is required");
  }

  let videoFileLocalPath;
  let thumbnailLocalPath;

  // Verifying VideoFilePath
  if (req.files && Array.isArray(req.files.videoFile) && req.files.videoFile.length > 0) {
    videoFileLocalPath = req.files.videoFile[0].path;
  }

  if (!videoFileLocalPath) {
    throw new ApiError("Video File is required");
  }

  // Verifying Thumbnail Path

  if (req.files && Array.isArray(req.files.thumbnail) && req.files.thumbnail.length > 0) {
    thumbnailLocalPath = req.files.thumbnail[0].path;
  }

  if (!thumbnailLocalPath) {
    throw new ApiError("Thumbnail is required");
  }

  const videoFile = await uploadOnCloudinary(videoFileLocalPath);
  console.log("VideoFile: ", videoFile);
  const thumbnail = await uploadOnCloudinary(thumbnailLocalPath);
  console.log("Thumbnail: ", thumbnail);

  const savedVideo = await Video.create({
    title,
    description,
    videoFile: videoFile?.url,
    duration: videoFile?.duration,
    thumbnail: thumbnail?.url,
    owner: req.user._id,
  });

  if (!savedVideo) {
    throw new ApiError(500, "Something went wrong");
  }

  return res.status(201).json(new ApiResponse(200, savedVideo, "Video Uploaded Successfully..."));
});

/**
 * ----------------------
 * @method GetVideoById
 * ----------------------
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

export { getAllVideos, getVideoById, publishAVideo, updateVideo, deleteVideo, togglePublishStatus };
