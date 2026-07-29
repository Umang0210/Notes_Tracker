const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please add a category name'],
      trim: true,
      maxlength: [30, 'Category name cannot exceed 30 characters']
    },
    color: {
      type: String,
      default: '#3b82f6' // Default theme color
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Category must belong to a user']
    }
  },
  {
    timestamps: true
  }
);

// Ensure a user cannot have duplicate category names
categorySchema.index({ name: 1, user: 1 }, { unique: true });

module.exports = mongoose.model('Category', categorySchema);
