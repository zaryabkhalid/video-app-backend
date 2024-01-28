import { isValidObjectId } from "mongoose";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { expressAsyncHandler } from "../utils/expressAsyncHandler.js";
import { handleNewTweet, handleUserTweets, handleUpdateTweet, handleTweetDelete } from "../services/tweet.service.js";

const createTweet = expressAsyncHandler(async (req, res) => {
  //TODO: create tweet

  const { title, content } = req?.body;
  const userId = req?.user?._id;
  if (!isValidObjectId(userId)) {
    throw new ApiError(400, "User id isn't valid...");
  }

  if (!title.trim() || !content.trim()) {
    throw new ApiError(400, "Title and Content is required");
  }

  const createdTweet = await handleNewTweet(title, content, userId);

  if (!createdTweet) {
    throw new ApiError(500, "Error while creating tweet");
  }

  return res.status(201).json(new ApiResponse(200, createTweet, "Tweet Created Successfully..."));
});

const getUserTweets = expressAsyncHandler(async (req, res) => {
  // TODO: get user tweets

  const { userId } = req.params;
  let { page = 1, limit = 10, sortBy, sortType } = req.query;

  if (!isValidObjectId(userId)) {
    throw new ApiError(400, "User ID isn't valid...");
  }
  const userTweets = await handleUserTweets(userId, page, limit, sortBy, sortType);

  if (!userTweets || userTweets.length <= 0) {
    throw new ApiError(400, "User does'nt have any tweets");
  }

  return res.status(200).json(new ApiResponse(200, userTweets, "Fetched User Tweets Successfully..."));
});

const updateTweet = expressAsyncHandler(async (req, res) => {
  //TODO: update tweet

  const { tweetId } = req.params;
  const { title, content } = req.body;

  if (!isValidObjectId(tweetId)) {
    throw new ApiError(400, "Tweet ID isn't Valid... ");
  }

  if (!title.trim() || !content.trim()) {
    throw new ApiError(400, "Title OR Content is required...");
  }

  const updatedTweet = await handleUpdateTweet(tweetId, title, content);

  if (!updateTweet) {
    throw new ApiError(400, "Tweet Updation Failed...");
  }

  return res.status(200).json(new ApiResponse(200, updateTweet, "Tweet Updated Successfully..."));
});

const deleteTweet = expressAsyncHandler(async (req, res) => {
  //TODO: delete tweet

  const { tweetId } = req.params;
  if (!isValidObjectId(tweetId)) {
    throw new ApiError(400, "Tweet ID isn't Valid...");
  }

  const deletedTweet = await handleTweetDelete(tweetId);

  if (!deletedTweet) {
    throw new ApiError(400, "Tweet not found");
  }

  return res.status(200).json(200, deletedTweet, "Tweet Deleted Successfully...");
});

export { createTweet, getUserTweets, updateTweet, deleteTweet };
