import mongoose from 'mongoose';

const categorySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  name: {
    type: String,
    required: [true, 'Category name is required'],
    trim: true,
  },
  subcategories: {
    type: [String],
    default: [],
  },
  icon: {
    type: String,
    default: '📦',
  },
  isDefault: {
    type: Boolean,
    default: false,
  },
}, {
  timestamps: true,
});

// Compound unique index: each user can only have one category with a given name
categorySchema.index({ userId: 1, name: 1 }, { unique: true });

const Category = mongoose.model('Category', categorySchema);
export default Category;
