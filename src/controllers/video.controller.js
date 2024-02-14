import mongoose from "mongoose";
import { Video } from "../models/video.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { expressAsyncHandler } from "../utils/expressAsyncHandler.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { httpStatusCode } from "../utils/httpStatus.js";

/**
 * @method GetAllVideos
 */
const getAllVideos = expressAsyncHandler(async (req, res) => {
  const { pageNo, sort, limit } = req.query;
  const videosAggregation = await Video.aggregate([
    {
      $match: {
        owner: new mongoose.Types.ObjectId(req.user._id),
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "owner",
        foreignField: "_id",
        as: "user",
        pipeline: [
          {
            $project: {
              username: 1,
              fullName: 1,
              _id: 1,
            },
          },
        ],
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

  return res.status(httpStatusCode.OK).json(new ApiResponse(httpStatusCode.OK, paginatedVideoData, "Success"));
});

//@method PulishVideo
const publishAVideo = expressAsyncHandler(async (req, res) => {
  // TODO: Get upload video on a cloudinary and save its link on db.

  const { title, description } = req.body;

  let videoFileLocalPath;
  let thumbnailLocalPath;

  // Verifying VideoFilePath
  if (req.files && Array.isArray(req.files.videoFile) && req.files.videoFile.length > 0) {
    videoFileLocalPath = req.files.videoFile[0].path;
  }

  if (!videoFileLocalPath) {
    throw new ApiError(httpStatusCode.BAD_REQUEST, "Video File is required");
  }

  // Verifying Thumbnail Path

  if (req.files && Array.isArray(req.files.thumbnail) && req.files.thumbnail.length > 0) {
    thumbnailLocalPath = req.files.thumbnail[0].path;
  }

  if (!thumbnailLocalPath) {
    throw new ApiError(httpStatusCode.BAD_REQUEST, "Thumbnail is required");
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
    throw new ApiError(httpStatusCode.INTERNAL_SERVER_ERROR, "Something went wrong");
  }

  return res
    .status(httpStatusCode.CREATED)
    .json(new ApiResponse(httpStatusCode.CREATED, savedVideo, "Video Uploaded Successfully..."));
});

//@method GetVideoById
const getVideoById = expressAsyncHandler(async (req, res) => {
  // TODO: get video by using video ID
  const videoId = req.params.videoId;

  const filteredVideo = await Video.findById(videoId).populate({
    path: "owner",
    select: "_id fullName avatar coverImage watchHistory",
  });
  if (!filteredVideo) {
    throw new ApiError(httpStatusCode.NOT_FOUND, "Video Not Found");
  }

  return res.status(httpStatusCode.OK).json(new ApiResponse(httpStatusCode.OK, filteredVideo, "Success..."));
});

// @method UpdateVideo
const updateVideo = expressAsyncHandler(async (req, res) => {
  const { videoId } = req.params;
  const { title, description } = req.body;
  const thumbnailLocalPath = req.file?.path;

  if (!thumbnailLocalPath) {
    throw new ApiError(400, "Thumbnail is Required");
  }

  const thumbnail = await uploadOnCloudinary(thumbnailLocalPath);
  if (!thumbnail?.url) {
    throw new ApiError(httpStatusCode.INTERNAL_SERVER_ERROR, "Error While uploading a thumnail...");
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
    throw new ApiError(httpStatusCode.NOT_FOUND, "Video Not found...");
  }

  return res
    .status(httpStatusCode.OK)
    .json(new ApiResponse(httpStatusCode.OK, filteredVideo, "Video updated Successfully..."));
});

//  @method deleteVideo
const deleteVideo = expressAsyncHandler(async (req, res) => {
  //TODO: delete video from the database

  const videoId = req.params.videoId;

  const videoToBeDeleted = await Video.findByIdAndDelete(videoId);

  if (!videoToBeDeleted) {
    throw new ApiError(httpStatusCode.NOT_FOUND, "Video does'nt exist");
  }

  return res.status(httpStatusCode.OK).json(new ApiResponse(httpStatusCode.OK, {}, "Video Deleted Succssfully..."));
});

//  @method togglePublishVideoStatus
const togglePublishStatus = expressAsyncHandler(async (req, res) => {
  const { videoId } = req.params;

  const updatedStatusVideo = await Video.findById(videoId);

  if (!updatedStatusVideo) {
    throw new ApiError(httpStatusCode.NOT_FOUND, "Video not found...");
  }

  updatedStatusVideo.isPublished = !updatedStatusVideo.isPublished;

  updatedStatusVideo.save({ validateBeforeSave: false });

  return res
    .status(httpStatusCode.OK)
    .json(new ApiResponse(httpStatusCode.OK, updatedStatusVideo, "Status updated Successfully..."));
});

export { getAllVideos, getVideoById, publishAVideo, updateVideo, deleteVideo, togglePublishStatus };
