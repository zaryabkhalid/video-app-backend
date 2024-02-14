import { body } from "express-validator";

const addCommentValidator = () => {
  return [
    body("content")
      .notEmpty()
      .withMessage("Cannot add empty comment")
      .isLength({ max: 200 })
      .withMessage("Max content length is 200 characters")
      .isString()
      .withMessage("Content must be a string"),
  ];
};

const updateCommentValidator = () => {
  return [
    body("content")
      .notEmpty()
      .withMessage("Cannot add empty comment")
      .isLength({ max: 200 })
      .withMessage("Max content length is 200 characters")
      .isString()
      .withMessage("Content must be a string"),
  ];
};

export { addCommentValidator, updateCommentValidator };
