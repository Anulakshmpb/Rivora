const s3Service = require('../Services/s3Service');
const fs = require('fs');
const logger = require('../utils/logger');

/**
 * Middleware factory to upload files to a specific S3 folder
 * @param {string} folder - Destination folder in S3 (e.g. 'products', 'banners', 'reviews')
 */
const s3Upload = (folder) => {
  return async (req, res, next) => {
    // Check if multer has uploaded files
    if (!req.file && (!req.files || req.files.length === 0)) {
      return next();
    }

    const localFilesToDelete = [];

    try {
      // 1. Handle single file upload
      if (req.file) {
        localFilesToDelete.push(req.file.path);
        const s3Url = await s3Service.uploadImage(req.file, folder);
        req.file.s3Url = s3Url; // Attach S3 URL to file object
      }

      // 2. Handle multiple files upload
      if (req.files && req.files.length > 0) {
        for (const file of req.files) {
          localFilesToDelete.push(file.path);
          const s3Url = await s3Service.uploadImage(file, folder);
          file.s3Url = s3Url; // Attach S3 URL to file object
        }
      }

      // 3. Clean up local files after successful upload
      cleanupLocalFiles(localFilesToDelete);
      next();
    } catch (error) {
      // Clean up local files on failure
      cleanupLocalFiles(localFilesToDelete);
      logger.error(`S3 upload middleware error for folder "${folder}":`, error);
      
      // Clean up error message for frontend readability
      return res.status(400).json({
        success: false,
        message: error.message || 'Image upload failed'
      });
    }
  };
};

/**
 * Safely deletes local files from disk
 * @param {string[]} paths - Array of file paths to delete
 */
function cleanupLocalFiles(paths) {
  paths.forEach((filePath) => {
    if (filePath && fs.existsSync(filePath)) {
      try {
        fs.unlinkSync(filePath);
        logger.debug(`Cleaned up local temp file: ${filePath}`);
      } catch (err) {
        logger.error(`Failed to delete local temp file ${filePath}:`, err);
      }
    }
  });
}

module.exports = s3Upload;
