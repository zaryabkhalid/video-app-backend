import mongoose from "mongoose";
import { Video } from "../models/video.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { expressAsyncHandler } from "../utils/expressAsyncHandler.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";

/**
 * @method GetAllVideos
 */
const getAllVideos = expressAsyncHandler(async (req, res) => {
  const { pageNo, sort, limit } = req.query;
  console.log(req.query);

  const videosAggregation = await Video.aggregate([
    {
      $match: {
        owner: new mongoose.Types.ObjectId(req.user._id),
      },
    },
  ]);

  const paginatedVideoData = await Video.aggregatePaginate(videosAggregation, {
    page: pageNo,
    limit: limit,
    sort: {
      createdAt: sort,
    },
  });

  return res.status(200).json(new ApiResponse(200, paginatedVideoData, "Success"));
});

//@method PulishVideo
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

  const thumbnail = await uploadOnCloudinary(thumbnailLocalPath);

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

//@method GetVideoById
const getVideoById = expressAsyncHandler(async (req, res) => {
  // TODO: get video by using video ID
  const videoId = req.params.videoId;

  if (!videoId) {
    throw new ApiError(400, "Video Id is missing");
  }

  const filteredVideo = await Video.findById(videoId).populate({
    path: "owner",
    select: "_id fullName avatar coverImage watchHistory",
  });
  if (!filteredVideo) {
    throw new ApiError(404, "Video Not Found");
  }

  return res.status(200).json(new ApiResponse(200, filteredVideo, "Success..."));
});

// @method UpdateVideo
const updateVideo = expressAsyncHandler(async (req, res) => {
  const { videoId } = req.params;
  const { title, description } = req.body;
  const thumbnailLocalPath = req.file?.path;

  if (!thumbnailLocalPath) {
    throw new ApiError(400, "Thumbnail is Required");
  }

  if (!title || !description) {
    throw new ApiError(400, "Title & Description is required.");
  }

  const thumbnail = await uploadOnCloudinary(thumbnailLocalPath);
  if (!thumbnail?.url) {
    throw new ApiError(400, "Error While uploading a thumnail...");
  }

  const filteredVideo = await Video.findByIdAndUpdate(
    videoId,
    {
      $set: {
        title: title,
        description: description,
        thumbnail: thumbnail.url,
      },
    },
    { new: true }
  ).select("title description thumbnail");

  if (!filteredVideo) {
    throw new ApiError(404, "Video Not found...");
  }

  return res.status(200).json(new ApiResponse(200, filteredVideo, "Video updated Successfully..."));
});

//  @method deleteVideo
const deleteVideo = expressAsyncHandler(async (req, res) => {
  //TODO: delete video from the database

  const videoId = req.params.videoId;

  if (!videoId) {
    throw new ApiError(400, "Video Id is missing");
  }

  const videoToBeDeleted = await Video.findByIdAndDelete(videoId);

  if (!videoToBeDeleted) {
    throw new ApiError(404, "Video does'nt exist");
  }

  return res.status(200).json(new ApiResponse(200, {}, "Video Deleted Succssfully..."));
});

//  @method togglePublishVideoStatus
const togglePublishStatus = expressAsyncHandler(async (req, res) => {
  const { videoId } = req.params;

  if (!videoId) {
    throw new ApiError(400, "Video Id is missing...");
  }

  const updatedStatusVideo = await Video.findById(videoId);

  if (!updatedStatusVideo) {
    throw new ApiError(404, "Video not found...");
  }

  updatedStatusVideo.isPublished = !updatedStatusVideo.isPublished;

  updatedStatusVideo.save({ validateBeforeSave: false });

  return res.status(200).json(new ApiResponse(200, updatedStatusVideo, "Status updated Successfully..."));
});

export { getAllVideos, getVideoById, publishAVideo, updateVideo, deleteVideo, togglePublishStatus };
