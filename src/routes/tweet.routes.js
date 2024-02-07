import { Router } from "express";
import { createTweet, deleteTweet, getUserTweets, updateTweet } from "../controllers/tweet.controller.js";
import { verifyJwt } from "../middlewares/auth.middleware.js";
import { validate } from "../validators/validate.js";
import { createTweetValidator, updateTweetValidator } from "../validators/tweetValidator.js";
import { mongoIdParamVariableValidator } from "../validators/mongoIdPathVariableValidator.js";

const router = Router();
router.use(verifyJwt); // Apply verifyJWT middleware to all routes in this file

router.route("/").post(createTweetValidator(), validate, createTweet);
router.route("/user/:userId").get(mongoIdParamVariableValidator("userId"), getUserTweets);
router
  .route("/:tweetId")
  .patch(mongoIdParamVariableValidator("tweetId"), updateTweetValidator, validate, updateTweet)
  .delete(mongoIdParamVariableValidator("tweetId"), validate, deleteTweet);

export default router;
