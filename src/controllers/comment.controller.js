import mongoose, { isValidObjectId } from "mongoose";
import { Comment } from "../models/comment.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { expressAsyncHandler } from "../utils/expressAsyncHandler.js";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

/**
 * @method GetVedioComments
 */

const getVideoComments = expressAsyncHandler(async (req, res) => {
  //TODO: get all comments for a vedio

  const { videoId } = req.params;
  const { page = 1, limit = 10 } = req.query;

  const filteredVideoID = isValidObjectId(videoId);

  if (!filteredVideoID) {
    throw new ApiError(400, "Video Id is'nt Valid");
  }

  const commentAggregate = await Comment.aggregate([
    {
      $match: new mongoose.Types.ObjectId(videoId),
    },
  ]);

  if (!commentAggregate) {
    throw new ApiError(402, "Video not Found");
  }

  const pagianatedComments = mongooseAggregatePaginate(commentAggregate, {
    page: page,
    limit: limit,
  });

  return res.status(200).json(new ApiResponse(200, pagianatedComments, "Success..."));
});

/**
 * @method AddComment
 */

const addComment = expressAsyncHandler(async (req, res) => {
  // TODO: Add a comment to a video
  const { videoId } = req.params;
  const { content } = req.body;
  const userId = req.user._id;

  const isValidId = isValidObjectId(new mongoose.Types.ObjectId(videoId));

  if (!isValidId) {
    throw new ApiError(400, "video Id isn't valid...");
  }

  if (!content) {
    throw new ApiError(400, "content is required");
  }

  const newContent = await Comment.create({
    content: content,
    videos: videoId,
    owner: userId,
  });

  if (!newContent) {
    throw new ApiError(500, "Something went wrong while commenting please try again later...");
  }

  return res.status(201).json(new ApiResponse(201, newContent, "Successfully commented on Video"));
});

/**
 * @method UpdateComment
 */

const updateComment = expressAsyncHandler(async (req, res) => {
  // TODO: Update a Comment on a video

  const { commentId } = req.params;
  const { content } = req.body;

  if (!commentId) {
    throw new ApiError(400, "Comment Id is not valid...");
  }

  if (!content) {
    throw new ApiError(400, "Content is required...");
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
  );

  if (!filteredComment) {
    throw new ApiError(402, "something Went Wrong");
  }
  console.log("Comment find by using userId", filteredComment);

  return res.status(200).json(new ApiResponse(200, filteredComment, "comment update successfully..."));
});

/**
 * @method DeleteComment
 */

const deleteComment = expressAsyncHandler(async (req, res) => {
  // TODO: Delete a comment from a vedio

  const { commentId } = req.params;

  if (!commentId) {
    throw new ApiError(400, "comment id is required");
  }

  const commentToBeDeleted = await Comment.findByIdAndDelete(commentId);

  if (!commentToBeDeleted) {
    throw new ApiError(400, "Something went wrong while deleting comment.");
  }

  const deleteCommentId = commentToBeDeleted._id;

  return res.status(200).json(new ApiResponse(200, { deleteCommentId }, "comment deletd successfully..."));
});

export { getVideoComments, addComment, updateComment, deleteComment };
