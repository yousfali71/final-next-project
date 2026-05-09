const cloudinary = require("../config/cloudinary");

// Upload image to Cloudinary
exports.uploadImage = async (fileBuffer, folder = "products") => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: `ecommerce/${folder}`,
        resource_type: "image",
        transformation: [
          { width: 1200, height: 1200, crop: "limit" },
          { quality: "auto" },
          { fetch_format: "auto" },
        ],
      },
      (error, result) => {
        if (error) reject(error);
        else resolve({ public_id: result.public_id, url: result.secure_url });
      },
    );

    uploadStream.end(fileBuffer);
  });
};

// Delete image from Cloudinary
exports.deleteImage = async (publicId) => {
  try {
    await cloudinary.uploader.destroy(publicId);
  } catch (error) {
    console.error("Error deleting image:", error);
  }
};

// Upload multiple images
exports.uploadMultipleImages = async (files, folder = "products") => {
  const uploadPromises = files.map((file) =>
    exports.uploadImage(file.buffer, folder),
  );
  return await Promise.all(uploadPromises);
};
