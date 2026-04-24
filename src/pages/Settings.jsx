import { useState, useEffect } from 'react';
import api from '../lib/api';
import { Plus, Pencil, Trash2, X, Check, Tag, AlertCircle } from 'lucide-react';

export default function Settings() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState('');
  const [editIcon, setEditIcon] = useState('');
  const [editSubs, setEditSubs] = useState([]);
  const [newSubInput, setNewSubInput] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [newName, setNewName] = useState('');
  const [newIcon, setNewIcon] = useState('📦');
  const [newSubs, setNewSubs] = useState([]);
  const [newSubValue, setNewSubValue] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const { data } = await api.get('/categories');
      setCategories(data);
    } catch (err) {
      console.error('Failed to fetch categories');
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const { data } = await api.post('/categories', {
        name: newName,
        icon: newIcon,
        subcategories: newSubs,
      });
      setCategories([...categories, data]);
      setNewName('');
      setNewIcon('📦');
      setNewSubs([]);
      setShowAddForm(false);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create category');
    }
  };

  const startEdit = (cat) => {
    setEditingId(cat._id);
    setEditName(cat.name);
    setEditIcon(cat.icon);
    setEditSubs([...cat.subcategories]);
    setNewSubInput('');
  };

  const saveEdit = async (id) => {
    setError('');
    try {
      const { data } = await api.put(`/categories/${id}`, {
        name: editName,
        icon: editIcon,
        subcategories: editSubs,
      });
      setCategories(categories.map((c) => (c._id === id ? data : c)));
      setEditingId(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this category? This cannot be undone.')) return;
    setError('');
    try {
      await api.delete(`/categories/${id}`);
      setCategories(categories.filter((c) => c._id !== id));
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete');
    }
  };

  const addEditSub = () => {
    if (newSubInput.trim() && !editSubs.includes(newSubInput.trim())) {
      setEditSubs([...editSubs, newSubInput.trim()]);
      setNewSubInput('');
    }
  };

  const removeEditSub = (sub) => {
    setEditSubs(editSubs.filter((s) => s !== sub));
  };

  const addNewSub = () => {
    if (newSubValue.trim() && !newSubs.includes(newSubValue.trim())) {
      setNewSubs([...newSubs, newSubValue.trim()]);
      setNewSubValue('');
    }
  };

  const EMOJI_OPTIONS = ['📦', '🛒', '🔧', '👕', '📄', '🍔', '✈️', '🛍️', '⚡', '🏠', '💊', '🎮', '📚', '🚗', '💰'];

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto animate-fade-in-up">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-text-heading">Settings</h1>
          <p className="text-sm text-text-muted mt-1">Manage your expense categories</p>
        </div>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="flex items-center gap-1.5 px-3 py-2 bg-gradient-to-r from-primary to-secondary text-white text-xs font-semibold rounded-xl hover:opacity-90 transition-all shadow-lg shadow-primary/20"
        >
          <Plus className="w-3.5 h-3.5" />
          New Category
        </button>
      </div>

      {error && (
        <div className="flex items-center gap-2 bg-danger/10 border border-danger/20 text-danger text-sm rounded-xl px-4 py-3 mb-4 animate-fade-in">
          <AlertCircle className="w-4 h-4 shrink-0" />
          {error}
        </div>
      )}

      {/* Add Category Form */}
      {showAddForm && (
        <form onSubmit={handleAdd} className="glass rounded-2xl p-4 md:p-5 mb-4 space-y-3 animate-fade-in">
          <h3 className="text-sm font-semibold text-text-heading">Add New Category</h3>

          <div className="grid grid-cols-4 gap-3">
            <div className="col-span-1">
              <label className="text-xs text-text-muted mb-1 block">Icon</label>
              <select
                value={newIcon}
                onChange={(e) => setNewIcon(e.target.value)}
                className="w-full px-2 py-2.5 bg-surface/50 border border-border rounded-xl text-text text-center text-lg focus:outline-none focus:ring-2 focus:ring-primary/50 appearance-none"
              >
                {EMOJI_OPTIONS.map((e) => (
                  <option key={e} value={e}>{e}</option>
                ))}
              </select>
            </div>
            <div className="col-span-3">
              <label className="text-xs text-text-muted mb-1 block">Name</label>
              <input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="Category name"
                required
                className="w-full px-3 py-2.5 bg-surface/50 border border-border rounded-xl text-text text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>
          </div>

          {/* Subcategories */}
          <div>
            <label className="text-xs text-text-muted mb-1 block">Subcategories</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={newSubValue}
                onChange={(e) => setNewSubValue(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addNewSub())}
                placeholder="Add subcategory"
                className="flex-1 px-3 py-2 bg-surface/50 border border-border rounded-xl text-text text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
              <button
                type="button"
                onClick={addNewSub}
                className="px-3 py-2 bg-primary/20 text-primary-light rounded-xl text-sm hover:bg-primary/30 transition-all"
              >
                Add
              </button>
            </div>
            {newSubs.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {newSubs.map((sub) => (
                  <span
                    key={sub}
                    className="flex items-center gap-1 px-2.5 py-1 bg-primary/10 text-primary-light text-xs rounded-full"
                  >
                    {sub}
                    <button type="button" onClick={() => setNewSubs(newSubs.filter((s) => s !== sub))}>
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="px-4 py-2 text-xs text-text-muted hover:text-text rounded-xl hover:bg-surface/50 transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs text-white bg-primary rounded-xl hover:bg-primary-hover transition-all"
            >
              Create Category
            </button>
          </div>
        </form>
      )}

      {/* Categories List */}
      <div className="space-y-3">
        {categories.map((cat) => (
          <div key={cat._id} className="glass rounded-2xl p-4 transition-all hover:bg-surface-light/20">
            {editingId === cat._id ? (
              /* Edit Mode */
              <div className="space-y-3">
                <div className="grid grid-cols-4 gap-3">
                  <div className="col-span-1">
                    <select
                      value={editIcon}
                      onChange={(e) => setEditIcon(e.target.value)}
                      className="w-full px-2 py-2 bg-surface/50 border border-border rounded-xl text-text text-center text-lg focus:outline-none focus:ring-2 focus:ring-primary/50 appearance-none"
                    >
                      {EMOJI_OPTIONS.map((e) => (
                        <option key={e} value={e}>{e}</option>
                      ))}
                    </select>
                  </div>
                  <div className="col-span-3">
                    <input
                      type="text"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="w-full px-3 py-2 bg-surface/50 border border-border rounded-xl text-text text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs text-text-muted mb-1 block">Subcategories</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newSubInput}
                      onChange={(e) => setNewSubInput(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addEditSub())}
                      placeholder="Add subcategory"
                      className="flex-1 px-3 py-2 bg-surface/50 border border-border rounded-xl text-text text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                    />
                    <button
                      type="button"
                      onClick={addEditSub}
                      className="px-3 py-2 bg-primary/20 text-primary-light rounded-xl text-sm hover:bg-primary/30 transition-all"
                    >
                      Add
                    </button>
                  </div>
                  {editSubs.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {editSubs.map((sub) => (
                        <span
                          key={sub}
                          className="flex items-center gap-1 px-2.5 py-1 bg-primary/10 text-primary-light text-xs rounded-full"
                        >
                          {sub}
                          <button onClick={() => removeEditSub(sub)}>
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex gap-2 justify-end">
                  <button
                    onClick={() => setEditingId(null)}
                    className="flex items-center gap-1 px-3 py-1.5 text-xs text-text-muted hover:text-text rounded-lg hover:bg-surface/50 transition-all"
                  >
                    <X className="w-3.5 h-3.5" /> Cancel
                  </button>
                  <button
                    onClick={() => saveEdit(cat._id)}
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
                    {cat.icon}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-text-heading">{cat.name}</p>
                    {cat.subcategories.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-1">
                        {cat.subcategories.map((sub) => (
                          <span key={sub} className="px-2 py-0.5 bg-surface/50 text-text-muted text-[10px] rounded-full border border-border">
                            {sub}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-1 shrink-0 ml-3">
                  <button
                    onClick={() => startEdit(cat)}
                    className="p-1.5 rounded-lg text-text-muted hover:text-primary-light hover:bg-primary/10 transition-all"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDelete(cat._id)}
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

      {categories.length === 0 && (
        <div className="glass rounded-2xl p-8 text-center">
          <Tag className="w-8 h-8 text-text-muted mx-auto mb-3" />
          <p className="text-text-muted text-sm">No categories yet</p>
          <p className="text-text-muted text-xs mt-1">Add your first category above</p>
        </div>
      )}
    </div>
  );
}
