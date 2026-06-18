const Category = require('../models/Category');
const Gallery = require('../models/Gallery');

// @desc    Get all categories
// @route   GET /api/categories
// @access  Public
const getCategories = async (req, res) => {
  try {
    const categories = await Category.find({});
    res.json(categories);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Create a category
// @route   POST /api/categories
// @access  Private/Admin
const createCategory = async (req, res) => {
  try {
    const { name } = req.body;
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');

    const categoryExists = await Category.findOne({ slug });
    if (categoryExists) {
      return res.status(400).json({ message: 'Category already exists' });
    }

    const category = new Category({ name, slug });
    const createdCategory = await category.save();

    // Automatically seed 4 default high-quality photography images for the new category
    const defaultImages = [
      {
        title: `${name} Showcase 1`,
        imageUrl: 'https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=800&auto=format&fit=crop',
        publicId: `placeholder_unsplash_${Date.now()}_1`,
        category: createdCategory._id,
        isFeatured: false,
        order: 0
      },
      {
        title: `${name} Showcase 2`,
        imageUrl: 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?q=80&w=800&auto=format&fit=crop',
        publicId: `placeholder_unsplash_${Date.now()}_2`,
        category: createdCategory._id,
        isFeatured: false,
        order: 1
      },
      {
        title: `${name} Showcase 3`,
        imageUrl: 'https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?q=80&w=800&auto=format&fit=crop',
        publicId: `placeholder_unsplash_${Date.now()}_3`,
        category: createdCategory._id,
        isFeatured: false,
        order: 2
      },
      {
        title: `${name} Showcase 4`,
        imageUrl: 'https://images.unsplash.com/photo-1519225421980-715cb0215aed?q=80&w=800&auto=format&fit=crop',
        publicId: `placeholder_unsplash_${Date.now()}_4`,
        category: createdCategory._id,
        isFeatured: false,
        order: 3
      }
    ];

    await Gallery.insertMany(defaultImages);

    res.status(201).json(createdCategory);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Update a category
// @route   PUT /api/categories/:id
// @access  Private/Admin
const updateCategory = async (req, res) => {
  try {
    const { name } = req.body;
    const category = await Category.findById(req.params.id);

    if (category) {
      category.name = name;
      category.slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
      const updatedCategory = await category.save();
      res.json(updatedCategory);
    } else {
      res.status(404).json({ message: 'Category not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Delete a category
// @route   DELETE /api/categories/:id
// @access  Private/Admin
const deleteCategory = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    if (category) {
      await Category.deleteOne({ _id: category._id });
      res.json({ message: 'Category removed' });
    } else {
      res.status(404).json({ message: 'Category not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory
};
