const fs = require('fs');
const path = require('path');
const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
require('dotenv').config();

// Configuration
const BUCKET_NAME = 'rivora-frontend-img';
const REGION = process.env.AWS_REGION || 'ap-southeast-2';
const BUILD_DIR = path.join(__dirname, '..', 'Frontend', 'build');

const s3Client = new S3Client({
    region: REGION,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    }
});

const MIME_TYPES = {
    '.html': 'text/html',
    '.css': 'text/css',
    '.js': 'application/javascript',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon',
    '.txt': 'text/plain',
};

function getContentType(filePath) {
    const ext = path.extname(filePath).toLowerCase();
    return MIME_TYPES[ext] || 'application/octet-stream';
}

function getFiles(dir) {
    const files = [];
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory()) {
            files.push(...getFiles(fullPath));
        } else {
            files.push(fullPath);
        }
    }
    return files;
}

async function deploy() {
    console.log(`Starting deployment to S3 bucket: ${BUCKET_NAME} in region ${REGION}...`);
    if (!fs.existsSync(BUILD_DIR)) {
        console.error(`Error: Build directory not found at ${BUILD_DIR}. Please run 'npm run build' in the Frontend directory first.`);
        process.exit(1);
    }

    const files = getFiles(BUILD_DIR);
    console.log(`Found ${files.length} files to upload.`);

    let successCount = 0;
    let failCount = 0;

    for (const filePath of files) {
        const relativePath = path.relative(BUILD_DIR, filePath);
        // Replace backslashes with forward slashes for S3 keys on Windows
        const s3Key = relativePath.replace(/\\/g, '/');
        const contentType = getContentType(filePath);

        try {
            const fileContent = fs.readFileSync(filePath);
            await s3Client.send(new PutObjectCommand({
                Bucket: BUCKET_NAME,
                Key: s3Key,
                Body: fileContent,
                ContentType: contentType,
            }));
            console.log(`Successfully uploaded: ${s3Key} (${contentType})`);
            successCount++;
        } catch (error) {
            console.error(`Failed to upload ${s3Key}:`, error.message);
            failCount++;
        }
    }

    console.log(`\nDeployment summary:`);
    console.log(`- Successfully uploaded: ${successCount} files`);
    console.log(`- Failed: ${failCount} files`);

    if (failCount > 0) {
        console.error('\nDeployment completed with errors.');
        process.exit(1);
    } else {
        console.log('\nDeployment completed successfully! Live URL:');
        console.log(`http://${BUCKET_NAME}.s3-website-${REGION}.amazonaws.com`);
    }
}

deploy().catch(err => {
    console.error('Fatal deployment error:', err);
    process.exit(1);
});
