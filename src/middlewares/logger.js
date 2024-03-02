import fsPromise from "fs/promises";
import fs from "fs";
import path from "node:path";
import dateTime from "date-and-time";
import { v4 as uuid } from "uuid";

const logEvents = async (filename, message) => {
  const time = `${dateTime.format(new Date(), "ddd, DD-MMM-YYYY hh:mm A")}`;
  const logItem = `${time} \t ${uuid()} \t ${message} \n`;

  try {
    if (!fs.existsSync(path.resolve("src", "logs"))) {
      await fsPromise.mkdir(path.resolve("src", "logs"));
    }
    await fsPromise.appendFile(path.resolve("src", "logs", filename), logItem);
  } catch (err) {
    console.log(err);
  }
};

const logger = (req, res, next) => {
  logEvents("reqLogs.log", `${req.method} \t ${res.statusCode} \t ${req.url} \t ${req.hostname}`);
  next();
};

export { logEvents, logger };
