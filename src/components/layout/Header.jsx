import { Bell, CheckCheck, FileText, Megaphone, Menu } from 'lucide-react';
import { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { useSidebar } from './Sidebar';
import { formatDistanceToNow } from 'date-fns';

const categoryIcons = { leave: FileText, announcement: Megaphone, general: Bell };

const pageTitles = {
  '/': 'Dashboard',
  '/attendance': 'Attendance',
  '/calendar': 'Calendar',
  '/leave': 'Leave Management',
  '/team': 'Team Directory',
  '/announcements': 'Announcements',
  '/profile': 'My Profile',
};

export function Header() {
  const { announcements, notificationHistory, unreadCount, markAllRead, currentUser } = useApp();
  const [showPanel, setShowPanel] = useState(false);
  const { pathname } = useLocation();
  const { setMobileOpen } = useSidebar();

  const highPriority = announcements.filter((a) => a.priority === 'high');
  const allItems = [
    ...notificationHistory.map((n) => ({ ...n, source: 'activity' })),
    ...highPriority.map((ann) => ({
      id: `ann-${ann.id}`,
      title: ann.title,
      message: `High priority · ${ann.author}`,
      type: 'warning',
      category: 'announcement',
      time: ann.date,
      read: false,
      source: 'announcement',
    })),
  ].sort((a, b) => new Date(b.time) - new Date(a.time));

  const handleOpen = () => {
    setShowPanel(!showPanel);
    if (!showPanel) markAllRead();
  };

  const title = pageTitles[pathname] || 'Dashboard';

  return (
    <header className="mb-5 flex items-center justify-between gap-4">
      <div className="flex items-center gap-3 min-w-0">
        <button
          onClick={() => setMobileOpen(true)}
          className="lg:hidden rounded-xl border border-gray-200 bg-white p-2.5 text-gray-500 shadow-sm transition-colors hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-900 dark:hover:bg-gray-800"
          aria-label="Menu"
        >
          <Menu className="h-4 w-4" />
        </button>
        <div className="min-w-0">
          <h1 className="text-xl font-bold text-gray-900 dark:text-white lg:text-2xl">{title}</h1>
        </div>
      </div>

      <div className="flex items-center gap-2">
        {currentUser && (
          <div className="flex items-center gap-2 rounded-full border border-gray-200 bg-white py-1 pl-1 pr-3 dark:border-gray-700 dark:bg-gray-900">
            <img src={currentUser.avatar} alt="" className="h-7 w-7 rounded-full" />
            <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
              {currentUser.name.split(' ')[0]}
            </span>
          </div>
        )}

        <div className="relative">
          <button
            onClick={handleOpen}
            className="relative rounded-xl border border-gray-200 bg-white p-2.5 text-gray-500 shadow-sm transition-colors hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-900 dark:hover:bg-gray-800"
            aria-label="Notifications"
          >
            <Bell className="h-4 w-4" />
            {(unreadCount > 0 || highPriority.length > 0) && (
              <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[9px] font-bold text-white">
                {unreadCount || highPriority.length}
              </span>
            )}
          </button>

          {showPanel && (
            <>
              <div className="fixed inset-0 z-30" onClick={() => setShowPanel(false)} />
              <div className="absolute right-0 z-40 mt-2 w-80 animate-slide-up rounded-2xl border border-gray-200 bg-white shadow-2xl dark:border-gray-700 dark:bg-gray-900 sm:w-96">
                <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3 dark:border-gray-800">
                  <h3 className="font-semibold text-gray-900 dark:text-white">Notifications</h3>
                  <button onClick={markAllRead} className="flex items-center gap-1 text-xs text-primary-600 hover:underline">
                    <CheckCheck className="h-3.5 w-3.5" /> Mark read
                  </button>
                </div>
                <div className="max-h-80 overflow-y-auto p-2">
                  {allItems.length === 0 ? (
                    <p className="p-6 text-center text-sm text-gray-500">No notifications yet</p>
                  ) : (
                    allItems.map((item) => {
                      const Icon = categoryIcons[item.category] || Bell;
                      return (
                        <div
                          key={item.id}
                          className={`mb-1 rounded-xl p-3 transition-colors hover:bg-gray-50 dark:hover:bg-gray-800 ${
                            !item.read ? 'bg-blue-50/60 dark:bg-blue-900/10' : ''
                          }`}
                        >
                          <div className="flex gap-3">
                            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary-100 dark:bg-primary-900/30">
                              <Icon className="h-4 w-4 text-primary-600" />
                            </div>
                            <div className="min-w-0">
                              <p className="text-sm font-semibold text-gray-900 dark:text-white">{item.title}</p>
                              <p className="mt-0.5 text-xs text-gray-500">{item.message}</p>
                              <p className="mt-1 text-[10px] text-gray-400">
                                {formatDistanceToNow(new Date(item.time), { addSuffix: true })}
                              </p>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
