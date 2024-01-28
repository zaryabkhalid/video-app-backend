import mongoose from "mongoose";
import { Tweet } from "../models/tweet.model.js";

const handleNewTweet = async (title, content, userId) => {
  const tweet = await Tweet.create({
    title,
    content,
    owner: userId,
  });

  return tweet;
};

const handleUserTweets = async (userId) => {
  page = isNaN(page) ? 1 : Number(page);
  limit = isNaN(limit) ? 10 : Number(limit);

  if (page <= 0) {
    page = 1;
  }

  if (limit <= 0) {
    limit = 10;
  }

  const sortStage = {};

  if (sortBy && sortType) {
    sortStage["$sort"] = {
      [sortBy]: sortType === "asc" ? 1 : -1,
    };
  } else {
    sortStage["$sort"] = {
      createdAt: -1,
    };
  }

  const tweetsAggregate = await Tweet.aggregate([
    {
      $match: {
        owner: new mongoose.Types.ObjectId(userId),
      },
    },
    sortStage,
    {
      $lookup: {
        from: "users",
        localField: "owner",
        foreignField: "_id",
        as: "createdBy",
        pipeline: [
          {
            $project: {
              username: 1,
              fullName: 1,
              avatar: 1,
            },
          },
        ],
      },
    },
  ]);

  return tweetsAggregate;
};

const handleUpdateTweet = async (tweetId, title, content) => {
  const updateTweet = await Tweet.findByIdAndUpdate(
    new mongoose.Types.ObjectId(tweetId),
    {
      $set: {
        title: title,
        content: content,
      },
    },
    { new: true }
  );

  return updateTweet;
};

const handleTweetDelete = async (tweetId) => {
  const deleteTweet = await Tweet.findByIdAndDelete(new mongoose.Types.ObjectId(tweetId)).select("_id");

  return deleteTweet;
};

export { handleNewTweet, handleUserTweets, handleUpdateTweet, handleTweetDelete };
