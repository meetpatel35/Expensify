import express from 'express';
import Expense from '../models/Expense.js';
import { protect } from '../middleware/auth.js';
import mongoose from 'mongoose';

const router = express.Router();
router.use(protect);

// GET /api/analytics?range=weekly|monthly|custom&from=...&to=...&targetUserId=...
router.get('/', async (req, res) => {
  try {
    const { range, from, to, targetUserId } = req.query;
    
    let userId = new mongoose.Types.ObjectId(req.user._id);

    if (req.user.role === 'admin' && targetUserId) {
      if (targetUserId === 'all') {
        userId = null;
      } else {
        userId = new mongoose.Types.ObjectId(targetUserId);
      }
    }

    // Determine date range
    let startDate, endDate;
    const now = new Date();

    switch (range) {
      case 'weekly':
        startDate = new Date(now);
        startDate.setDate(now.getDate() - 7);
        endDate = now;
        break;
      case 'monthly':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        endDate = now;
        break;
      case 'custom':
        if (!from || !to) {
          return res.status(400).json({ message: 'Custom range requires from and to dates' });
        }
        startDate = new Date(from);
        endDate = new Date(to + 'T23:59:59.999Z');
        break;
      default:
        // Default to current month
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        endDate = now;
    }

    const matchStage = {
      $match: {
        date: { $gte: startDate, $lte: endDate },
      },
    };

    if (userId) {
      matchStage.$match.userId = userId;
    }

    // Category breakdown for Pie Chart
    const categoryBreakdown = await Expense.aggregate([
      matchStage,
      {
        $lookup: {
          from: 'categories',
          localField: 'categoryId',
          foreignField: '_id',
          as: 'category',
        },
      },
      { $unwind: { path: '$category', preserveNullAndEmptyArrays: true } },
      {
        $group: {
          _id: { $ifNull: ['$category.name', 'Uncategorized'] },
          categoryIcon: { $first: { $ifNull: ['$category.icon', '📦'] } },
          total: { $sum: '$amount' },
          count: { $sum: 1 },
        },
      },
      {
        $project: {
          categoryName: '$_id',
          categoryIcon: 1,
          total: 1,
          count: 1,
        },
      },
      { $sort: { total: -1 } },
    ]);

    // Daily breakdown for Bar Chart
    const dailyBreakdown = await Expense.aggregate([
      matchStage,
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$date' },
          },
          total: { $sum: '$amount' },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
      {
        $project: {
          date: '$_id',
          total: 1,
          count: 1,
          _id: 0,
        },
      },
    ]);

    // Summary stats
    const summary = await Expense.aggregate([
      matchStage,
      {
        $group: {
          _id: null,
          totalSpent: { $sum: '$amount' },
          totalCount: { $sum: 1 },
          avgExpense: { $avg: '$amount' },
        },
      },
    ]);

    const totalSpent = summary[0]?.totalSpent || 0;
    const totalCount = summary[0]?.totalCount || 0;
    const avgExpense = summary[0]?.avgExpense || 0;
    const topCategory = categoryBreakdown[0] || null;

    // Calculate percentages for pie chart
    const categoryData = categoryBreakdown.map((cat) => ({
      ...cat,
      percentage: totalSpent > 0 ? ((cat.total / totalSpent) * 100).toFixed(1) : 0,
    }));

    res.json({
      summary: {
        totalSpent,
        totalCount,
        avgExpense: Math.round(avgExpense),
        topCategory: topCategory
          ? { name: topCategory.categoryName, amount: topCategory.total }
          : null,
      },
      categoryBreakdown: categoryData,
      dailyBreakdown,
      dateRange: {
        from: startDate.toISOString(),
        to: endDate.toISOString(),
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
