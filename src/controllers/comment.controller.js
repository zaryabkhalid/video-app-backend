import mongoose from "mongoose";
import { Comment } from "../models/comment.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { expressAsyncHandler } from "../utils/expressAsyncHandler.js";

/**
 * @method GetVedioComments
 */

const getVideoComments = expressAsyncHandler(async (req, res) => {
  // TODO: get all comments for a vedio

  const { videoId } = req.params;
  const { page = 1, limit = 10 } = req.query;
});

/**
 * @method AddComment
 */

const addComment = expressAsyncHandler(async (req, res) => {
  // TODO: Add a comment to a video
});

/**
 * @method UpdateComment
 */

const updateComment = expressAsyncHandler(async (req, res) => {
  // TODO: Update a Comment on a video
});

/**
 * @method DeleteComment
 */

const deleteComment = expressAsyncHandler(async (req, res) => {
  // TODO: Delete a comment from a vedio
});

export { getVideoComments, addComment, updateComment, deleteComment };
