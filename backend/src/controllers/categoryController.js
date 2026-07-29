const Category = require('../models/Category');
const Note = require('../models/Note');

// @desc    Get all categories for logged-in user
// @route   GET /api/v1/categories
// @access  Private
exports.getCategories = async (req, res, next) => {
  try {
    const categories = await Category.find({ user: req.user._id }).sort({ name: 1 });

    res.status(200).json({
      success: true,
      message: 'Categories retrieved successfully',
      data: { categories }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new category
// @route   POST /api/v1/categories
// @access  Private
exports.createCategory = async (req, res, next) => {
  try {
    const { name, color } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        message: 'Category name is required'
      });
    }

    // Check if category name exists for this user (case-insensitive)
    const existing = await Category.findOne({
      user: req.user._id,
      name: { $regex: new RegExp(`^${name}$`, 'i') }
    });

    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'A category with this name already exists'
      });
    }

    const category = await Category.create({
      name,
      color,
      user: req.user._id
    });

    res.status(201).json({
      success: true,
      message: 'Category created successfully',
      data: { category }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update category
// @route   PUT /api/v1/categories/:id
// @access  Private
exports.updateCategory = async (req, res, next) => {
  try {
    const { name, color } = req.body;

    let category = await Category.findOne({ _id: req.params.id, user: req.user._id });
    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found or unauthorized'
      });
    }

    if (name) {
      // Check for name uniqueness among other categories of the user
      const existing = await Category.findOne({
        user: req.user._id,
        name: { $regex: new RegExp(`^${name}$`, 'i') },
        _id: { $ne: req.params.id }
      });

      if (existing) {
        return res.status(400).json({
          success: false,
          message: 'A category with this name already exists'
        });
      }
      category.name = name;
    }

    if (color) {
      category.color = color;
    }

    await category.save();

    res.status(200).json({
      success: true,
      message: 'Category updated successfully',
      data: { category }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete category
// @route   DELETE /api/v1/categories/:id
// @access  Private
exports.deleteCategory = async (req, res, next) => {
  try {
    const category = await Category.findOne({ _id: req.params.id, user: req.user._id });
    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found or unauthorized'
      });
    }

    // Unset this category on all notes using it
    await Note.updateMany(
      { category: req.params.id, user: req.user._id },
      { $set: { category: null } }
    );

    // Delete category
    await Category.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Category deleted successfully. All associated notes have been uncategorized.',
      data: {}
    });
  } catch (error) {
    next(error);
  }
};
