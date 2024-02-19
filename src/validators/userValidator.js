import { body, param } from "express-validator";

const userRegisterationValidator = () => {
  return [
    body("username")
      .trim()
      .notEmpty()
      .withMessage("Username is required")
      .isLowercase()
      .withMessage("Username must be in lowercase")
      .isLength({ min: 3 })
      .withMessage("Username must be atleast 3 characters long"),
    body("email").trim().notEmpty().withMessage("Email is required").isEmail().withMessage("Email is invalid"),
    body("fullName")
      .trim()
      .notEmpty()
      .withMessage("Fullname is required")
      .isLowercase()
      .withMessage("Fullname must be in lowercase")
      .isLength({ min: 3 })
      .withMessage("Fullname must be atleast 3 characters long"),
    body("password")
      .trim()
      .notEmpty()
      .withMessage("Password is required")
      .isStrongPassword({
        minLength: 8,
        minLowercase: 1,
        minUppercase: 1,
        minNumbers: 1,
        minSymbols: 1,
      })
      .withMessage(
        "Password must be greater than 8 and contain at least one uppercase letter, one lowercase letter, and one number"
      ),
  ];
};

const userLoginValidator = () => {
  return [
    body("username").optional(),
    body("email").optional().isEmail().withMessage("Email is Invalid"),
    body("password").notEmpty().withMessage("Password is required"),
  ];
};

const changeCurrentUserPasswordValidator = () => {
  return [
    body("oldPassword").notEmpty().withMessage("Old Password is required"),
    body("newPassword").notEmpty().withMessage("New Password is required"),
  ];
};

const updateUserDetailValidator = () => {
  return [
    body("fullName").notEmpty().withMessage("FullName is required."),
    body("username").notEmpty().withMessage("Username is required."),
    body("email").notEmpty().withMessage("FullName is required.").isEmail().withMessage("Email is Invalid"),
  ];
};

export {
  userRegisterationValidator,
  userLoginValidator,
  updateUserDetailValidator,
  changeCurrentUserPasswordValidator,
};
