import { Router } from "express";
import { validate } from "../validators/validate.js";
import { mongoIdParamVariableValidator } from "../validators/mongoIdPathVariableValidator.js";
import { publishVideoValidator, updateVideoValidator } from "../validators/videoValidator.js";

const router = Router();

import {
  getAllVideos,
  getVideoById,
  publishAVideo,
  updateVideo,
  deleteVideo,
  togglePublishStatus,
} from "../controllers/video.controller.js";

import { verifyJwt } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";

router.use(verifyJwt);

router.route("/").get(getAllVideos);

router.route("/").post(
  upload.fields([
    { name: "videoFile", maxCount: 1 },
    { name: "thumbnail", maxCount: 1 },
  ]),
  publishVideoValidator(),
  validate,
  publishAVideo
);

router.route("/:videoId").get(mongoIdParamVariableValidator("videoId"), validate, getVideoById);

router.route("/:videoId").delete(mongoIdParamVariableValidator("videoId"), validate, deleteVideo);

router
  .route("/:videoId")
  .patch(
    upload.single("thumbnail"),
    mongoIdParamVariableValidator("videoId"),
    updateVideoValidator(),
    validate,
    updateVideo
  );

router.route("/toggle/publish/:videoId").patch(mongoIdParamVariableValidator("videoId"), validate, togglePublishStatus);

export default router;
