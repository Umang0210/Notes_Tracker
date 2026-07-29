const mongoose = require('mongoose');

const noteSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Please add a note title'],
      trim: true,
      maxlength: [100, 'Title cannot be more than 100 characters']
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, 'Description cannot be more than 500 characters'],
      default: ''
    },
    content: {
      type: String,
      default: ''
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      default: null
    },
    tags: {
      type: [String],
      default: []
    },
    color: {
      type: String,
      default: '#ffffff' // Default hex code
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high'],
      default: 'medium'
    },
    status: {
      type: String,
      enum: ['active', 'archived', 'trash'],
      default: 'active'
    },
    reminder: {
      type: Date,
      default: null
    },
    favourite: {
      type: Boolean,
      default: false
    },
    archived: {
      type: Boolean,
      default: false
    },
    pinned: {
      type: Boolean,
      default: false
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Note must belong to a user']
    }
  },
  {
    timestamps: true
  }
);

// Indexes for query performance
noteSchema.index({ user: 1 });
noteSchema.index({ category: 1 });
noteSchema.index({ archived: 1 });
noteSchema.index({ pinned: 1 });
noteSchema.index({ favourite: 1 });
noteSchema.index({ status: 1 });

// Full text search index
noteSchema.index(
  {
    title: 'text',
    description: 'text',
    content: 'text',
    tags: 'text'
  },
  {
    weights: {
      title: 10,
      description: 5,
      content: 2,
      tags: 3
    },
    name: 'NoteTextIndex'
  }
);

module.exports = mongoose.model('Note', noteSchema);
