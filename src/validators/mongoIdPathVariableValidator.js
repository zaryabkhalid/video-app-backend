import { param } from "express-validator";

export const mongoIdParamVariableValidator = (idName) => {
  return [param(idName).notEmpty().isMongoId().withMessage(`Invalid ${idName}`)];
};
