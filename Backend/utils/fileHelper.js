const fs = require('fs');
const path = require('path');
const logger = require('./logger');

/**
 * Safely deletes a local file given its URL path (e.g. "/uploads/filename.ext")
 * @param {string} fileUrl - The relative or absolute URL path of the file
 */
const { S3Client, DeleteObjectCommand } = require('@aws-sdk/client-s3');
require('dotenv').config();

const s3Config = new S3Client({
    region: process.env.AWS_REGION,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
    }
});

const deleteLocalFile = async (fileUrl) => {
  if (!fileUrl || typeof fileUrl !== 'string') return;

  if (fileUrl.includes('.amazonaws.com/')) {
    const parts = fileUrl.split('.amazonaws.com/');
    const key = parts[1];
    if (key) {
      try {
        await s3Config.send(new DeleteObjectCommand({
            Bucket: process.env.AWS_BUCKET_NAME,
            Key: key
        }));
        logger.info(`Successfully deleted S3 file: ${key}`);
      } catch (err) {
        logger.error(`Failed to delete S3 file: ${key}`, err);
      }
    }
  } else if (fileUrl.includes('/uploads/')) {
    const parts = fileUrl.split('/uploads/');
    const filename = parts[1];
    
    // Resolve absolute path to the uploads folder in Backend
    const filePath = path.join(__dirname, '..', 'uploads', filename);
    
    if (fs.existsSync(filePath)) {
      try {
        fs.unlinkSync(filePath);
        logger.info(`Successfully deleted local file: ${filePath}`);
      } catch (err) {
        logger.error(`Failed to delete local file: ${filePath}`, err);
      }
    } else {
      logger.warn(`Local file not found for deletion: ${filePath}`);
    }
  }
};

module.exports = {
  deleteLocalFile
};
