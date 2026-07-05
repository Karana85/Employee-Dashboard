import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  CalendarDays,
  Calendar,
  FileText,
  Users,
  Megaphone,
  UserCircle,
  Menu,
  X,
  Sun,
  Moon,
} from 'lucide-react';
import { createContext, useContext, useState } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { useApp } from '../../context/AppContext';

const SidebarContext = createContext(null);

export const useSidebar = () => useContext(SidebarContext);

export const SidebarProvider = ({ children }) => {
  const [mobileOpen, setMobileOpen] = useState(false);
  return (
    <SidebarContext.Provider value={{ mobileOpen, setMobileOpen }}>
      {children}
    </SidebarContext.Provider>
  );
};

const navItems = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/attendance', icon: CalendarDays, label: 'Attendance' },
  { to: '/calendar', icon: Calendar, label: 'Calendar' },
  { to: '/leave', icon: FileText, label: 'Leave' },
  { to: '/team', icon: Users, label: 'Team' },
  { to: '/announcements', icon: Megaphone, label: 'Announcements' },
  { to: '/profile', icon: UserCircle, label: 'Profile' },
];

export function Sidebar() {
  const { darkMode, toggleTheme } = useTheme();
  const { currentUser } = useApp();
  const { mobileOpen, setMobileOpen } = useSidebar();

  const navContent = (
    <>
      <div className="flex items-center gap-3 px-4 py-6">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-600 text-white font-bold text-lg">
          E
        </div>
        <div>
          <h1 className="font-bold text-gray-900 dark:text-white">EmpDash</h1>
          <p className="text-xs text-gray-500 dark:text-gray-400">Employee Portal</p>
        </div>
      </div>

      <nav className="flex-1 space-y-1 px-3">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            onClick={() => setMobileOpen(false)}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all ${
                isActive
                  ? 'bg-gradient-to-r from-primary-600 to-indigo-600 text-white shadow-md shadow-primary-500/25'
                  : 'text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800/80'
              }`
            }
          >
            <Icon className="h-5 w-5" />
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="border-t border-gray-200 p-4 dark:border-gray-800">
        <button
          onClick={toggleTheme}
          className="mb-3 flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
        >
          {darkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          {darkMode ? 'Light Mode' : 'Dark Mode'}
        </button>
        {currentUser && (
          <div className="flex items-center gap-3">
            <img
              src={currentUser.avatar}
              alt={currentUser.name}
              className="h-9 w-9 rounded-full bg-gray-200"
            />
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-gray-900 dark:text-white">
                {currentUser.name}
              </p>
              <p className="truncate text-xs text-gray-500 dark:text-gray-400">
                {currentUser.role}
              </p>
            </div>
          </div>
        )}
      </div>
    </>
  );

  return (
    <>
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-gray-200/80 bg-white/95 shadow-sm backdrop-blur-md transition-transform duration-300 dark:border-gray-800 dark:bg-gray-950/95 lg:translate-x-0 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <button
          onClick={() => setMobileOpen(false)}
          className="absolute right-3 top-3 rounded-lg p-1 lg:hidden"
        >
          <X className="h-5 w-5" />
        </button>
        {navContent}
      </aside>
    </>
  );
}
