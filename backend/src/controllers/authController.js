const mongoose = require('mongoose');
const User = require('../models/User');

// Helper function to send token in cookie and response
const sendTokenResponse = (user, statusCode, res, message) => {
  const token = user.generateToken();

  const options = {
    expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict'
  };

  const userResponse = {
    _id: user._id,
    name: user.name,
    email: user.email,
    avatar: user.avatar,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt
  };

  res.status(statusCode).cookie('token', token, options).json({
    success: true,
    message,
    token,
    data: { user: userResponse }
  });
};

// @desc    Register user
// @route   POST /api/v1/auth/register
// @access  Public
exports.register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    // Validate request body
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields (name, email, password)'
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Email already registered'
      });
    }

    // Create user
    const user = await User.create({
      name,
      email,
      password
    });

    sendTokenResponse(user, 201, res, 'User registered successfully');
  } catch (error) {
    next(error);
  }
};

// @desc    Login user
// @route   POST /api/v1/auth/login
// @access  Public
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Validate email & password
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password'
      });
    }

    // Check for user
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Check if password matches
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    sendTokenResponse(user, 200, res, 'User logged in successfully');
  } catch (error) {
    next(error);
  }
};

// @desc    Log user out / clear cookie
// @route   POST /api/v1/auth/logout
// @access  Private
exports.logout = async (req, res, next) => {
  try {
    res.cookie('token', 'none', {
      expires: new Date(Date.now() + 10 * 1000),
      httpOnly: true
    });

    res.status(200).json({
      success: true,
      message: 'Logged out successfully',
      data: {}
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get current logged in user
// @route   GET /api/v1/auth/me
// @access  Private
exports.getMe = async (req, res, next) => {
  try {
    res.status(200).json({
      success: true,
      message: 'User profile retrieved successfully',
      data: { user: req.user }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update user details
// @route   PUT /api/v1/auth/details
// @access  Private
exports.updateDetails = async (req, res, next) => {
  try {
    const { name, email } = req.body;

    const fieldsToUpdate = {};
    if (name) fieldsToUpdate.name = name;
    if (email) {
      // Check if email is already taken
      const emailExists = await User.findOne({ email });
      if (emailExists && emailExists._id.toString() !== req.user._id.toString()) {
        return res.status(400).json({
          success: false,
          message: 'Email address is already in use by another account'
        });
      }
      fieldsToUpdate.email = email;
    }

    const user = await User.findByIdAndUpdate(req.user._id, fieldsToUpdate, {
      new: true,
      runValidators: true
    });

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: { user }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update password
// @route   PUT /api/v1/auth/password
// @access  Private
exports.updatePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Please provide your current password and new password'
      });
    }

    // Get user with password field
    const user = await User.findById(req.user._id).select('+password');

    // Check current password
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Incorrect current password'
      });
    }

    // Set and save new password (pre-save hook will hash it)
    user.password = newPassword;
    await user.save();

    sendTokenResponse(user, 200, res, 'Password updated successfully');
  } catch (error) {
    next(error);
  }
};

// @desc    Delete account
// @route   DELETE /api/v1/auth/account
// @access  Private
exports.deleteAccount = async (req, res, next) => {
  try {
    const userId = req.user._id;

    // Delete user's notes and categories
    const Note = mongoose.models.Note || require('../models/Note');
    const Category = mongoose.models.Category || require('../models/Category');

    if (Note) {
      await Note.deleteMany({ user: userId });
    }
    if (Category) {
      await Category.deleteMany({ user: userId });
    }

    // Delete user
    await User.findByIdAndDelete(userId);

    // Clear cookie
    res.cookie('token', 'none', {
      expires: new Date(Date.now() + 10 * 1000),
      httpOnly: true
    });

    res.status(200).json({
      success: true,
      message: 'Account and all associated notes deleted successfully',
      data: {}
    });
  } catch (error) {
    next(error);
  }
};
