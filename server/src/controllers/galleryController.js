const Gallery = require('../models/Gallery');
const Category = require('../models/Category');

// @desc    Get all gallery images
// @route   GET /api/gallery
// @access  Public
const getGallery = async (req, res) => {
  try {
    const gallery = await Gallery.find({}).populate('category').sort({ order: 1, createdAt: -1 });
    res.json(gallery);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Add a gallery image
// @route   POST /api/gallery
// @access  Private/Admin
const addGalleryImage = async (req, res) => {
  try {
    const { title, imageUrl, publicId, categoryId, isFeatured, order } = req.body;
    
    // If order is not specified, assign next high order value
    let orderVal = order;
    if (orderVal === undefined) {
      const highest = await Gallery.findOne({ category: categoryId }).sort({ order: -1 });
      orderVal = highest ? highest.order + 1 : 0;
    }

    const image = new Gallery({ 
      title, 
      imageUrl, 
      publicId, 
      category: categoryId, 
      isFeatured,
      order: orderVal
    });
    
    const createdImage = await image.save();
    const populatedImage = await createdImage.populate('category');
    res.status(201).json(populatedImage);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Update a gallery image details
// @route   PUT /api/gallery/:id
// @access  Private/Admin
const updateGalleryImage = async (req, res) => {
  try {
    const { title, categoryId, isFeatured, order } = req.body;
    const image = await Gallery.findById(req.params.id);

    if (image) {
      image.title = title !== undefined ? title : image.title;
      image.category = categoryId !== undefined ? categoryId : image.category;
      image.isFeatured = isFeatured !== undefined ? isFeatured : image.isFeatured;
      image.order = order !== undefined ? order : image.order;

      const updatedImage = await image.save();
      const populatedImage = await updatedImage.populate('category');
      res.json(populatedImage);
    } else {
      res.status(404).json({ message: 'Image not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Reorder gallery images
// @route   PUT /api/gallery/reorder
// @access  Private/Admin
const reorderGalleryImages = async (req, res) => {
  try {
    const { images } = req.body; // Array of { id, order }
    if (!images || !Array.isArray(images)) {
      return res.status(400).json({ message: 'Invalid payload' });
    }

    const bulkOps = images.map(img => ({
      updateOne: {
        filter: { _id: img.id },
        update: { $set: { order: img.order } }
      }
    }));

    await Gallery.bulkWrite(bulkOps);
    res.json({ message: 'Gallery order updated' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Delete a gallery image
// @route   DELETE /api/gallery/:id
// @access  Private/Admin
const deleteGalleryImage = async (req, res) => {
  try {
    const image = await Gallery.findById(req.params.id);
    if (image) {
      await Gallery.deleteOne({ _id: image._id });
      res.json({ message: 'Image removed' });
    } else {
      res.status(404).json({ message: 'Image not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { 
  getGallery, 
  addGalleryImage, 
  updateGalleryImage,
  reorderGalleryImages,
  deleteGalleryImage 
};
