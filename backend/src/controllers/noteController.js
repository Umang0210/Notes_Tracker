const Note = require('../models/Note');
const Category = require('../models/Category');

// @desc    Get all notes with search, filters, pagination and sorting
// @route   GET /api/v1/notes
// @access  Private
exports.getNotes = async (req, res, next) => {
  try {
    const {
      search,
      category,
      tag,
      priority,
      status,
      favourite,
      archived,
      pinned,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      page = 1,
      limit = 12
    } = req.query;

    // Base query: only get notes belonging to the logged-in user
    const query = { user: req.user._id };

    // Search filter using MongoDB Text Search
    if (search) {
      query.$text = { $search: search };
    }

    // Category filter (handles uncategorized specifically with 'null' string)
    if (category) {
      query.category = category === 'null' ? null : category;
    }

    // Tag filter
    if (tag) {
      query.tags = tag;
    }

    // Priority filter (low, medium, high)
    if (priority) {
      query.priority = priority;
    }

    // Status filter (active, archived, trash)
    if (status) {
      query.status = status;
    }

    // Boolean filters
    if (favourite !== undefined) {
      query.favourite = favourite === 'true';
    }

    if (archived !== undefined) {
      query.archived = archived === 'true';
    }

    if (pinned !== undefined) {
      query.pinned = pinned === 'true';
    }

    // Pagination setup
    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 12;
    const skip = (pageNum - 1) * limitNum;

    // Sorting setup
    const sort = {};
    if (search && sortBy === 'score') {
      // Sort by search relevance
      sort.score = { $meta: 'textScore' };
    } else {
      sort[sortBy] = sortOrder === 'desc' ? -1 : 1;
    }

    const notes = await Note.find(query)
      .populate('category', 'name color')
      .sort(sort)
      .skip(skip)
      .limit(limitNum);

    const total = await Note.countDocuments(query);

    res.status(200).json({
      success: true,
      message: 'Notes retrieved successfully',
      data: {
        notes,
        pagination: {
          total,
          page: pageNum,
          limit: limitNum,
          pages: Math.ceil(total / limitNum)
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get a single note by ID
// @route   GET /api/v1/notes/:id
// @access  Private
exports.getNote = async (req, res, next) => {
  try {
    const note = await Note.findOne({ _id: req.params.id, user: req.user._id }).populate('category', 'name color');

    if (!note) {
      return res.status(404).json({
        success: false,
        message: 'Note not found or unauthorized'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Note retrieved successfully',
      data: { note }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a new note
// @route   POST /api/v1/notes
// @access  Private
exports.createNote = async (req, res, next) => {
  try {
    const {
      title,
      description,
      content,
      category,
      tags,
      color,
      priority,
      reminder
    } = req.body;

    if (!title) {
      return res.status(400).json({
        success: false,
        message: 'Note title is required'
      });
    }

    // Verify category if provided
    if (category) {
      const catExists = await Category.findOne({ _id: category, user: req.user._id });
      if (!catExists) {
        return res.status(400).json({
          success: false,
          message: 'Invalid category'
        });
      }
    }

    const note = await Note.create({
      title,
      description,
      content,
      category: category || null,
      tags: tags || [],
      color: color || '#ffffff',
      priority: priority || 'medium',
      reminder: reminder || null,
      user: req.user._id
    });

    const populatedNote = await Note.findById(note._id).populate('category', 'name color');

    res.status(201).json({
      success: true,
      message: 'Note created successfully',
      data: { note: populatedNote }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update an existing note
// @route   PUT /api/v1/notes/:id
// @access  Private
exports.updateNote = async (req, res, next) => {
  try {
    const {
      title,
      description,
      content,
      category,
      tags,
      color,
      priority,
      status,
      reminder
    } = req.body;

    let note = await Note.findOne({ _id: req.params.id, user: req.user._id });

    if (!note) {
      return res.status(404).json({
        success: false,
        message: 'Note not found or unauthorized'
      });
    }

    // Verify category if updated
    if (category) {
      const catExists = await Category.findOne({ _id: category, user: req.user._id });
      if (!catExists) {
        return res.status(400).json({
          success: false,
          message: 'Invalid category'
        });
      }
    }

    // Apply updates
    if (title) note.title = title;
    if (description !== undefined) note.description = description;
    if (content !== undefined) note.content = content;
    if (category !== undefined) note.category = category || null;
    if (tags !== undefined) note.tags = tags;
    if (color) note.color = color;
    if (priority) note.priority = priority;
    if (status) note.status = status;
    if (reminder !== undefined) note.reminder = reminder || null;

    await note.save();

    const populatedNote = await Note.findById(note._id).populate('category', 'name color');

    res.status(200).json({
      success: true,
      message: 'Note updated successfully',
      data: { note: populatedNote }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a note (permanently or send to trash depending on current status)
// @route   DELETE /api/v1/notes/:id
// @access  Private
exports.deleteNote = async (req, res, next) => {
  try {
    const note = await Note.findOne({ _id: req.params.id, user: req.user._id });

    if (!note) {
      return res.status(404).json({
        success: false,
        message: 'Note not found or unauthorized'
      });
    }

    if (note.status === 'trash') {
      // Permanently delete
      await Note.findByIdAndDelete(req.params.id);
      res.status(200).json({
        success: true,
        message: 'Note deleted permanently',
        data: {}
      });
    } else {
      // Send to trash / soft-delete
      note.status = 'trash';
      await note.save();
      res.status(200).json({
        success: true,
        message: 'Note moved to trash',
        data: { note }
      });
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Toggle note pin status
// @route   PUT /api/v1/notes/:id/pin
// @access  Private
exports.togglePin = async (req, res, next) => {
  try {
    const note = await Note.findOne({ _id: req.params.id, user: req.user._id });

    if (!note) {
      return res.status(404).json({
        success: false,
        message: 'Note not found or unauthorized'
      });
    }

    note.pinned = !note.pinned;
    await note.save();

    res.status(200).json({
      success: true,
      message: note.pinned ? 'Note pinned successfully' : 'Note unpinned successfully',
      data: { note }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Toggle note archive status
// @route   PUT /api/v1/notes/:id/archive
// @access  Private
exports.toggleArchive = async (req, res, next) => {
  try {
    const note = await Note.findOne({ _id: req.params.id, user: req.user._id });

    if (!note) {
      return res.status(404).json({
        success: false,
        message: 'Note not found or unauthorized'
      });
    }

    note.archived = !note.archived;
    // Set status accordingly
    note.status = note.archived ? 'archived' : 'active';
    
    await note.save();

    res.status(200).json({
      success: true,
      message: note.archived ? 'Note archived successfully' : 'Note restored from archive successfully',
      data: { note }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Toggle note favourite status
// @route   PUT /api/v1/notes/:id/favourite
// @access  Private
exports.toggleFavourite = async (req, res, next) => {
  try {
    const note = await Note.findOne({ _id: req.params.id, user: req.user._id });

    if (!note) {
      return res.status(404).json({
        success: false,
        message: 'Note not found or unauthorized'
      });
    }

    note.favourite = !note.favourite;
    await note.save();

    res.status(200).json({
      success: true,
      message: note.favourite ? 'Added to favourites' : 'Removed from favourites',
      data: { note }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Restore note from trash
// @route   PUT /api/v1/notes/:id/restore
// @access  Private
exports.restoreNote = async (req, res, next) => {
  try {
    const note = await Note.findOne({ _id: req.params.id, user: req.user._id });

    if (!note) {
      return res.status(404).json({
        success: false,
        message: 'Note not found or unauthorized'
      });
    }

    if (note.status !== 'trash') {
      return res.status(400).json({
        success: false,
        message: 'Note is not in trash'
      });
    }

    note.status = note.archived ? 'archived' : 'active';
    await note.save();

    res.status(200).json({
      success: true,
      message: 'Note restored from trash successfully',
      data: { note }
    });
  } catch (error) {
    next(error);
  }
};
