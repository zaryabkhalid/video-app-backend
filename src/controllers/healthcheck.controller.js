import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { expressAsyncHandler } from "../utils/expressAsyncHandler.js";

const healthCheck = expressAsyncHandler(async (req, res) => {
  const healthStatus = {
    healthStatus: "100%",
    route: `${req.baseUrl}`,
  };

  return res.status(200).json(new ApiResponse(200, healthStatus, "Working Perfectly..."));
});

export { healthCheck };
