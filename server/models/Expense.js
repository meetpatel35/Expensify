import mongoose from 'mongoose';

const expenseSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  amount: {
    type: Number,
    required: [true, 'Amount is required'],
    min: [0, 'Amount cannot be negative'],
  },
  categoryId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: [true, 'Category is required'],
  },
  subcategory: {
    type: String,
    default: '',
    trim: true,
  },
  date: {
    type: Date,
    required: [true, 'Date is required'],
    index: true,
  },
  note: {
    type: String,
    default: '',
    trim: true,
    maxlength: 200,
  },
}, {
  timestamps: true,
});

// Compound index for efficient queries
expenseSchema.index({ userId: 1, date: -1 });
expenseSchema.index({ userId: 1, categoryId: 1 });

const Expense = mongoose.model('Expense', expenseSchema);
export default Expense;
