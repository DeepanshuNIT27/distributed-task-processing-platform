import { v2 as cloudinary } from "cloudinary";

const configureCloudinary = () => {
  const missing = [
    "CLOUDINARY_CLOUD_NAME",
    "CLOUDINARY_API_KEY",
    "CLOUDINARY_API_SECRET",
  ].filter((key) => !process.env[key]);

  if (missing.length > 0) {
    throw new Error(`Missing Cloudinary configuration: ${missing.join(", ")}`);
  }

  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true,
  });
};

export const assertCloudinaryConfigured = configureCloudinary;

export const uploadImageBuffer = (buffer, options = {}) => {
  configureCloudinary();

  // 🔥 DEBUG LOG 1: Check what keys Render is actually seeing
  // Double quotes ("") ke andar print hoga taaki hidden spaces pakde ja sakein
  const config = cloudinary.config();
  console.log("🔍 CLOUDINARY CONFIG CHECK:");
  console.log(
    "Cloud Name:",
    config.cloud_name ? `"${config.cloud_name}"` : "MISSING",
  );
  console.log("API Key:", config.api_key ? `"${config.api_key}"` : "MISSING");
  console.log(
    "API Secret exists:",
    !!config.api_secret,
    "Length:",
    config.api_secret ? config.api_secret.length : 0,
  );

  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        resource_type: "image",
        overwrite: false,
        ...options,
      },
      (error, result) => {
        if (error) {
          // 🔥 DEBUG LOG 2: Exact error details from Cloudinary API
          console.error(
            "❌ CLOUDINARY UPLOAD ERROR:",
            JSON.stringify(error, null, 2),
          );
          return reject(error);
        }
        resolve(result);
      },
    );

    uploadStream.end(buffer);
  });
};

export const deleteCloudinaryImage = async (publicId) => {
  if (!publicId) return;
  configureCloudinary();
  await cloudinary.uploader.destroy(publicId, {
    resource_type: "image",
    invalidate: true,
  });
};
