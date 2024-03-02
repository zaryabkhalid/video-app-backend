import { createServer } from "http";
import Swagger from "./swagger.js";
import express from "express";
import { logger } from "./middlewares/logger.js";
import cors from "cors";
import cookieParser from "cookie-parser";
import compression from "express-compression";
import requestIp from "request-ip";
import { limiter } from "./middlewares/rateLimiter.middleware.js";
// importing error Middleware
import { errorHandler } from "./middlewares/error.middleware.js";

const app = express();
const httpServer = createServer(app);

Swagger(app);

app.use(cors());

app.use(limiter);
app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(compression());
app.use(requestIp.mw());
app.use(express.static("public"));
app.use(cookieParser());
app.use(logger);

// import routes
import userRouter from "./routes/user.routes.js";
import commentRouter from "./routes/comment.routes.js";
import dashboardRouter from "./routes/dashboard.routes.js";
import videoRouter from "./routes/video.routes.js";
import healthCheckRouter from "./routes/healthcheck.routes.js";
import likeRouter from "./routes/like.routes.js";
import playlistRouter from "./routes/playlist.routes.js";
import subscriptionRouter from "./routes/subscription.routes.js";
import tweetRouter from "./routes/tweet.routes.js";
import { ApiError } from "./utils/ApiError.js";
import { httpStatusCode } from "./utils/httpStatus.js";

// routes declaration
app.use("/api/v1/users", userRouter);
app.use("/api/v1/comments", commentRouter);
app.use("/api/v1/dashboard", dashboardRouter);
app.use("/api/v1/video", videoRouter);
app.use("/api/v1/healthcheck", healthCheckRouter);
app.use("/api/v1/likes", likeRouter);
app.use("/api/v1/playlist", playlistRouter);
app.use("/api/v1/subscriptions", subscriptionRouter);
app.use("/api/v1/tweets", tweetRouter);

app.all("*", (req, res, next) => {
  next(new ApiError(httpStatusCode.NOT_FOUND, `Invalid Url ${req.originalUrl}`));
});

app.use(errorHandler);

export { httpServer };
