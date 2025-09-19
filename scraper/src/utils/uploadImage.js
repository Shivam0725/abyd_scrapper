import { v2 as cloudinary } from "cloudinary";
import axios from "axios";
import dotenv from "dotenv";
dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const uploadImage = async (url, publicId) => {
  try {
    const response = await axios.get(url, { responseType: "arraybuffer" });
    const buffer = Buffer.from(response.data, "binary");

    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        { folder: "book-explorer", public_id: publicId, overwrite: true },
        (err, result) => err ? reject(err) : resolve(result.secure_url)
      );
      uploadStream.end(buffer);
    });
  } catch (err) {
    console.error("❌ Cloudinary upload failed:", err.message);
    return url;
  }
};
