const express = require('express');
const router = express.Router();
const upload = require('../middlewares/uploadMiddleware');
const cloudinary = require('../config/cloudinary');
const { protect, admin } = require('../middlewares/authMiddleware');
const fs = require('fs');

router.post('/', protect, admin, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No image uploaded' });
    }

    // Check if Cloudinary is configured with real credentials or fallback is required
    const isCloudinaryMock = !process.env.CLOUDINARY_CLOUD_NAME || 
                             process.env.CLOUDINARY_CLOUD_NAME.includes('mock') || 
                             !process.env.CLOUDINARY_API_KEY || 
                             process.env.CLOUDINARY_API_KEY.includes('mock');

    if (isCloudinaryMock) {
      const host = req.get('host');
      const protocol = req.protocol;
      const fileUrl = `${protocol}://${host}/uploads/${req.file.filename}`;
      
      console.log(`☁️ [Local Upload Fallback] Cloudinary is mock/unconfigured. Saved to uploads/ and returning URL: ${fileUrl}`);
      
      return res.json({
        url: fileUrl,
        public_id: req.file.filename,
      });
    }

    // If Cloudinary is configured, upload to Cloudinary
    try {
      const result = await cloudinary.uploader.upload(req.file.path, {
        folder: 'jonathanportfolio',
      });

      // Remove file from local storage after upload
      fs.unlinkSync(req.file.path);

      res.json({
        url: result.secure_url,
        public_id: result.public_id,
      });
    } catch (cloudinaryError) {
      console.error('Cloudinary Upload Failed, falling back to local storage:', cloudinaryError.message);
      const host = req.get('host');
      const protocol = req.protocol;
      const fileUrl = `${protocol}://${host}/uploads/${req.file.filename}`;
      
      res.json({
        url: fileUrl,
        public_id: req.file.filename,
      });
    }
  } catch (error) {
    console.error('IMAGE UPLOAD ERROR:', error);
    res.status(500).json({ message: 'Image upload failed', error: error.message });
  }
});

module.exports = router;
