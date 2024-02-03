import { ApiError } from "../utils/ApiError.js";
import { httpStatusCode } from "../utils/httpStatus.js";
import { APP_NODE_ENV } from "../config/index.js";

const castErrorHandler = (error) => {
  const msg = `Invalid Value ${error.value}: field ${error.path}`;
  return new ApiError(httpStatusCode.BAD_REQUEST, msg);
};

const duplicateKeyErrorHandler = (err) => {
  const msg = `There is already a movie with name ${err.keyValue.name}. Please use another name.`;
  return new ApiError(httpStatusCode.BAD_REQUEST, msg);
};

const devError = (res, error) => {
  return res.status(error.statusCode).json({
    status: error.status,
    statusCode: error.statusCode,
    message: error.message,
    isOperational: error.isOperational,
    stack: error.stack,
    error: error,
  });
};

const prodError = (res, error) => {
  if (error.isOperational) {
    return res.status(error.statusCode).json({
      statusCode: error.statusCode,
      message: error.message,
    });
  } else {
    return res.status(httpStatusCode.INTERNAL_SERVER_ERROR).json({
      status: "Error",
      message: "Something Went Wrong Please try again later..",
    });
  }
};

const errorHandler = (error, req, res, next) => {
  error.statusCode = error.statusCode || 500;
  error.message = error.message || "Something Went Wrong";
  error.status = error.status;
  error.isOperational = error.isOperational;
  error.stack = error.stack;

  if (APP_NODE_ENV === "development") {
    devError(res, error);
  } else if (APP_NODE_ENV === "production") {
    if (error.name === "CastError") error = castErrorHandler(error);
    if (error.code === 11000) error = duplicateKeyErrorHandler(error);
  }

  prodError(res, error);
};

export { errorHandler };
