import { app } from "./app.js";
import { APP_PORT } from "./config/index.js";
import connectDB from "./db/index.js";

connectDB()
  .then(() => {
    app.listen(APP_PORT || 7000, () => {
      console.log(`Server is running at PORT: ${APP_PORT}`);
    });
  })
  .catch((err) => {
    console.log("MONGO DB connection failed", err);
  });
