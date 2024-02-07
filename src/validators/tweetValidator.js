import { body } from "express-validator";

const createTweetValidator = () => {
  return [
    body("title").trim().notEmpty().withMessage("Title is required").isString().withMessage("Title can only be string"),
    body("content")
      .trim()
      .notEmpty()
      .withMessage("Content is required")
      .isString()
      .withMessage("Content must be string"),
  ];
};

const updateTweetValidator = () => {
  return [
    body("title").trim().notEmpty().withMessage("Title is required").isString().withMessage("Title can only be string"),
    body("content")
      .trim()
      .notEmpty()
      .withMessage("Content is required")
      .isString()
      .withMessage("Content must be string"),
  ];
};

export { createTweetValidator, updateTweetValidator };
