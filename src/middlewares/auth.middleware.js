import { APP_ACCESS_TOKEN_SECRET } from "../config/index.js";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { expressAsyncHandler } from "../utils/expressAsyncHandler.js";
import jwt from "jsonwebtoken";

export const verifyJwt = expressAsyncHandler(async (req, _, next) => {
  try {
    const token = req.cookies?.accessToken || req.header("Authorization")?.split(" ")[1];

    if (!token) {
      throw new ApiError(401, "Unauthorized request");
    }

    const decodedToken = await jwt.verify(token, APP_ACCESS_TOKEN_SECRET);

    const user = await User.findById(decodedToken?._id).select("-password -refreshToken");

    if (!user) {
      // TODO: NEXT_VIDEO: Discuss about frontend
      throw new ApiError(401, "Invalid Access Token");
    }

    req.user = user;

    next();
  } catch (error) {
    throw new ApiError(401, error?.message || "Invalid Access Token");
  }
});
