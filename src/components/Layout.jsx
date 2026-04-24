import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LayoutDashboard, PlusCircle, List, Settings, LogOut, Wallet } from 'lucide-react';
import AdminUserDropdown from './AdminUserDropdown';

const navItems = [
  { path: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { path: '/add', icon: PlusCircle, label: 'Add' },
  { path: '/expenses', icon: List, label: 'Expenses' },
  { path: '/settings', icon: Settings, label: 'Settings' },
];

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Top Header — Desktop */}
      <header className="hidden md:flex items-center justify-between px-6 py-4 glass border-b border-border sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
            <Wallet className="w-5 h-5 text-white" />
          </div>
          <h1 className="text-xl font-bold gradient-text">Expensify</h1>
        </div>

        <nav className="flex items-center gap-1">
          {navItems.map(({ path, icon: Icon, label }) => {
            if (label === 'Add' && user?.role === 'admin') return null;
            return (
              <NavLink
                key={path}
                to={path}
                end={path === '/'}
                className={({ isActive }) =>
                  `flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${isActive
                    ? 'bg-primary/20 text-primary-light'
                    : 'text-text-muted hover:text-text hover:bg-white/5'
                  }`
                }
              >
                <Icon className="w-4 h-4" />
                {label}
              </NavLink>
            );
          })}
        </nav>

        <div className="flex items-center gap-3">
          {user?.role === 'admin' && <AdminUserDropdown />}
          <span className="text-sm text-text-muted hidden lg:inline">Hey, <span className="text-text font-medium">{user?.name}</span></span>
          <button
            onClick={handleLogout}
            className="p-2 rounded-lg text-text-muted hover:text-danger hover:bg-danger/10 transition-all"
            title="Logout"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Mobile Header */}
      <header className="md:hidden flex items-center justify-between px-4 py-3 glass border-b border-border sticky top-0 z-50">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
            <Wallet className="w-4 h-4 text-white" />
          </div>
          <h1 className="text-lg font-bold gradient-text">Expensify</h1>
        </div>
        <div className="flex items-center gap-2">
          {user?.role === 'admin' && <AdminUserDropdown />}
          <span className="text-xs text-text-muted">{user?.name}</span>
          <button
            onClick={handleLogout}
            className="p-1.5 rounded-lg text-text-muted hover:text-danger transition-all"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="pb-20 md:pb-6 px-4 md:px-6 pt-4 md:pt-6 max-w-6xl mx-auto">
        <Outlet />
      </main>

      {/* Bottom Nav — Mobile */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 glass border-t border-border z-50">
        <div className="flex items-center justify-around py-2">
          {navItems.map(({ path, icon: Icon, label }) => {
            if (label === 'Add' && user?.role === 'admin') return null;
            return (
              <NavLink
                key={path}
                to={path}
                end={path === '/'}
                className={({ isActive }) =>
                  `flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition-all duration-200 ${isActive
                    ? 'text-primary-light'
                    : 'text-text-muted'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <div className={`p-1.5 rounded-xl transition-all ${isActive ? 'bg-primary/20' : ''}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="text-[10px] font-medium">{label}</span>
                  </>
                )}
              </NavLink>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
