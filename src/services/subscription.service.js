import mongoose, { mongo } from "mongoose";
import { Subscription } from "../models/subscription.model.js";
import { ApiError } from "../utils/ApiError.js";

const handleGetUserChannelSubs = async (channelId) => {
  const subscribersList = await Subscription.find({
    channel: new mongoose.Types.ObjectId(channelId),
  })
    .populate({ path: "subscriber", select: "fullName username avatar" })
    .populate({ path: "channel", select: "username fullName avatar" });

  return subscribersList;
};

const handleUserSubscribedChannel = async (subscriberId) => {
  const subscribedChannels = await Subscription.find({
    subscriber: new mongoose.Types.ObjectId(subscriberId),
  })
    .populate({ path: "subsriber", select: "fullName username avatar" })
    .populate({ path: "channel", select: "username fullName avatar" });

  return subscribedChannels;
};

const handleToggleSubscription = async (channelId, userId) => {
  const hasSubscription = await Subscription.findOne({
    subscriber: new mongoose.Types.ObjectId(userId),
    channel: new mongoose.Types.ObjectId(channelId),
  });

  if (hasSubscription) {
    const deleteSubscription = await Subscription.findOneAndDelete({
      subscriber: new mongoose.Types.ObjectId(userId),
      channel: new mongoose.Types.ObjectId(channelId),
    });

    if (!deleteSubscription) {
      throw new ApiError(500, "Something went wrong while unsubscribing");
    }

    return deleteSubscription;
  } else {
    const subscribe = await Subscription.create({
      subscriber: new mongoose.Types.ObjectId(userId),
      channel: new mongoose.Types.ObjectId(channelId),
    });

    if (!subscribe) {
      throw new ApiError(500, "Something went wrong while subscribing");
    }

    return subscribe;
  }
};

export { handleGetUserChannelSubs, handleUserSubscribedChannel, handleToggleSubscription };
