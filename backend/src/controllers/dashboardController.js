const Note = require('../models/Note');
const Category = require('../models/Category');

// @desc    Get dashboard metrics and statistics
// @route   GET /api/v1/dashboard
// @access  Private
exports.getDashboardData = async (req, res, next) => {
  try {
    const userId = req.user._id;

    // Count stats
    const totalNotes = await Note.countDocuments({ user: userId, status: 'active' });
    const archivedNotes = await Note.countDocuments({ user: userId, status: 'archived' });
    const favouriteNotes = await Note.countDocuments({ user: userId, favourite: true, status: { $ne: 'trash' } });
    const pinnedNotes = await Note.countDocuments({ user: userId, pinned: true, status: 'active' });
    const trashNotes = await Note.countDocuments({ user: userId, status: 'trash' });

    // Fetch the 5 most recently updated active notes
    const recentNotes = await Note.find({ user: userId, status: 'active' })
      .populate('category', 'name color')
      .sort({ updatedAt: -1 })
      .limit(5);

    // Aggregate note counts per category
    const categoryStats = await Note.aggregate([
      { $match: { user: userId, status: { $ne: 'trash' } } },
      { $group: { _id: '$category', count: { $sum: 1 } } }
    ]);

    // Retrieve user categories to build complete category stats (including 0 count categories)
    const categories = await Category.find({ user: userId });

    const categoryDistribution = categories.map((cat) => {
      const stat = categoryStats.find((s) => s._id && s._id.toString() === cat._id.toString());
      return {
        _id: cat._id,
        name: cat.name,
        color: cat.color,
        count: stat ? stat.count : 0
      };
    });

    // Extract uncategorized note count
    const uncategorizedStat = categoryStats.find((s) => s._id === null);
    const uncategorizedCount = uncategorizedStat ? uncategorizedStat.count : 0;

    res.status(200).json({
      success: true,
      message: 'Dashboard statistics retrieved successfully',
      data: {
        stats: {
          totalNotes,
          archivedNotes,
          favouriteNotes,
          pinnedNotes,
          trashNotes,
          uncategorizedCount
        },
        categoryDistribution,
        recentNotes
      }
    });
  } catch (error) {
    next(error);
  }
};
