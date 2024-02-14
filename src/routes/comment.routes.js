import { Router } from "express";
import { validate } from "../validators/validate.js";
import { mongoIdParamVariableValidator } from "../validators/mongoIdPathVariableValidator.js";
import { addCommentValidator, updateCommentValidator } from "../validators/commentsValidator.js";
import { verifyJwt } from "../middlewares/auth.middleware.js";
import { getVideoComments, addComment, updateComment, deleteComment } from "../controllers/comment.controller.js";

const router = Router();

router.use(verifyJwt);

router.route("/:videoId").get(mongoIdParamVariableValidator("videoId"), validate, getVideoComments);
router.route("/:videoId").post(mongoIdParamVariableValidator("videoId"), validate, addComment);
router.route("/c/:commentId").patch(mongoIdParamVariableValidator("commentId"), validate, updateComment);
router.route("/c/:commentId").delete(mongoIdParamVariableValidator("commentId"), validate, deleteComment);

export default router;
