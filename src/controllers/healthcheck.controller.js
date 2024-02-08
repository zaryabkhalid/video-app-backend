import { ApiResponse } from "../utils/ApiResponse.js";
import { expressAsyncHandler } from "../utils/expressAsyncHandler.js";
import { httpStatusCode } from "../utils/httpStatus.js";

const healthCheck = expressAsyncHandler(async (req, res) => {
  const healthStatus = {
    healthStatus: "100%",
    route: `${req.baseUrl}`,
  };

  return res.status(httpStatusCode.OK).json(new ApiResponse(httpStatusCode.OK, healthStatus, "Working Perfectly..."));
});

export { healthCheck };
