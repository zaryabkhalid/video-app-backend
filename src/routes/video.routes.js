import { Router } from "express";

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
  publishAVideo
);

router.route("/:videoId").get(getVideoById);

router.route("/:videoId").delete(deleteVideo);

router.route("/:videoId").patch(upload.single("thumbnail"), updateVideo);

router.route("/toggle/publish/:videoId").patch(togglePublishStatus);

export default router;
