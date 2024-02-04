import mongoose, { isValidObjectId } from "mongoose";
import { Comment } from "../models/comment.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { expressAsyncHandler } from "../utils/expressAsyncHandler.js";
import { httpStatusCode } from "../utils/httpStatus.js";

/**
 * @method GetVedioComments
 */

const getVideoComments = expressAsyncHandler(async (req, res, next) => {
  //TODO: get all comments for a vedio

  const { videoId } = req.params;
  const { page, limit } = req.query;

  const isVideoIValid = isValidObjectId(videoId);

  if (!isVideoIValid) {
    next(new ApiError(httpStatusCode.BAD_REQUEST, "Video Id is'nt Valid"));
  }

  const commentsOnVideo = await Comment.aggregate([
    {
      $match: {
        videos: new mongoose.Types.ObjectId(videoId),
      },
    },
    {
      $lookup: {
        from: "videos",
        localField: "videos",
        foreignField: "_id",
        as: "video_details",
        pipeline: [
          {
            $project: {
              _id: 1,
              title: 1,
              description: 1,
            },
          },
        ],
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "owner",
        foreignField: "_id",
        as: "user_details",
        pipeline: [
          {
            $project: {
              _id: 1,
              username: 1,
              fullName: 1,
              avatar: 1,
            },
          },
        ],
      },
    },
    {
      $addFields: {
        video_details: {
          $arrayElemAt: ["$video_details", 0],
        },
        user_details: {
          $arrayElemAt: ["$user_details", 0],
        },
      },
    },
    {
      $skip: (page - 1) * limit,
    },
    {
      $limit: parseInt(limit),
    },
  ]);

  if (!commentsOnVideo) {
    return next(new ApiError(httpStatusCode.NOT_FOUND, "Video not Found"));
  }

  return res.status(httpStatusCode.OK).json(new ApiResponse(httpStatusCode.OK, commentsOnVideo, "Success..."));
});

/**
 * @method AddComment
 */

const addComment = expressAsyncHandler(async (req, res, next) => {
  // TODO: Add a comment to a video
  const { videoId } = req.params;
  const { content } = req.body;
  const userId = req.user._id;

  const isValidId = isValidObjectId(new mongoose.Types.ObjectId(videoId));

  if (!isValidId) {
    return next(new ApiError(httpStatusCode.BAD_REQUEST, "video Id isn't valid..."));
  }

  if (!content) {
    return next(new ApiError(httpStatusCode.BAD_REQUEST, "content is required"));
  }

  const newContent = await Comment.create({
    content: content,
    videos: videoId,
    owner: userId,
  });

  if (!newContent) {
    return next(
      new ApiError(
        httpStatusCode.INTERNAL_SERVER_ERROR,
        "Something went wrong while commenting please try again later..."
      )
    );
  }

  return res
    .status(httpStatusCode.CREATED)
    .json(new ApiResponse(httpStatusCode.CREATED, newContent, "Successfully commented on Video"));
});

/**
 * @method UpdateComment
 */

const updateComment = expressAsyncHandler(async (req, res, next) => {
  // TODO: Update a Comment on a video

  const { commentId } = req.params;
  const { content } = req.body;

  if (!commentId) {
    return next(ApiError(httpStatusCode.BAD_REQUEST, "Comment Id is not valid..."));
  }

  if (!content) {
    return next(ApiError(httpStatusCode.BAD_REQUEST, "Content is required..."));
  }

  const filteredComment = await Comment.findByIdAndUpdate(
    commentId,
    {
      $set: {
        content: content,
      },
    },
    {
      new: true,
    }
  )
    .populate({ path: "videos", select: "_id videoFile thumbnail title description view isPublished" })
    .populate({ path: "owner", select: "-refreshTokens -password" });

  if (!filteredComment) {
    return next(new ApiError(httpStatusCode.INTERNAL_SERVER_ERROR, "something went wrong while updating comment"));
  }

  return res
    .status(httpStatusCode.OK)
    .json(new ApiResponse(httpStatusCode.OK, filteredComment, "comment update successfully..."));
});

/**
 * @method DeleteComment
 */

const deleteComment = expressAsyncHandler(async (req, res, next) => {
  // TODO: Delete a comment from a vedio

  const { commentId } = req.params;

  if (!commentId) {
    return next(new ApiError(httpStatusCode.BAD_REQUEST, "comment id is required"));
  }

  const commentToBeDeleted = await Comment.findByIdAndDelete(commentId);

  if (!commentToBeDeleted) {
    return next(new ApiError(httpStatusCode.INTERNAL_SERVER_ERROR, "Something went wrong while deleting comment."));
  }

  const deleteCommentId = commentToBeDeleted._id;

  return res
    .status(httpStatusCode.OK)
    .json(new ApiResponse(httpStatusCode.OK, { deleteCommentId }, "comment deletd successfully..."));
});

export { getVideoComments, addComment, updateComment, deleteComment };
