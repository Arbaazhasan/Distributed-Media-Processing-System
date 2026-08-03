import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';
dotenv.config();

const isConfigured = Boolean(
  process.env.CLOUDINARY_URL ||
  (process.env.CLOUDINARY_CLOUD_NAME &&
   process.env.CLOUDINARY_API_KEY &&
   process.env.CLOUDINARY_API_SECRET)
);

if (isConfigured) {
  if (!process.env.CLOUDINARY_URL && process.env.CLOUDINARY_CLOUD_NAME) {
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
      secure: true,
    });
  }
}

export const isCloudinaryEnabled = () => isConfigured;

export const uploadToCloudinary = async (filePath, folder = 'media_platform/uploads', resourceType = 'video') => {
  if (!isConfigured) return null;
  try {
    const result = await cloudinary.uploader.upload(filePath, {
      folder,
      resource_type: resourceType,
    });
    return {
      url: result.secure_url,
      publicId: result.public_id,
    };
  } catch (err) {
    console.error('[Cloudinary] Upload failed:', err.message);
    return null;
  }
};

export const deleteFromCloudinary = async (publicId, resourceType = 'video') => {
  if (!isConfigured || !publicId) return;
  try {
    await cloudinary.uploader.destroy(publicId, { resource_type: resourceType });
    console.log(`[Cloudinary] Deleted asset: ${publicId}`);
  } catch (err) {
    console.warn(`[Cloudinary] Delete warning for ${publicId}:`, err.message);
  }
};

export const deleteFolderFromCloudinary = async (folderPath) => {
  if (!isConfigured || !folderPath) return;
  try {
    // 1. Delete all resources under folder path
    await cloudinary.api.delete_resources_by_prefix(folderPath, { resource_type: 'video' });
    await cloudinary.api.delete_resources_by_prefix(folderPath, { resource_type: 'image' });
    await cloudinary.api.delete_resources_by_prefix(folderPath, { resource_type: 'raw' });
    
    // 2. Delete the empty folder itself
    await cloudinary.api.delete_folder(folderPath);
    console.log(`[Cloudinary] Successfully deleted folder: ${folderPath}`);
  } catch (err) {
    console.warn(`[Cloudinary] Folder delete notice for ${folderPath}:`, err.message);
  }
};

export default cloudinary;
