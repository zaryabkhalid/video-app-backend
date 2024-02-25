import { rateLimit } from "express-rate-limit";
import { ApiError } from "../utils/ApiError.js";

const limiter = rateLimit({
  windowMs: 1000 * 60, // 1 mint
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req, res) => {
    return req.clientIp;
  },
  handler: (req, __, ___, options) => {
    throw new ApiError(
      options.statusCode || 500,
      `There are too many requests. You only allowed ${options.max} requests per ${options.windowMs / 60000} minutes`
    );
  },
});

export { limiter };
