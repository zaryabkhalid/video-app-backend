import { v2 as cloudinary } from "cloudinary";
import fs from "fs";
import {
  APP_CLOUDINARY_API_KEY,
  APP_CLOUDINARY_NAME,
  APP_CLOUDINARY_SECRET_KEY,
} from "../config";

cloudinary.config({
  cloud_name: APP_CLOUDINARY_NAME,
  api_key: APP_CLOUDINARY_API_KEY,
  api_secret: APP_CLOUDINARY_SECRET_KEY,
});

const uploadOnCloudinary = async (filePath) => {
  try {
    if (!filePath) return null;
    // upload the file
    const response = await cloudinary.uploader.upload(filePath, {
      resource_type: "auto",
    });
    console.log("File is uploaded on cloudinary");
    console.log(response.url);
    return response;
  } catch (error) {
    fs.unlinkSync(filePath); // remove the locally saved temporary file as the upload got failed
    return null;
  }
};

export { uploadOnCloudinary };
