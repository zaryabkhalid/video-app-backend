import { body } from "express-validator";

const publishVideoValidator = () => {
  return [
    body("title")
      .trim()
      .notEmpty()
      .withMessage("Name can't be empty")
      .isString()
      .withMessage("Name must be valid string"),
    body("description").trim().notEmpty().withMessage("Description is required").isString(),
  ];
};

const updateVideoValidator = () => {
  return [
    body("title")
      .trim()
      .notEmpty()
      .withMessage("Name can't be empty")
      .isString()
      .withMessage("Name must be valid string"),
    body("description").trim().notEmpty().withMessage("Description is required").isString(),
  ];
};

export { publishVideoValidator, updateVideoValidator };
