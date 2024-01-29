import { Playlist } from "../models/playlist.model.js";
import mongoose from "mongoose";
import { ApiError } from "../utils/ApiError.js";

const handleCreatePlaylist = async (playlistName, playlistDesc, userId) => {
  try {
    const newPlayList = await Playlist.create({
      name: playlistName,
      description: playlistDesc,
      owner: userId,
    });

    return newPlayList;
  } catch (error) {
    throw new Error(`Unable to create playList: ${error.message}`);
  }
};

const handleUserPlaylist = async (userId, page, limit, sortType) => {
  try {
    page = isNaN(page) ? 1 : Number(page);
    limit = isNaN(limit) ? 10 : Number(limit);

    if (page <= 0) {
      page = 0;
    }
    if (limit <= 0) {
      limit = 10;
    }

    const paginatedAggregatePlaylists = await Playlist.aggregatePaginate(
      Playlist.aggregate([
        {
          $match: {
            owner: new mongoose.Types.ObjectId(userId),
          },
        },
        {
          $sort: {
            createdAt: parseInt(sortType),
          },
        },
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
                  _id: 0,
                },
              },
            ],
          },
        },
        {
          $project: {
            owner: 0,
          },
        },
      ]),
      {
        page: parseInt(page),
        limit: parseInt(limit),
      }
    );

    return paginatedAggregatePlaylists;
  } catch (error) {
    throw new Error(`Unable to find playList: ${error.message}`);
  }
};

const handleGetPlaylistById = async (playlistId) => {
  try {
    const playlist = await Playlist.findById(playlistId);
    return playlist;
  } catch (error) {
    throw new ApiError(400, error.message);
  }
};

const handleAddVideoToPlaylist = async (playlistId, videoId) => {
  const addVideoToPlaylist = await Playlist.findByIdAndUpdate(
    new mongoose.Types.ObjectId(playlistId),
    {
      $push: {
        videos: new mongoose.Types.ObjectId(videoId),
      },
    },
    { new: true }
  );

  return addVideoToPlaylist;
};

const handleUpdatePlaylist = async (playlistId, name, description) => {
  const updatePlaylist = await Playlist.findByIdAndUpdate(
    new mongoose.Types.ObjectId(playlistId),
    {
      $set: {
        name: name,
        description: description,
      },
    },
    { new: true }
  );
};

const handleDeletePlaylist = async (playlistId) => {
  const deletedPlaylist = await Playlist.findByIdAndDelete(new mongoose.Types.ObjectId(playlistId));

  return deletedPlaylist._id;
};

const handleRemoveVideoFromPlaylist = async (playlistId, videoId) => {
  const removedVideoFromPlayList = await Playlist.findByIdAndUpdate(
    new mongoose.Types.ObjectId(playlistId),
    {
      $pull: {
        videos: new mongoose.Types.ObjectId(videoId),
      },
    },
    { new: true }
  );

  return removedVideoFromPlayList;
};

export {
  handleCreatePlaylist,
  handleUserPlaylist,
  handleGetPlaylistById,
  handleAddVideoToPlaylist,
  handleUpdatePlaylist,
  handleDeletePlaylist,
  handleRemoveVideoFromPlaylist,
};
