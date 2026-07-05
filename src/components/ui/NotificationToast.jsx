import { X, CheckCircle, AlertCircle, Info, FileText } from 'lucide-react';
import { useApp } from '../../context/AppContext';

const icons = {
  success: CheckCircle,
  error: AlertCircle,
  info: Info,
  warning: AlertCircle,
  leave: FileText,
};

const styles = {
  success: 'border-green-200 bg-green-50 text-green-900 dark:border-green-800 dark:bg-green-900/30 dark:text-green-200',
  error: 'border-red-200 bg-red-50 text-red-900 dark:border-red-800 dark:bg-red-900/30 dark:text-red-200',
  info: 'border-blue-200 bg-blue-50 text-blue-900 dark:border-blue-800 dark:bg-blue-900/30 dark:text-blue-200',
  warning: 'border-amber-200 bg-amber-50 text-amber-900 dark:border-amber-800 dark:bg-amber-900/30 dark:text-amber-200',
  leave: 'border-violet-200 bg-violet-50 text-violet-900 dark:border-violet-800 dark:bg-violet-900/30 dark:text-violet-200',
};

export function NotificationToast() {
  const { notifications, clearToast } = useApp();

  if (notifications.length === 0) return null;

  return (
    <div className="fixed right-4 top-4 z-[60] flex w-full max-w-sm flex-col gap-2 px-4 sm:px-0">
      {notifications.map((notification) => {
        const iconKey = notification.category === 'leave' ? 'leave' : notification.type;
        const Icon = icons[iconKey] || Info;
        const styleKey = notification.category === 'leave' ? 'leave' : notification.type;

        return (
          <div
            key={notification.id}
            className={`flex items-start gap-3 rounded-xl border px-4 py-3 shadow-xl animate-slide-up ${styles[styleKey] || styles.info}`}
            role="alert"
          >
            <Icon className="mt-0.5 h-5 w-5 shrink-0" />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold">{notification.title}</p>
              <p className="mt-0.5 text-sm opacity-90">{notification.message}</p>
            </div>
            <button
              onClick={() => clearToast(notification.id)}
              className="shrink-0 rounded p-0.5 hover:bg-black/5 dark:hover:bg-white/10"
              aria-label="Dismiss"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
