import mongoose, { isValidObjectId } from "mongoose";
import { httpStatusCode } from "../utils/httpStatus.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { expressAsyncHandler } from "../utils/expressAsyncHandler.js";
import {
  handleCreatePlaylist,
  handleUserPlaylist,
  handleGetPlaylistById,
  handleAddVideoToPlaylist,
  handleUpdatePlaylist,
  handleDeletePlaylist,
  handleRemoveVideoFromPlaylist,
} from "../services/playlist.service.js";

const createPlaylist = expressAsyncHandler(async (req, res) => {
  const { name, description } = req.body;
  const userId = req?.user._id;
  //TODO: create playlist

  const newPlaylist = await handleCreatePlaylist(name, description, userId);

  if (!newPlaylist) {
    throw new ApiError(httpStatusCode.INTERNAL_SERVER_ERROR, "Playlist creation failed...");
  }

  return res
    .status(httpStatusCode.CREATED)
    .json(new ApiResponse(httpStatusCode.CREATED, newPlaylist, "Playlist created Successfully..."));
});

const getUserPlaylists = expressAsyncHandler(async (req, res) => {
  //TODO: get user playlists
  const { userId } = req.params;
  const { page = 1, limit = 10, sortType = -1 } = req.query;

  const aggregatePlaylists = await handleUserPlaylist(userId, page, limit, sortType);

  if (!aggregatePlaylists || aggregatePlaylists.length <= 0) {
    throw new ApiError(httpStatusCode.NOT_FOUND, "User does'nt have any playlist");
  }

  return res
    .status(httpStatusCode.OK)
    .json(new ApiResponse(httpStatusCode.OK, aggregatePlaylists, "Users all playlists"));
});

const getPlaylistById = expressAsyncHandler(async (req, res) => {
  //TODO: get playlist by id
  const { playlistId } = req.params;

  const playlist = await handleGetPlaylistById(playlistId);

  if (!playlist) {
    throw new ApiError(httpStatusCode.NOT_FOUND, "Playlist does'nt exists");
  }

  return res
    .status(httpStatusCode.OK)
    .json(new ApiResponse(httpStatusCode.OK, playlist, "Successfully fetched playlist"));
});

const addVideoToPlaylist = expressAsyncHandler(async (req, res) => {
  const { playlistId, videoId } = req.params;

  const addVideoToPlaylist = await handleAddVideoToPlaylist(videoId, playlistId);

  if (!addVideoToPlaylist) {
    throw new ApiError(httpStatusCode.BAD_REQUEST, "Video Add in Playlist Failed...");
  }

  return res
    .status(httpStatusCode.OK)
    .json(new ApiResponse(httpStatusCode.OK, addVideoToPlaylist, "Video Added Successfull"));
});

const removeVideoFromPlaylist = expressAsyncHandler(async (req, res) => {
  // TODO: remove video from playlist
  const { playlistId, videoId } = req.params;

  const removedVideoFromPlayList = await handleRemoveVideoFromPlaylist(playlistId, videoId);

  if (!removeVideoFromPlaylist) {
    throw new ApiError(httpStatusCode.NOT_FOUND, "Video Not Found");
  }

  return res
    .status(httpStatusCode.OK)
    .json(new ApiResponse(httpStatusCode.OK, removedVideoFromPlayList, "Video Removed from playlist successfully..."));
});

const deletePlaylist = expressAsyncHandler(async (req, res) => {
  // TODO: delete playlist
  const { playlistId } = req.params;

  const deletedPlaylistId = await handleDeletePlaylist(playlistId);

  if (!deletedPlaylistId) {
    throw new ApiError(httpStatusCode.NOT_FOUND, "Playlist not found");
  }

  return res
    .status(httpStatusCode.OK)
    .json(new ApiResponse(httpStatusCode.OK, { deletedPlaylistId }, "Playlist Deleted Successfully..."));
});

const updatePlaylist = expressAsyncHandler(async (req, res) => {
  //TODO: update playlist

  const { playlistId } = req.params;
  const { name, description } = req.body;

  const updatePlaylist = await handleUpdatePlaylist(playlistId, name, description);

  if (!updatePlaylist) {
    throw new ApiError(httpStatusCode.BAD_REQUEST, "Playlist updation Failed...");
  }

  return res
    .status(httpStatusCode.OK)
    .json(new ApiResponse(httpStatusCode.OK, updatePlaylist, "Playlist updated Successfully..."));
});

export {
  createPlaylist,
  getUserPlaylists,
  getPlaylistById,
  addVideoToPlaylist,
  removeVideoFromPlaylist,
  deletePlaylist,
  updatePlaylist,
};
