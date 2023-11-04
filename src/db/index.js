import mongoose from "mongoose";
import { DB_NAME } from "../contants.js";
import { APP_MONGODB_URI } from "../config/index.js";

const connectDB = async () => {
  try {
    const connectionInstance = await mongoose.connect(
      `${APP_MONGODB_URI}/${DB_NAME}`
    );
    console.log(`\n DATABASE HOST: ${connectionInstance.connection.host}`);
  } catch (error) {
    console.log("MONGODB connection Error", error);
    process.exit(1);
  }
};

mongoose.connection.on("connected", () => {
  console.log("\n CONNECTED TO DATABASE...!");
});

process.on("SIGINT", () => {
  mongoose.connection.close(() => {
    console.log("DATABASE CONNECTION CLOSE WHILE APP IS CLOSED");
    process.exit(0);
  });
});

export default connectDB;
