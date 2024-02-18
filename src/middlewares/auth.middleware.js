import { APP_ACCESS_TOKEN_SECRET } from "../config/index.js";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { expressAsyncHandler } from "../utils/expressAsyncHandler.js";
import jwt from "jsonwebtoken";
import { httpStatusCode } from "../utils/httpStatus.js";

export const verifyJwt = expressAsyncHandler(async (req, _, next) => {
  let token;
  if (!req.headers.authorization || req.headers.authorization === undefined) {
    return next(new ApiError(httpStatusCode.FORBIDDEN, "Forbidden"));
  }

  if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
    token = req.headers.authorization.split(" ")[1];

    jwt.verify(token, APP_ACCESS_TOKEN_SECRET, async (err, decode) => {
      if (err) {
        return next(new ApiError(httpStatusCode.UNAUTHORIZED, "Unauthorized..."));
      }

      const user = await User.findById(decode?._id).select("-password -refreshToken");

      if (!user) {
        // TODO: NEXT_VIDEO: Discuss about frontend
        throw new ApiError(401, "Invalid Access Token");
      }

      req.user = user;

      next();
    });
  }
});
