import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { format, parseISO } from 'date-fns';
import { api } from '../services/api';
import { getBusinessDays, computeLeaveBalance } from '../utils/leaveUtils';

const AppContext = createContext(null);
const MAX_HISTORY = 25;
const TOAST_DURATION = 6000;
const LEAVE_TOTALS = { annual: 20, sick: 10, personal: 5 };

export function AppProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [employees, setEmployees] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [leaves, setLeaves] = useState(null);
  const [announcements, setAnnouncements] = useState([]);
  const [toasts, setToasts] = useState([]);
  const [notificationHistory, setNotificationHistory] = useState([]);
  const [activityFeed, setActivityFeed] = useState([]);
  const [loading, setLoading] = useState({
    user: true,
    employees: true,
    attendance: true,
    leaves: true,
    announcements: true,
  });

  const addActivity = useCallback((activity) => {
    setActivityFeed((prev) => [
      { id: Date.now(), time: new Date().toISOString(), ...activity },
      ...prev,
    ].slice(0, 10));
  }, []);

  const addNotification = useCallback((payload) => {
    const notification = {
      id: Date.now(),
      time: new Date().toISOString(),
      read: false,
      type: 'info',
      category: 'general',
      title: 'Notification',
      message: typeof payload === 'string' ? payload : payload.message,
      ...(typeof payload === 'string' ? {} : payload),
    };

    setToasts((prev) => [...prev, notification]);
    setNotificationHistory((prev) => [notification, ...prev].slice(0, MAX_HISTORY));

    setTimeout(() => {
      setToasts((prev) => prev.filter((n) => n.id !== notification.id));
    }, TOAST_DURATION);

    return notification;
  }, []);

  const markAllRead = useCallback(() => {
    setNotificationHistory((prev) => prev.map((n) => ({ ...n, read: true })));
  }, []);

  const removeNotification = useCallback((id) => {
    setToasts((prev) => prev.filter((n) => n.id !== id));
    setNotificationHistory((prev) => prev.filter((n) => n.id !== id));
  }, []);

  const clearToast = useCallback((id) => {
    setToasts((prev) => prev.filter((n) => n.id !== id));
  }, []);

  useEffect(() => {
    api.getCurrentUser().then((data) => {
      setCurrentUser(data);
      setLoading((l) => ({ ...l, user: false }));
    });
    api.getEmployees().then((data) => {
      setEmployees(data);
      setLoading((l) => ({ ...l, employees: false }));
    });
    api.getAttendance().then((data) => {
      setAttendance(data);
      setLoading((l) => ({ ...l, attendance: false }));
    });
    api.getLeaves().then((data) => {
      setLeaves(data);
      setLoading((l) => ({ ...l, leaves: false }));
    });
    api.getAnnouncements().then((data) => {
      setAnnouncements(data);
      setLoading((l) => ({ ...l, announcements: false }));
    });
  }, []);

  const submitLeaveRequest = useCallback(async (request) => {
    const newRequest = await api.submitLeaveRequest(request);
    const days = newRequest.days;
    const dateRange = `${format(parseISO(request.startDate), 'MMM d')} – ${format(parseISO(request.endDate), 'MMM d, yyyy')}`;

    setLeaves((prev) => {
      const requests = [newRequest, ...prev.requests];
      return {
        balance: computeLeaveBalance(LEAVE_TOTALS, requests),
        requests,
      };
    });

    addNotification({
      type: 'success',
      category: 'leave',
      title: 'Leave Request Submitted',
      message: `Your ${request.type} leave (${days} day${days > 1 ? 's' : ''}) for ${dateRange} is pending approval.`,
    });

    addActivity({
      type: 'leave',
      title: 'Leave request submitted',
      detail: `${request.type} leave · ${dateRange} · ${days} day${days > 1 ? 's' : ''}`,
      status: 'pending',
    });

    return newRequest;
  }, [addNotification, addActivity]);

  const unreadCount = notificationHistory.filter((n) => !n.read).length;

  return (
    <AppContext.Provider
      value={{
        currentUser,
        employees,
        attendance,
        leaves,
        announcements,
        notifications: toasts,
        notificationHistory,
        activityFeed,
        unreadCount,
        loading,
        addNotification,
        addActivity,
        markAllRead,
        removeNotification,
        clearToast,
        submitLeaveRequest,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
}
