import { Router } from "express";
import { verifyJwt } from "../middlewares/auth.middleware.js";
import {
  createPlaylist,
  getUserPlaylists,
  getPlaylistById,
  addVideoToPlaylist,
  updatePlaylist,
  deletePlaylist,
  removeVideoFromPlaylist,
} from "../controllers/playlist.controller.js";

import { createPlaylistValidator, updatePlaylistValidator } from "../validators/playlistValidator.js";
import { validate } from "../validators/validate.js";
import { mongoIdParamVariableValidator } from "../validators/mongoIdPathVariableValidator.js";

const router = Router();

router.use(verifyJwt);

router.route("/").post(createPlaylistValidator(), validate, createPlaylist);
router
  .route("/:playlistId")
  .get(mongoIdParamVariableValidator("playlistId"), validate, getPlaylistById)
  .patch(mongoIdParamVariableValidator("playlistId"), updatePlaylistValidator(), validate, updatePlaylist)
  .delete(deletePlaylist);

router
  .route("/add/:videoId/:playlistId")
  .patch(
    mongoIdParamVariableValidator("videoId"),
    mongoIdParamVariableValidator("playlistId"),
    validate,
    addVideoToPlaylist
  );
router
  .route("/remove/:videoId/:playlistId")
  .patch(
    mongoIdParamVariableValidator("videoId"),
    mongoIdParamVariableValidator("playlistId"),
    validate,
    removeVideoFromPlaylist
  );

router.route("/user/:userId").get(mongoIdParamVariableValidator("userId"), validate, getUserPlaylists);

export default router;
