import dotenv from "dotenv";

dotenv.config();

export const {
  APP_PORT,
  APP_MONGODB_URI,
  APP_ACCESS_TOKEN_SECRET,
  APP_ACCESS_TOKEN_EXP,
  APP_REFRESH_TOKEN_SECRET,
  APP_REFRESH_TOKEN_EXP,
} = process.env;
