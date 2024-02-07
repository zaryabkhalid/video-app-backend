import { ApiError } from "../utils/ApiError.js";
import { APP_NODE_ENV } from "../config/index.js";
import mongoose from "mongoose";

const errorHandler = (err, req, res, next) => {
  let error = err;

  // checking if error is not an instance of our ApiError Class then either its a mongoose error(400) or a server error(500).
  if (!(error instanceof ApiError)) {
    const statusCode = error.statusCode || error instanceof mongoose.Error ? 400 : 500;

    const message = error.message || "Something Went wrong";

    error = new ApiError(statusCode, message, error?.errors || [], err.stack);
  }

  const response = {
    ...error,
    message: error.message,
    ...(APP_NODE_ENV === "development" ? { stack: error.stack } : {}),
  };

  return res.status(error.statusCode).json(response);
};

export { errorHandler };
