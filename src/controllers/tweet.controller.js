import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { expressAsyncHandler } from "../utils/expressAsyncHandler.js";
import { handleNewTweet, handleUserTweets, handleUpdateTweet, handleTweetDelete } from "../services/tweet.service.js";

import { httpStatusCode } from "../utils/httpStatus.js";

const createTweet = expressAsyncHandler(async (req, res) => {
  //TODO: create tweet

  const { title, content } = req?.body;
  const userId = req?.user?._id;

  const createdTweet = await handleNewTweet(title, content, userId);

  if (!createdTweet) {
    throw new ApiError(httpStatusCode.INTERNAL_SERVER_ERROR, "Error while creating tweet");
  }

  return res
    .status(httpStatusCode.CREATED)
    .json(new ApiResponse(httpStatusCode.OK, createTweet, "Tweet Created Successfully..."));
});

const getUserTweets = expressAsyncHandler(async (req, res) => {
  // TODO: get user tweets

  const { userId } = req.params;
  let { page = 1, limit = 10, sortBy, sortType } = req.query;

  const userTweets = await handleUserTweets(userId, page, limit, sortBy, sortType);

  if (!userTweets || userTweets.length <= 0) {
    return res
      .status(httpStatusCode.OK)
      .json(new ApiResponse(httpStatusCode.OK, [], "User Does not have any tweets..."));
  }

  return res.status(200).json(new ApiResponse(200, userTweets, "Fetched User Tweets Successfully..."));
});

const updateTweet = expressAsyncHandler(async (req, res) => {
  //TODO: update tweet

  const { tweetId } = req.params;
  const { title, content } = req.body;

  const updatedTweet = await handleUpdateTweet(tweetId, title, content);

  if (!updateTweet) {
    throw new ApiError(httpStatusCode.INTERNAL_SERVER_ERROR, "Tweet Updation Failed...");
  }

  return res
    .status(httpStatusCode.OK)
    .json(new ApiResponse(httpStatusCode.OK, updateTweet, "Tweet Updated Successfully..."));
});

const deleteTweet = expressAsyncHandler(async (req, res) => {
  //TODO: delete tweet

  const { tweetId } = req.params;

  const deletedTweet = await handleTweetDelete(tweetId);

  if (!deletedTweet) {
    throw new ApiError(httpStatusCode.NOT_FOUND, "Tweet not found");
  }

  return res
    .status(httpStatusCode.OK)
    .json(new ApiResponse(httpStatusCode.OK, deletedTweet, "Tweet Deleted Successfully..."));
});

export { createTweet, getUserTweets, updateTweet, deleteTweet };
