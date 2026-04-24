import express from 'express';
import Category from '../models/Category.js';
import Expense from '../models/Expense.js';
import { protect } from '../middleware/auth.js';
import { seedDefaultCategories } from '../utils/seedCategories.js';

const router = express.Router();

// All routes are protected
router.use(protect);

// GET /api/categories — List all categories for the user
router.get('/', async (req, res) => {
  try {
    const categories = await Category.find({ userId: req.user._id }).sort({ name: 1 });
    res.json(categories);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST /api/categories — Create a new category
router.post('/', async (req, res) => {
  try {
    const { name, subcategories, icon } = req.body;

    if (!name) {
      return res.status(400).json({ message: 'Category name is required' });
    }

    const category = await Category.create({
      userId: req.user._id,
      name,
      subcategories: subcategories || [],
      icon: icon || '📦',
    });

    res.status(201).json(category);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: 'Category with this name already exists' });
    }
    res.status(500).json({ message: error.message });
  }
});

// POST /api/categories/seed — Seed default categories
router.post('/seed', async (req, res) => {
  try {
    await seedDefaultCategories(req.user._id);
    const categories = await Category.find({ userId: req.user._id }).sort({ name: 1 });
    res.json(categories);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// PUT /api/categories/:id — Update category
router.put('/:id', async (req, res) => {
  try {
    const { name, subcategories, icon } = req.body;

    const category = await Category.findOne({ _id: req.params.id, userId: req.user._id });
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    if (name) category.name = name;
    if (subcategories !== undefined) category.subcategories = subcategories;
    if (icon) category.icon = icon;

    await category.save();
    res.json(category);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: 'Category with this name already exists' });
    }
    res.status(500).json({ message: error.message });
  }
});

// DELETE /api/categories/:id — Delete category
router.delete('/:id', async (req, res) => {
  try {
    const category = await Category.findOne({ _id: req.params.id, userId: req.user._id });
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    // Check if expenses reference this category
    const expenseCount = await Expense.countDocuments({ categoryId: req.params.id });
    if (expenseCount > 0) {
      return res.status(400).json({
        message: `Cannot delete: ${expenseCount} expense(s) use this category. Reassign them first.`,
      });
    }

    await category.deleteOne();
    res.json({ message: 'Category deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
