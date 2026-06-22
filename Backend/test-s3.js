const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
require('dotenv').config();

const s3Config = new S3Client({
    region: process.env.AWS_REGION,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
    }
});

async function testS3() {
    try {
        const command = new PutObjectCommand({
            Bucket: process.env.AWS_BUCKET_NAME,
            Key: 'test-upload.txt',
            Body: 'Hello from Node.js!'
        });
        const response = await s3Config.send(command);
        console.log('Successfully uploaded test file to S3!', response);
    } catch (err) {
        console.error('Failed to upload test file to S3:', err);
    }
}

testS3();
