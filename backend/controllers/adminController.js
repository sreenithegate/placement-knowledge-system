const mongoose = require('mongoose');
const Knowledge = require('../models/Knowledge');
const User = require('../models/User');

const getAdminOverview = async (req, res, next) => {
  try {
    const [totalUsers, totalArticles, viewSummary, recentArticles, popularArticles, categories] =
      await Promise.all([
        User.countDocuments(),
        Knowledge.countDocuments(),
        Knowledge.aggregate([{ $group: { _id: null, totalViews: { $sum: '$views' } } }]),
        Knowledge.find().populate('author', 'name email role').sort({ createdAt: -1 }).limit(5),
        Knowledge.find().populate('author', 'name email role').sort({ views: -1, createdAt: -1 }).limit(5),
        Knowledge.aggregate([
          { $group: { _id: '$category', count: { $sum: 1 } } },
          { $sort: { count: -1, _id: 1 } },
        ]),
      ]);

    return res.status(200).json({
      success: true,
      overview: {
        totalUsers,
        totalArticles,
        totalViews: viewSummary[0]?.totalViews || 0,
        recentArticles,
        popularArticles,
        categories: categories.map((item) => ({ category: item._id, count: item.count })),
      },
    });
  } catch (error) {
    return next(error);
  }
};

const listUsers = async (req, res, next) => {
  try {
    const page = Math.max(Number.parseInt(req.query.page || '1', 10), 1);
    const limit = Math.min(Math.max(Number.parseInt(req.query.limit || '20', 10), 1), 100);
    const totalUsers = await User.countDocuments();
    const users = await User.find()
      .select('name email role createdAt updatedAt')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    return res.status(200).json({
      success: true,
      users,
      pagination: { page, limit, totalUsers, totalPages: Math.ceil(totalUsers / limit) },
    });
  } catch (error) {
    return next(error);
  }
};

const updateUserRole = async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ success: false, message: 'Invalid user ID.' });
    }

    const { role } = req.body;

    if (!['student', 'admin'].includes(role)) {
      return res.status(400).json({
        success: false,
        message: 'Role must be either student or admin.',
      });
    }

    if (req.user._id.equals(req.params.id) && role !== 'admin') {
      return res.status(400).json({
        success: false,
        message: 'You cannot remove your own admin role.',
      });
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role },
      { new: true, runValidators: true },
    ).select('name email role createdAt updatedAt');

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    return res.status(200).json({ success: true, message: 'User role updated.', user });
  } catch (error) {
    return next(error);
  }
};

module.exports = { getAdminOverview, listUsers, updateUserRole };
