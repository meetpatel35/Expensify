import { useState, useEffect } from 'react';
import api from '../lib/api';
import { useAuth } from '../context/AuthContext';
import { Users, ChevronDown } from 'lucide-react';

export default function AdminUserDropdown() {
  const { user, adminTargetUser, setAdminTargetUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user?.role === 'admin') {
      fetchUsers();
    }
  }, [user]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/users');
      setUsers(data);
    } catch (err) {
      console.error('Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  if (user?.role !== 'admin') return null;

  return (
    <div className="relative flex items-center">
      <div className="absolute left-3 pt-0.5 pointer-events-none text-text-muted">
        <Users className="w-4 h-4" />
      </div>
      <select
        value={adminTargetUser}
        onChange={(e) => setAdminTargetUser(e.target.value)}
        className="appearance-none bg-surface/50 border border-primary/30 text-sm font-medium text-text pl-9 pr-8 py-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all min-w-[140px]"
        disabled={loading}
      >
        <option value="all">Total Platform Data (All Users)</option>
        {users.map((u) => (
          <option key={u._id} value={u._id}>
            {u.name} {u.email === 'admin@expensify.com' ? '(Admin)' : ''}
          </option>
        ))}
      </select>
      <div className="absolute right-3 pt-0.5 pointer-events-none text-text-muted">
        <ChevronDown className="w-4 h-4" />
      </div>
    </div>
  );
}
