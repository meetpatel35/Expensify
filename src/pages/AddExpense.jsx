import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../lib/api';
import { toInputDate } from '../lib/utils';
import { Plus, Trash2, Send, AlertCircle, CheckCircle } from 'lucide-react';

const emptyExpense = () => ({
  id: Date.now() + Math.random(),
  amount: '',
  categoryId: '',
  subcategory: '',
  date: toInputDate(new Date()),
  note: '',
});

export default function AddExpense() {
  const [expenses, setExpenses] = useState([emptyExpense()]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const { data } = await api.get('/categories');
      setCategories(data);
    } catch (err) {
      console.error('Failed to fetch categories');
    }
  };

  const addRow = () => {
    setExpenses([...expenses, emptyExpense()]);
  };

  const removeRow = (id) => {
    if (expenses.length === 1) return;
    setExpenses(expenses.filter((e) => e.id !== id));
  };

  const updateRow = (id, field, value) => {
    setExpenses(
      expenses.map((e) => {
        if (e.id !== id) return e;
        const updated = { ...e, [field]: value };
        // Reset subcategory when category changes
        if (field === 'categoryId') {
          updated.subcategory = '';
        }
        return updated;
      })
    );
  };

  const getSubcategories = (categoryId) => {
    const cat = categories.find((c) => c._id === categoryId);
    return cat?.subcategories || [];
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const payload = expenses.map((exp) => ({
        amount: parseFloat(exp.amount),
        categoryId: exp.categoryId,
        subcategory: exp.subcategory,
        date: exp.date,
        note: exp.note,
      }));

      const { data } = await api.post('/expenses', { expenses: payload });
      setSuccess(data.message);
      setExpenses([emptyExpense()]);

      setTimeout(() => navigate('/expenses'), 1500);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save expenses');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto animate-fade-in-up">
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-text-heading">Add Expenses</h1>
        <p className="text-sm text-text-muted mt-1">Add one or more expenses at once</p>
      </div>

      {error && (
        <div className="flex items-center gap-2 bg-danger/10 border border-danger/20 text-danger text-sm rounded-xl px-4 py-3 mb-4 animate-fade-in">
          <AlertCircle className="w-4 h-4 shrink-0" />
          {error}
        </div>
      )}

      {success && (
        <div className="flex items-center gap-2 bg-success/10 border border-success/20 text-success text-sm rounded-xl px-4 py-3 mb-4 animate-fade-in">
          <CheckCircle className="w-4 h-4 shrink-0" />
          {success}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {expenses.map((expense, index) => (
          <div
            key={expense.id}
            className="glass rounded-2xl p-4 md:p-5 space-y-3 animate-slide-in"
            style={{ animationDelay: `${index * 0.05}s` }}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-primary-light bg-primary/10 px-2.5 py-1 rounded-full">
                Expense #{index + 1}
              </span>
              {expenses.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeRow(expense.id)}
                  className="p-1.5 rounded-lg text-text-muted hover:text-danger hover:bg-danger/10 transition-all"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3">
              {/* Amount */}
              <div>
                <label className="text-xs text-text-muted mb-1 block">Amount (₹)</label>
                <input
                  type="number"
                  value={expense.amount}
                  onChange={(e) => updateRow(expense.id, 'amount', e.target.value)}
                  placeholder="0"
                  required
                  min="1"
                  step="0.01"
                  className="w-full px-3 py-2.5 bg-surface/50 border border-border rounded-xl text-text text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                />
              </div>

              {/* Date */}
              <div>
                <label className="text-xs text-text-muted mb-1 block">Date</label>
                <input
                  type="date"
                  value={expense.date}
                  onChange={(e) => updateRow(expense.id, 'date', e.target.value)}
                  required
                  className="w-full px-3 py-2.5 bg-surface/50 border border-border rounded-xl text-text text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                />
              </div>

              {/* Category */}
              <div>
                <label className="text-xs text-text-muted mb-1 block">Category</label>
                <select
                  value={expense.categoryId}
                  onChange={(e) => updateRow(expense.id, 'categoryId', e.target.value)}
                  required
                  className="w-full px-3 py-2.5 bg-surface/50 border border-border rounded-xl text-text text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all appearance-none"
                >
                  <option value="">Select category</option>
                  {categories.map((cat) => (
                    <option key={cat._id} value={cat._id}>
                      {cat.icon} {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Subcategory */}
              <div>
                <label className="text-xs text-text-muted mb-1 block">Subcategory</label>
                {getSubcategories(expense.categoryId).length > 0 ? (
                  <select
                    value={expense.subcategory}
                    onChange={(e) => updateRow(expense.id, 'subcategory', e.target.value)}
                    className="w-full px-3 py-2.5 bg-surface/50 border border-border rounded-xl text-text text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all appearance-none"
                  >
                    <option value="">None</option>
                    {getSubcategories(expense.categoryId).map((sub) => (
                      <option key={sub} value={sub}>{sub}</option>
                    ))}
                  </select>
                ) : (
                  <input
                    type="text"
                    value={expense.subcategory}
                    onChange={(e) => updateRow(expense.id, 'subcategory', e.target.value)}
                    placeholder="Optional"
                    className="w-full px-3 py-2.5 bg-surface/50 border border-border rounded-xl text-text text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                  />
                )}
              </div>
            </div>

            {/* Note */}
            <div>
              <label className="text-xs text-text-muted mb-1 block">Note (optional)</label>
              <input
                type="text"
                value={expense.note}
                onChange={(e) => updateRow(expense.id, 'note', e.target.value)}
                placeholder="What was this for?"
                maxLength={200}
                className="w-full px-3 py-2.5 bg-surface/50 border border-border rounded-xl text-text text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
              />
            </div>
          </div>
        ))}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            type="button"
            onClick={addRow}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed border-primary/30 text-primary-light rounded-xl hover:bg-primary/5 hover:border-primary/50 transition-all text-sm font-medium"
          >
            <Plus className="w-4 h-4" />
            Add Another Expense
          </button>

          <button
            type="submit"
            disabled={loading}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-primary to-secondary text-white font-semibold rounded-xl hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-primary/20 text-sm"
          >
            {loading ? (
              <>
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                Save {expenses.length > 1 ? `${expenses.length} Expenses` : 'Expense'}
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
