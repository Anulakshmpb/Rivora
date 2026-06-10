const { S3Client, PutObjectCommand, DeleteObjectCommand } = require('@aws-sdk/client-s3');
const path = require('path');
const fs = require('fs');
const logger = require('../utils/logger');

const AWS_REGION = process.env.AWS_REGION || '';
const AWS_BUCKET_NAME = process.env.AWS_BUCKET_NAME || '';

const hasS3Config = !!(
  process.env.AWS_ACCESS_KEY_ID &&
  process.env.AWS_SECRET_ACCESS_KEY &&
  AWS_REGION &&
  AWS_BUCKET_NAME
);

let s3Client = null;

if (hasS3Config) {
  s3Client = new S3Client({
    region: AWS_REGION,
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    },
  });
  logger.info('AWS S3 Client initialized successfully');
} else {
  logger.warn('AWS S3 credentials/configuration missing. File uploads to S3 will fail.');
}

class S3Service {
  /**
   * Validates and uploads a file to S3
   * @param {Object} file - Multer file object
   * @param {string} folder - Destination folder in the S3 bucket (e.g. 'products', 'banners')
   * @returns {Promise<string>} - The public URL of the uploaded image
   */
  static async uploadImage(file, folder) {
    if (!hasS3Config) {
      throw new Error('AWS S3 is not configured. Cannot upload image.');
    }

    if (!file) {
      throw new Error('No file provided for upload.');
    }

    // 1. File Validation
    const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp'];
    const maxFileSize = 5 * 1024 * 1024; // 5 MB

    if (!allowedMimeTypes.includes(file.mimetype)) {
      throw new Error('Invalid file type. Only JPG, PNG, and WEBP images are allowed.');
    }

    if (file.size > maxFileSize) {
      throw new Error('File is too large. Maximum size allowed is 5 MB.');
    }

    // 2. Generate Unique File Name
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const ext = path.extname(file.originalname).toLowerCase() || '.jpg';
    const key = `${folder}/${uniqueSuffix}${ext}`;

    // Read file buffer (multer stores path if diskStorage is used)
    let fileBuffer;
    if (file.buffer) {
      fileBuffer = file.buffer;
    } else if (file.path) {
      fileBuffer = fs.readFileSync(file.path);
    } else {
      throw new Error('File content could not be read.');
    }

    // 3. Upload to S3
    const uploadParams = {
      Bucket: AWS_BUCKET_NAME,
      Key: key,
      Body: fileBuffer,
      ContentType: file.mimetype,
    };

    try {
      const command = new PutObjectCommand(uploadParams);
      await s3Client.send(command);

      const s3Url = `https://${AWS_BUCKET_NAME}.s3.${AWS_REGION}.amazonaws.com/${key}`;
      logger.info(`Successfully uploaded image to S3: ${s3Url}`);
      return s3Url;
    } catch (error) {
      logger.error('Failed to upload image to S3:', error);
      throw new Error(`S3 upload failed: ${error.message}`);
    }
  }

  /**
   * Deletes an image from S3 by its key
   * @param {string} key - S3 Key of the object
   * @returns {Promise<boolean>}
   */
  static async deleteImage(key) {
    if (!hasS3Config) {
      logger.warn('AWS S3 is not configured. Skipping delete operation.');
      return false;
    }

    if (!key) {
      logger.warn('No key provided for S3 deletion.');
      return false;
    }

    const deleteParams = {
      Bucket: AWS_BUCKET_NAME,
      Key: key,
    };

    try {
      const command = new DeleteObjectCommand(deleteParams);
      await s3Client.send(command);
      logger.info(`Successfully deleted image from S3 with key: ${key}`);
      return true;
    } catch (error) {
      logger.error(`Failed to delete image with key ${key} from S3:`, error);
      return false;
    }
  }

  /**
   * Helper to extract the S3 Key from an S3 or CloudFront URL
   * @param {string} url - The URL string
   * @returns {string|null} - The S3 key or null if not an S3 URL
   */
  static getS3KeyFromUrl(url) {
    if (!url || typeof url !== 'string') return null;

    // Standard S3 URL: https://bucket-name.s3.region.amazonaws.com/key
    if (url.includes('.amazonaws.com/')) {
      const parts = url.split('.amazonaws.com/');
      return decodeURIComponent(parts[1]);
    }

    // CloudFront / Custom Domain URLs: http://domain.com/key (if not local or uploads)
    if (url.startsWith('http') && !url.includes('localhost') && !url.includes('/uploads/')) {
      try {
        const parsedUrl = new URL(url);
        // Strips leading slash to get key
        return decodeURIComponent(parsedUrl.pathname.substring(1));
      } catch (e) {
        return null;
      }
    }

    return null;
  }
}

module.exports = S3Service;
