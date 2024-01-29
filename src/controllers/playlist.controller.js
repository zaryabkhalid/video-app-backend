import mongoose, { isValidObjectId } from "mongoose";
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
  if (!name.trim() || !description.trim()) {
    throw new ApiError(400, "Name and Description fields are required...");
  }

  if (typeof name !== "string" || typeof description !== "string") {
    throw new ApiError(400, "Name and Description must be in String");
  }

  const newPlaylist = await handleCreatePlaylist(name, description, userId);

  if (!newPlaylist) {
    throw new ApiError(400, "Playlist creation failed...");
  }

  return res.status(201).json(new ApiResponse(200, newPlaylist, "Playlist created Successfully..."));
});

const getUserPlaylists = expressAsyncHandler(async (req, res) => {
  //TODO: get user playlists
  const { userId } = req.params;
  const { page = 1, limit = 10, sortType = -1 } = req.query;

  if (!isValidObjectId(userId)) {
    throw new ApiError(400, "User does'nt exist...");
  }

  const aggregatePlaylists = await handleUserPlaylist(userId, page, limit, sortType);

  if (!aggregatePlaylists || aggregatePlaylists.length <= 0) {
    throw new ApiError(400, "User does'nt have any playlist");
  }

  return res.status(200).json(new ApiResponse(200, aggregatePlaylists, "Users all playlists"));
});

const getPlaylistById = expressAsyncHandler(async (req, res) => {
  //TODO: get playlist by id
  const { playlistId } = req.params;

  if (!isValidObjectId(playlistId)) {
    throw new ApiError(400, "Playlist Id isn't Valid");
  }

  const playlist = await handleGetPlaylistById(playlistId);

  if (!playlist) {
    throw new ApiError(404, "Playlist does'nt exists");
  }

  return res.status(200).json(new ApiResponse(200, playlist, "Successfully fetched playlist"));
});

const addVideoToPlaylist = expressAsyncHandler(async (req, res) => {
  const { playlistId, videoId } = req.params;

  if (!isValidObjectId(playlistId)) {
    throw new ApiError(400, "Playlist ID isn't Valid");
  }

  if (!isValidObjectId(videoId)) {
    throw new ApiError(400, "Video ID isn't Valid");
  }

  const addVideoToPlaylist = await handleAddVideoToPlaylist(videoId, playlistId);

  if (!addVideoToPlaylist) {
    throw new ApiError(400, "Video Add in Playlist Failed...");
  }

  return res.status(200).json(new ApiResponse(200, addVideoToPlaylist, "Video Added Successfull"));
});

const removeVideoFromPlaylist = expressAsyncHandler(async (req, res) => {
  // TODO: remove video from playlist
  const { playlistId, videoId } = req.params;

  if (!isValidObjectId(playlistId)) {
    throw new ApiError(400, "Playlist Id isn't Valid");
  }
  if (!isValidObjectId(videoId)) {
    throw new ApiError(400, "Video Id isn't Valid");
  }

  const removedVideoFromPlayList = await handleRemoveVideoFromPlaylist(playlistId, videoId);

  if (!removeVideoFromPlaylist) {
    throw new ApiError(404, "Video Not Found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, removedVideoFromPlayList, "Video Removed from playlist successfully..."));
});

const deletePlaylist = expressAsyncHandler(async (req, res) => {
  // TODO: delete playlist
  const { playlistId } = req.params;

  if (!isValidObjectId(playlistId)) {
    throw new ApiError(400, "Playlist Id isn't Valid...");
  }

  const deletedPlaylistId = await handleDeletePlaylist(playlistId);

  if (!deletedPlaylistId) {
    throw new ApiError("Playlist not found");
  }

  return res.status(200).json(new ApiResponse(200, { deletedPlaylistId }, "Playlist Deleted Successfully..."));
});

const updatePlaylist = expressAsyncHandler(async (req, res) => {
  //TODO: update playlist

  const { playlistId } = req.params;
  const { name, description } = req.body;

  if (!isValidObjectId(playlistId)) {
    throw new ApiError(400, "Playlist ID isn't Valid...");
  }

  if (!name.trim() || !description.trim()) {
    throw new ApiError(400, "Name and Description is required...");
  }

  const updatePlaylist = await handleUpdatePlaylist(playlistId, name, description);

  if (!updatePlaylist) {
    throw new ApiError(400, "Playlist updation Failed...");
  }

  return res.status(200).json(new ApiResponse(200, updatePlaylist, "Playlist updated Successfully..."));
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
