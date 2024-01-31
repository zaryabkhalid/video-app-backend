import { isValidObjectId } from "mongoose";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { expressAsyncHandler } from "../utils/expressAsyncHandler.js";
import {
  handleGetUserChannelSubs,
  handleUserSubscribedChannel,
  handleToggleSubscription,
} from "../services/subscription.service.js";

const toggleSubscription = expressAsyncHandler(async (req, res) => {
  // TODO: toggle subscription
  const { channelId } = req.params;
  const userId = req?.user._id;

  if (!isValidObjectId(channelId)) {
    throw new ApiError(400, "channel ID isn't valid...");
  }

  const toggleSubscription = await handleToggleSubscription(channelId, userId);

  return res.status(200).json(200, toggleSubscription, "Success");
});

// controller to return subscriber list of a channel
const getUserChannelSubscribers = expressAsyncHandler(async (req, res) => {
  const { channelId } = req.params;

  if (!isValidObjectId(channelId)) {
    throw new ApiError(400, "channel ID is not valid");
  }

  const userChannelSubscriberList = await handleGetUserChannelSubs(channelId);

  console.log("Subscriber List: ", userChannelSubscriberList);

  if (!userChannelSubscriberList) {
    throw new ApiError(400, "Subscriber list is Empty");
  }

  return res.status(200).json(new ApiResponse(200, userChannelSubscriberList, "Subscribers fetched Successfully..."));
});

// controller to return channel list to which user has subscribed
const getSubscribedChannels = expressAsyncHandler(async (req, res) => {
  const { subscriberId } = req.params;

  if (!isValidObjectId(subscriberId)) {
    throw new ApiError(400, "subscriber ID is not valid");
  }

  const subscribedChannels = await handleUserSubscribedChannel(subscriberId);

  if (!subscribedChannels) {
    throw new ApiError(400, "No Channel Subscribed yet...");
  }

  return res.status(200).json(new ApiResponse(200, subscribedChannels, "Successfully get subscribed channels"));
});

export { toggleSubscription, getUserChannelSubscribers, getSubscribedChannels };
