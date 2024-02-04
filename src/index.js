import { APP_PORT } from "./config/index.js";
import connectDB from "./db/index.js";
import { httpServer } from "./app.js";

let server;

const startServer = () => {
  server = httpServer.listen(APP_PORT || 7000, () => {
    console.log(`\nServer is running at PORT: ${APP_PORT}`);
  });
};

try {
  await connectDB();
  startServer();
} catch (error) {
  console.log(`MongoDB  connect error: ${err.message}`, error);
}

process.on("unhandledRejection", (err) => {
  console.log(`${err.name} :-> ${err.message}`);
  server.close(() => {
    process.exit(1);
  });
});
