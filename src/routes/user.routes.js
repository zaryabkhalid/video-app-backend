import { Router } from "express";
import {
  changeCurrentUserPassword,
  getCurrentUser,
  getUserChannelProfile,
  getWatchHistory,
  loginUser,
  logoutUser,
  refreshAccessToken,
  registerUser,
  updateUserAvatar,
  updateUserCoverImage,
  updateUserDetails,
} from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJwt } from "../middlewares/auth.middleware.js";

const router = Router();

/**
 * @method POST
 * @route /register
 */

router.route("/register").post(
  upload.fields([
    { name: "avatar", maxCount: 1 },
    { name: "coverImage", maxCount: 1 },
  ]),
  registerUser
);

/**
 * @method POST
 * @route /login
 */

router.route("/login").post(loginUser);

// !Secure Routes
/**
 * @method POST
 * @route /logout
 */
router.route("/logout").post(verifyJwt, logoutUser);

/**
 * @method POST
 * @route /refresh-token
 */

router.route("/refresh-token").post(refreshAccessToken);

/**
 * @method POST
 * @route /change-password
 */

router.route("/change-password").post(verifyJwt, changeCurrentUserPassword);

/**
 * @method GET
 * @route /get-current-user
 */

router.route("/current-user").get(verifyJwt, getCurrentUser);

/**
 * @method PATCH
 * @route /update-user-details
 */

router.route("/update-user-details").patch(verifyJwt, updateUserDetails);

/**
 * @method PATCH
 * @route /update-user-avatar
 */

router.route("/update-user-avatar").patch(verifyJwt, upload.single("avatar"), updateUserAvatar);

/**
 * @method PATCH
 * @route /update-user-coverImage
 */

router.route("/update-user-coverImage").patch(verifyJwt, upload.single("coverImage"), updateUserCoverImage);

/**
 * @method GET
 * @route /user-channel-profile
 */

router.route("/c/:username").get(verifyJwt, getUserChannelProfile);

/**
 * @method GET
 * @route /user-watchHistory
 */

router.route("/history").get(verifyJwt, getWatchHistory);

export default router;
