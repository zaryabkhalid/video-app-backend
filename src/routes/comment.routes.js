import { Router } from "express";
import {
  getVideoComments,
  addComment,
  updateComment,
  deleteComment,
} from "../controllers/comment.controller.js";

import { verifyJwt } from "../middlewares/auth.middleware.js";

const router = Router();

router.use(verifyJwt);

router.route("/:videoId").get(getVideoComments);
router.route("/:videoId").post(addComment);
router.route("/c/:commentId").patch(updateComment);
router.route("/c/:commentId").delete(deleteComment);

export default router;
