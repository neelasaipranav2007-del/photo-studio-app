const express = require('express');
const router = express.Router();
const { 
  getGallery, 
  addGalleryImage, 
  updateGalleryImage,
  reorderGalleryImages,
  deleteGalleryImage 
} = require('../controllers/galleryController');
const { protect, admin } = require('../middlewares/authMiddleware');

router.route('/')
  .get(getGallery)
  .post(protect, admin, addGalleryImage);

router.route('/reorder')
  .put(protect, admin, reorderGalleryImages);

router.route('/:id')
  .put(protect, admin, updateGalleryImage)
  .delete(protect, admin, deleteGalleryImage);

module.exports = router;
