const express = require('express');
const router = express.Router();
const multer = require('multer');
const AWS = require('aws-sdk');
const { protect } = require('../middleware/auth');
const path = require('path');
const fs = require('fs');

// Configure AWS
AWS.config.update({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION || 'us-east-1'
});

const s3 = new AWS.S3();

// Multer config for memory storage (for S3)
const storage = multer.memoryStorage();

// Multer config for disk storage (for local fallback)
const diskStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        const type = file.mimetype.startsWith('video') ? 'videos' : 'images';
        const dir = path.join(__dirname, '../public/uploads', type);
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
        cb(null, dir);
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}_${file.originalname}`);
    }
});

const upload = multer({
    storage: process.env.AWS_ACCESS_KEY_ID ? storage : diskStorage,
    limits: {
        fileSize: 50 * 1024 * 1024, // 50MB limit
    },
    fileFilter: (req, file, cb) => {
        const filetypes = /jpeg|jpg|png|gif|webp|mp4|mov|avi/;
        const mimetype = filetypes.test(file.mimetype);
        const extname = filetypes.test(path.extname(file.originalname).toLowerCase());

        if (mimetype && extname) {
            return cb(null, true);
        }
        cb(new Error('Only images and videos are allowed'));
    }
});

// Helper to get base URL
const getBaseUrl = (req) => {
    return `${req.protocol}://${req.get('host')}`;
};

// @route   POST /api/uploads/image
// @desc    Upload an image
// @access  Private
router.post('/image', protect, upload.single('image'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, message: 'Please upload a file' });
        }

        // If AWS is configured, upload to S3
        if (process.env.AWS_ACCESS_KEY_ID && process.env.AWS_S3_BUCKET) {
            const fileName = `uploads/images/${Date.now()}_${req.file.originalname}`;

            const params = {
                Bucket: process.env.AWS_S3_BUCKET,
                Key: fileName,
                Body: req.file.buffer,
                ContentType: req.file.mimetype,
                ACL: 'public-read'
            };

            const uploadResult = await s3.upload(params).promise();

            return res.status(200).json({
                success: true,
                url: uploadResult.Location,
                key: uploadResult.Key
            });
        }

        // Otherwise, it went to disk storage
        const type = req.file.mimetype.startsWith('video') ? 'videos' : 'images';
        const url = `${getBaseUrl(req)}/public/uploads/${type}/${req.file.filename}`;

        res.status(200).json({
            success: true,
            url: url,
            filename: req.file.filename
        });
    } catch (error) {
        console.error('Upload Error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to upload image',
            error: error.message
        });
    }
});

// @route   POST /api/uploads/video
// @desc    Upload a video
// @access  Private
router.post('/video', protect, upload.single('video'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, message: 'Please upload a file' });
        }

        // If AWS is configured, upload to S3
        if (process.env.AWS_ACCESS_KEY_ID && process.env.AWS_S3_BUCKET) {
            const fileName = `uploads/videos/${Date.now()}_${req.file.originalname}`;

            const params = {
                Bucket: process.env.AWS_S3_BUCKET,
                Key: fileName,
                Body: req.file.buffer,
                ContentType: req.file.mimetype,
                ACL: 'public-read'
            };

            const uploadResult = await s3.upload(params).promise();

            return res.status(200).json({
                success: true,
                url: uploadResult.Location,
                key: uploadResult.Key
            });
        }

        const type = 'videos';
        const url = `${getBaseUrl(req)}/public/uploads/${type}/${req.file.filename}`;

        res.status(200).json({
            success: true,
            url: url,
            filename: req.file.filename
        });
    } catch (error) {
        console.error('Upload Error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to upload video',
            error: error.message
        });
    }
});

module.exports = router;
