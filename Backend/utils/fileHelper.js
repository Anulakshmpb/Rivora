const fs = require('fs');
const path = require('path');
const logger = require('./logger');

/**
 * Safely deletes a local file given its URL path (e.g. "/uploads/filename.ext")
 * @param {string} fileUrl - The relative or absolute URL path of the file
 */
const deleteLocalFile = (fileUrl) => {
  if (!fileUrl || typeof fileUrl !== 'string') return;

  // We expect URLs to be like "/uploads/filename.ext" or "http://domain/uploads/filename.ext"
  if (fileUrl.includes('/uploads/')) {
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
