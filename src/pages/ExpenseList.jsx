import { useState, useEffect } from 'react';
import api from '../lib/api';
import { useAuth } from '../context/AuthContext';
import { formatCurrency, formatDate, toInputDate } from '../lib/utils';
import { Trash2, Pencil, X, Check, Search, Filter, ChevronLeft, ChevronRight } from 'lucide-react';

export default function ExpenseList() {
  const [expenses, setExpenses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [editingId, setEditingId] = useState(null);
  const [editData, setEditData] = useState({});
  const [filterCategory, setFilterCategory] = useState('');
  const [filterFrom, setFilterFrom] = useState('');
  const [filterTo, setFilterTo] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const { adminTargetUser, user } = useAuth();

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchExpenses();
  }, [page, filterCategory, filterFrom, filterTo, adminTargetUser]);

  const fetchCategories = async () => {
    try {
      const { data } = await api.get('/categories');
      setCategories(data);
    } catch (err) {
      console.error('Failed to fetch categories');
    }
  };

  const fetchExpenses = async () => {
    setLoading(true);
    try {
      const params = { page, limit: 20 };
      if (filterCategory) params.category = filterCategory;
      if (filterFrom) params.from = filterFrom;
      if (filterTo) params.to = filterTo;
      if (adminTargetUser) params.targetUserId = adminTargetUser;

      const { data } = await api.get('/expenses', { params });
      setExpenses(data.expenses);
      setTotalPages(data.pages);
      setTotal(data.total);
    } catch (err) {
      console.error('Failed to fetch expenses');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this expense?')) return;
    try {
      await api.delete(`/expenses/${id}`);
      setExpenses(expenses.filter((e) => e._id !== id));
      setTotal((prev) => prev - 1);
    } catch (err) {
      console.error('Failed to delete');
    }
  };

  const startEdit = (expense) => {
    setEditingId(expense._id);
    setEditData({
      amount: expense.amount,
      categoryId: expense.categoryId?._id || expense.categoryId,
      subcategory: expense.subcategory || '',
      date: toInputDate(expense.date),
      note: expense.note || '',
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditData({});
  };

  const saveEdit = async (id) => {
    try {
      const { data } = await api.put(`/expenses/${id}`, editData);
      setExpenses(expenses.map((e) => (e._id === id ? data : e)));
      setEditingId(null);
    } catch (err) {
      console.error('Failed to update');
    }
  };

  const getSubcategories = (categoryId) => {
    const cat = categories.find((c) => c._id === categoryId);
    return cat?.subcategories || [];
  };

  const clearFilters = () => {
    setFilterCategory('');
    setFilterFrom('');
    setFilterTo('');
    setPage(1);
  };

  return (
    <div className="animate-fade-in-up">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-text-heading">Expenses</h1>
          <p className="text-sm text-text-muted mt-1">{total} total transactions</p>
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium transition-all ${
            showFilters || filterCategory || filterFrom
              ? 'bg-primary/20 text-primary-light border border-primary/30'
              : 'bg-surface/30 text-text-muted border border-border hover:bg-surface/50'
          }`}
        >
          <Filter className="w-3.5 h-3.5" />
          Filters
        </button>
      </div>

      {/* Filters */}
      {showFilters && (
        <div className="glass rounded-2xl p-4 mb-4 animate-fade-in space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="text-xs text-text-muted mb-1 block">Category</label>
              <select
                value={filterCategory}
                onChange={(e) => { setFilterCategory(e.target.value); setPage(1); }}
                className="w-full px-3 py-2 bg-surface/50 border border-border rounded-xl text-text text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 appearance-none"
              >
                <option value="">All Categories</option>
                {categories.map((cat) => (
                  <option key={cat._id} value={cat._id}>{cat.icon} {cat.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs text-text-muted mb-1 block">From</label>
              <input
                type="date"
                value={filterFrom}
                onChange={(e) => { setFilterFrom(e.target.value); setPage(1); }}
                className="w-full px-3 py-2 bg-surface/50 border border-border rounded-xl text-text text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>
            <div>
              <label className="text-xs text-text-muted mb-1 block">To</label>
              <input
                type="date"
                value={filterTo}
                onChange={(e) => { setFilterTo(e.target.value); setPage(1); }}
                className="w-full px-3 py-2 bg-surface/50 border border-border rounded-xl text-text text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>
          </div>
          {(filterCategory || filterFrom || filterTo) && (
            <button
              onClick={clearFilters}
              className="text-xs text-danger hover:underline"
            >
              Clear all filters
            </button>
          )}
        </div>
      )}

      {/* Expense List */}
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      ) : expenses.length === 0 ? (
        <div className="glass rounded-2xl p-8 text-center">
          <p className="text-text-muted">No expenses found</p>
          <p className="text-xs text-text-muted mt-1">Add some expenses to see them here</p>
        </div>
      ) : (
        <div className="space-y-3">
          {expenses.map((expense) => (
            <div key={expense._id} className="glass rounded-2xl p-4 transition-all hover:bg-surface-light/20">
              {editingId === expense._id ? (
                /* Edit Mode */
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs text-text-muted mb-1 block">Amount (₹)</label>
                      <input
                        type="number"
                        value={editData.amount}
                        onChange={(e) => setEditData({ ...editData, amount: e.target.value })}
                        className="w-full px-3 py-2 bg-surface/50 border border-border rounded-xl text-text text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-text-muted mb-1 block">Date</label>
                      <input
                        type="date"
                        value={editData.date}
                        onChange={(e) => setEditData({ ...editData, date: e.target.value })}
                        className="w-full px-3 py-2 bg-surface/50 border border-border rounded-xl text-text text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-text-muted mb-1 block">Category</label>
                      <select
                        value={editData.categoryId}
                        onChange={(e) => setEditData({ ...editData, categoryId: e.target.value, subcategory: '' })}
                        className="w-full px-3 py-2 bg-surface/50 border border-border rounded-xl text-text text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 appearance-none"
                      >
                        {categories.map((cat) => (
                          <option key={cat._id} value={cat._id}>{cat.icon} {cat.name}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="text-xs text-text-muted mb-1 block">Subcategory</label>
                      {getSubcategories(editData.categoryId).length > 0 ? (
                        <select
                          value={editData.subcategory}
                          onChange={(e) => setEditData({ ...editData, subcategory: e.target.value })}
                          className="w-full px-3 py-2 bg-surface/50 border border-border rounded-xl text-text text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 appearance-none"
                        >
                          <option value="">None</option>
                          {getSubcategories(editData.categoryId).map((sub) => (
                            <option key={sub} value={sub}>{sub}</option>
                          ))}
                        </select>
                      ) : (
                        <input
                          type="text"
                          value={editData.subcategory}
                          onChange={(e) => setEditData({ ...editData, subcategory: e.target.value })}
                          placeholder="Optional"
                          className="w-full px-3 py-2 bg-surface/50 border border-border rounded-xl text-text text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                        />
                      )}
                    </div>
                  </div>
                  <div>
                    <label className="text-xs text-text-muted mb-1 block">Note</label>
                    <input
                      type="text"
                      value={editData.note}
                      onChange={(e) => setEditData({ ...editData, note: e.target.value })}
                      placeholder="Note"
                      className="w-full px-3 py-2 bg-surface/50 border border-border rounded-xl text-text text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                    />
                  </div>
                  <div className="flex gap-2 justify-end">
                    <button
                      onClick={cancelEdit}
                      className="flex items-center gap-1 px-3 py-1.5 text-xs text-text-muted hover:text-text rounded-lg hover:bg-surface/50 transition-all"
                    >
                      <X className="w-3.5 h-3.5" /> Cancel
                    </button>
                    <button
                      onClick={() => saveEdit(expense._id)}
                      className="flex items-center gap-1 px-3 py-1.5 text-xs text-white bg-primary rounded-lg hover:bg-primary-hover transition-all"
                    >
                      <Check className="w-3.5 h-3.5" /> Save
                    </button>
                  </div>
                </div>
              ) : (
                /* View Mode */
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-lg shrink-0">
                      {expense.categoryId?.icon || '📦'}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium text-text-heading truncate">
                          {expense.categoryId?.name || 'Unknown'}
                          {expense.subcategory && (
                            <span className="text-text-muted font-normal"> · {expense.subcategory}</span>
                          )}
                        </p>
                        {user?.role === 'admin' && adminTargetUser === 'all' && expense.userId?.name && (
                          <span className="px-1.5 py-0.5 bg-secondary/20 text-secondary text-[10px] uppercase font-bold rounded">
                            {expense.userId.name}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-text-muted">
                        <span>{formatDate(expense.date)}</span>
                        {expense.note && (
                          <>
                            <span>·</span>
                            <span className="truncate">{expense.note}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 ml-3">
                    <span className="text-sm font-bold text-text-heading">
                      {formatCurrency(expense.amount)}
                    </span>
                    <button
                      onClick={() => startEdit(expense)}
                      className="p-1.5 rounded-lg text-text-muted hover:text-primary-light hover:bg-primary/10 transition-all"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(expense._id)}
                      className="p-1.5 rounded-lg text-text-muted hover:text-danger hover:bg-danger/10 transition-all"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-3 mt-6">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="p-2 rounded-lg bg-surface/30 border border-border text-text-muted hover:text-text disabled:opacity-30 transition-all"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-sm text-text-muted">
            Page <span className="text-text font-medium">{page}</span> of {totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="p-2 rounded-lg bg-surface/30 border border-border text-text-muted hover:text-text disabled:opacity-30 transition-all"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}
