import mongoose, { Schema } from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import {
  APP_ACCESS_TOKEN_EXP,
  APP_ACCESS_TOKEN_SECRET,
  APP_REFRESH_TOKEN_EXP,
  APP_REFRESH_TOKEN_SECRET,
} from "../config/index.js";

const userSchema = new Schema(
  {
    username: {
      type: String,
      required: [true, "username is required"],
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },

    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
    },

    fullName: {
      type: String,
      lowercase: true,
      required: [true, "fullName is required"],
      trim: true,
      index: true,
    },

    avatar: {
      type: String, // upload to cloudinary
      required: [true, "Avatar is required"],
    },

    coverImage: {
      type: String,
    },

    watchHistory: [{ type: Schema.Types.ObjectId, ref: "Video" }],

    password: {
      type: String,
      required: [true, "Password is required"],
    },

    refreshTokens: {
      type: [String],
    },
  },
  { timestamps: true }
);

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

userSchema.methods.isPasswordCorrect = async function (password) {
  return await bcrypt.compare(password, this.password);
};

userSchema.methods.generateAccessToken = async function () {
  return jwt.sign(
    {
      _id: this._id,
      email: this.email,
      username: this.username,
      fullname: this.fullName,
    },
    APP_ACCESS_TOKEN_SECRET,
    { expiresIn: parseInt(APP_ACCESS_TOKEN_EXP) }
  );
};

userSchema.methods.generateRefreshToken = async function () {
  return jwt.sign(
    {
      _id: this._id,
    },
    APP_REFRESH_TOKEN_SECRET,
    { expiresIn: APP_REFRESH_TOKEN_EXP }
  );
};

export const User = mongoose.model("User", userSchema);
