import express from 'express';
import Expense from '../models/Expense.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// All routes are protected
router.use(protect);

// GET /api/expenses — List expenses with filters
router.get('/', async (req, res) => {
  try {
    const { from, to, category, page = 1, limit = 50, targetUserId } = req.query;

    const filter = {};
    
    if (req.user.role === 'admin' && targetUserId) {
      if (targetUserId !== 'all') {
        filter.userId = targetUserId;
      }
    } else {
      filter.userId = req.user._id;
    }

    if (from || to) {
      filter.date = {};
      if (from) filter.date.$gte = new Date(from);
      if (to) filter.date.$lte = new Date(to + 'T23:59:59.999Z');
    }

    if (category) {
      filter.categoryId = category;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [expenses, total] = await Promise.all([
      Expense.find(filter)
        .populate('categoryId', 'name icon')
        .populate('userId', 'name email')
        .sort({ date: -1, createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      Expense.countDocuments(filter),
    ]);

    res.json({
      expenses,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit)),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST /api/expenses — Batch create expenses
router.post('/', async (req, res) => {
  try {
    const { expenses } = req.body;

    if (!expenses || !Array.isArray(expenses) || expenses.length === 0) {
      return res.status(400).json({ message: 'Provide an array of expenses' });
    }

    // Validate each expense
    for (let i = 0; i < expenses.length; i++) {
      const e = expenses[i];
      if (!e.amount || e.amount <= 0) {
        return res.status(400).json({ message: `Expense ${i + 1}: Amount must be positive` });
      }
      if (!e.categoryId) {
        return res.status(400).json({ message: `Expense ${i + 1}: Category is required` });
      }
      if (!e.date) {
        return res.status(400).json({ message: `Expense ${i + 1}: Date is required` });
      }
    }

    const expenseDocs = expenses.map((e) => ({
      userId: req.user._id,
      amount: e.amount,
      categoryId: e.categoryId,
      subcategory: e.subcategory || '',
      date: new Date(e.date),
      note: e.note || '',
    }));

    const created = await Expense.insertMany(expenseDocs);

    res.status(201).json({
      message: `${created.length} expense(s) added successfully`,
      insertedCount: created.length,
      expenses: created,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// PUT /api/expenses/:id — Update a single expense
router.put('/:id', async (req, res) => {
  try {
    const expense = await Expense.findOne({ _id: req.params.id, userId: req.user._id });
    if (!expense) {
      return res.status(404).json({ message: 'Expense not found' });
    }

    const { amount, categoryId, subcategory, date, note } = req.body;

    if (amount !== undefined) expense.amount = amount;
    if (categoryId !== undefined) expense.categoryId = categoryId;
    if (subcategory !== undefined) expense.subcategory = subcategory;
    if (date !== undefined) expense.date = new Date(date);
    if (note !== undefined) expense.note = note;

    await expense.save();

    const populated = await Expense.findById(expense._id).populate('categoryId', 'name icon');
    res.json(populated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// DELETE /api/expenses/:id — Delete a single expense
router.delete('/:id', async (req, res) => {
  try {
    const expense = await Expense.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!expense) {
      return res.status(404).json({ message: 'Expense not found' });
    }

    res.json({ message: 'Expense deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
