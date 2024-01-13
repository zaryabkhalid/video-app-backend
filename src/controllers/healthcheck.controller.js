import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { expressAsyncHandler } from "../utils/expressAsyncHandler.js";

const healthCheck = expressAsyncHandler(async (req, res) => {});

export { healthCheck };
