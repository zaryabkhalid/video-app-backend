import mongoose, { isValidObjectId } from "mongoose";
import { Tweet } from "../models/tweet.model.js";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { expressAsyncHandler } from "../utils/expressAsyncHandler.js";

const createTweet = expressAsyncHandler(async (req, res) => {
  //TODO: create tweet
});

const getUserTweets = expressAsyncHandler(async (req, res) => {
  // TODO: get user tweets
});

const updateTweet = expressAsyncHandler(async (req, res) => {
  //TODO: update tweet
});

const deleteTweet = expressAsyncHandler(async (req, res) => {
  //TODO: delete tweet
});

export { createTweet, getUserTweets, updateTweet, deleteTweet };
