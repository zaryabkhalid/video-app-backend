import { body, param, query } from "express-validator";

const createPlaylistValidator = () => {
  return [
    body("name")
      .trim()
      .notEmpty()
      .withMessage("Name can't be empty")
      .isString()
      .withMessage("Name must be valid string"),
    body("description").trim().notEmpty().withMessage("Description is required").isString(),
  ];
};

const updatePlaylistValidator = () => {
  return [
    body("name")
      .trim()
      .notEmpty()
      .withMessage("Name field can't be empty")
      .isString()
      .withMessage("Name field must a String"),
    body("description")
      .trim()
      .notEmpty()
      .withMessage("Description field can't be empty")
      .isString()
      .withMessage("Description field must a String"),
  ];
};

export { createPlaylistValidator, updatePlaylistValidator };
