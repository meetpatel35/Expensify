import Category from '../models/Category.js';

const DEFAULT_CATEGORIES = [
  { name: 'Grocery', icon: '🛒', subcategories: [] },
  { name: 'Repairs', icon: '🔧', subcategories: [] },
  { name: 'Clothes', icon: '👕', subcategories: [] },
  { name: 'Bills', icon: '📄', subcategories: ['Light bill', 'Mobile bill', 'Gas', 'Rent'] },
  { name: 'Food Expense', icon: '🍔', subcategories: [] },
  { name: 'Traveling Expense', icon: '✈️', subcategories: [] },
  { name: 'Other Shopping', icon: '🛍️', subcategories: [] },
  { name: 'Utilities', icon: '⚡', subcategories: [] },
];

export const seedDefaultCategories = async (userId) => {
  const existing = await Category.countDocuments({ userId });
  if (existing > 0) return; // Already seeded

  const categories = DEFAULT_CATEGORIES.map((cat) => ({
    ...cat,
    userId,
    isDefault: true,
  }));

  await Category.insertMany(categories);
};
