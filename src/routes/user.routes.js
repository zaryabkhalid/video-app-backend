import { Router } from "express";
import {
  changeCurrentPassword,
  getCurrentUser,
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
 * * POST
 * * @route /register
 */

router.route("/register").post(
  upload.fields([
    { name: "avatar", maxCount: 1 },
    { name: "coverImage", maxCount: 1 },
  ]),
  registerUser
);

/**
 * * POST
 * * @route /login
 */

router.route("/login").post(loginUser);

// !Secure Routes
/**
 * * POST
 * * @route /logout
 */
router.route("/logout").post(verifyJwt, logoutUser);

/**
 * * POST
 * * @route /refresh-token
 */

router.route("/refresh-token").post(refreshAccessToken);

/**
 * * POST
 * * @route /change-password
 */

router.route("/change-password").post(verifyJwt, changeCurrentPassword);

/**
 * * GET
 * * @route /get-current-user
 */

router.route("/current-user").get(verifyJwt, getCurrentUser);

/**
 * * PATCH
 * * @route /update-user-details
 */

router.route("/update-user-details").patch(verifyJwt, updateUserDetails);

/**
 * * PATCH
 * * @route /update-user-avatar
 */

router
  .route("/update-user-avatar")
  .patch(upload.single("avatar"), verifyJwt, updateUserAvatar);

/**
 * * PATCH
 * * @route /update-user-coverImage
 */

router
  .route("/update-user-coverImage")
  .patch(upload.single("coverImage"), verifyJwt, updateUserCoverImage);

export default router;
