import cloudinary from "@/lib/cloudinary";

/**
 * Upload image to Cloudinary
 * @param {string} base64Image - Base64 encoded image string
 * @param {string} folder - Cloudinary folder name
 * @returns {Object} - Contains public_id and url
 */
export const uploadImage = async (base64Image, folder = "ecommerce") => {
  try {
    const result = await cloudinary.uploader.upload(base64Image, {
      folder,
      resource_type: "auto",
      transformation: [
        { width: 1000, crop: "limit" },
        { quality: "auto:good" },
      ],
    });

    return {
      public_id: result.public_id,
      url: result.secure_url,
    };
  } catch (error) {
    console.error("Cloudinary upload error:", error);
    throw new Error("Image upload failed");
  }
};

/**
 * Delete image from Cloudinary
 * @param {string} publicId - Cloudinary public_id
 */
export const deleteImage = async (publicId) => {
  try {
    await cloudinary.uploader.destroy(publicId);
  } catch (error) {
    console.error("Cloudinary delete error:", error);
    throw new Error("Image deletion failed");
  }
};

/**
 * Upload multiple images to Cloudinary
 * @param {Array} images - Array of base64 encoded images
 * @param {string} folder - Cloudinary folder name
 * @returns {Array} - Array of objects containing public_id and url
 */
export const uploadMultipleImages = async (images, folder = "ecommerce") => {
  try {
    const uploadPromises = images.map((image) => uploadImage(image, folder));
    return await Promise.all(uploadPromises);
  } catch (error) {
    console.error("Multiple images upload error:", error);
    throw new Error("Multiple images upload failed");
  }
};

/**
 * Delete multiple images from Cloudinary
 * @param {Array} publicIds - Array of Cloudinary public_ids
 */
export const deleteMultipleImages = async (publicIds) => {
  try {
    const deletePromises = publicIds.map((publicId) => deleteImage(publicId));
    await Promise.all(deletePromises);
  } catch (error) {
    console.error("Multiple images delete error:", error);
    throw new Error("Multiple images deletion failed");
  }
};
