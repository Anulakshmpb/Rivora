const multer = require('multer');
const path = require('path');
const fs = require('fs');

const { S3Client } = require('@aws-sdk/client-s3');
const multerS3 = require('multer-s3');
require('dotenv').config();

const s3Config = new S3Client({
    region: process.env.AWS_REGION,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
    }
});

const storage = multerS3({
    s3: s3Config,
    bucket: process.env.AWS_BUCKET_NAME,
    metadata: function (req, file, cb) {
        cb(null, { fieldName: file.fieldname });
    },
    key: function (req, file, cb) {
        cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
    }
});
const fileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
        cb(null, true);
    } else {
        cb(new Error('Only images are allowed!'), false);
    }
};
const upload = multer({
    storage: storage,
    limits: { fileSize: 10000000 },
    fileFilter: function (req, file, cb) {
        checkFileType(file, cb);
    }
});
function checkFileType(file, cb) {
    const filetypes = /jpeg|jpg|png|gif|webp|svg|avif/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);

    if (mimetype && extname) {
        return cb(null, true);
    } else {
        cb(`Error: Images Only! (Mime: ${file.mimetype}, Ext: ${path.extname(file.originalname)})`);
    }
}

module.exports = upload;
