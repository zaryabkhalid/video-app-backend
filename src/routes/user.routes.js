import { Router } from "express";
import {
  loginUser,
  logoutUser,
  refreshAccessToken,
  registerUser,
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
export default router;
