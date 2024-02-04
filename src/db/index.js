import { APP_NODE_ENV } from "../config/index.js";
import mongoose from "mongoose";
import { DB_NAME } from "../contants.js";
import { APP_MONGODB_URI } from "../config/index.js";

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(`${APP_MONGODB_URI}/${DB_NAME}`);
    if (APP_NODE_ENV === "development") {
      console.log(`\nDATABASE HOST: ${conn.connection.host}`);
    }
  } catch (err) {
    console.log(`MongoDB connection error: ${err.message} error`, err);
    process.exit(1);
  }
};

mongoose.connection.on("connecting", () => {
  console.log("\nConnecting...");
});

mongoose.connection.on("connected", function () {
  console.log("CONNECTED TO DATABASE...!");
});
mongoose.connection.on("disconnecting", function () {
  console.log("Mongoose default connection is disconnecting");
});

process.on("SIGINT", () => {
  mongoose.connection
    .close()
    .then(() => {
      console.log("Mongoose CONNECTION CLOSE DUE TO APP TERMINATION...");
      process.exit(0);
    })
    .catch((error) => {
      console.log("Error closing Mongoose CONNECTION", error);
      process.exit(1);
    });
});

export default connectDB;
