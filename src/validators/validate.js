import { validationResult } from "express-validator";
import { ApiError } from "../utils/ApiError.js";
import { httpStatusCode } from "../utils/httpStatus.js";

export const validate = (req, res, next) => {
  const errors = validationResult(req);

  if (errors.isEmpty()) {
    return next();
  }

  const extractedError = [];

  errors.array().map((error) => {
    return extractedError.push({ [error.path]: error.msg });
  });

  throw new ApiError(httpStatusCode.UNPROCESSABLE_ENTITY, "Recieved Data is not Valid", extractedError);
};
