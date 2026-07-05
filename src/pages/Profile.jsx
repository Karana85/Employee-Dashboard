import { format, parseISO, differenceInYears } from 'date-fns';
import { Mail, Phone, MapPin, Calendar, Building, User, Award, Clock } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Card, CardHeader } from '../components/ui/Card';
import { PageLoader } from '../components/ui/Loading';

export function Profile() {
  const { currentUser, loading, leaves, attendance } = useApp();

  if (loading.user) {
    return <PageLoader message="Loading profile..." />;
  }

  const yearsAtCompany = differenceInYears(new Date(), parseISO(currentUser.joinDate));
  const presentDays = attendance.filter((a) => a.status === 'present' || a.status === 'late').length;
  const totalLeaveUsed = Object.values(leaves?.balance || {}).reduce((s, b) => s + b.used, 0);

  const infoItems = [
    { icon: Mail, label: 'Email', value: currentUser.email },
    { icon: Phone, label: 'Phone', value: currentUser.phone },
    { icon: MapPin, label: 'Location', value: currentUser.location },
    { icon: Building, label: 'Department', value: currentUser.department },
    { icon: User, label: 'Manager', value: currentUser.manager },
    { icon: Calendar, label: 'Join Date', value: format(parseISO(currentUser.joinDate), 'MMMM d, yyyy') },
  ];

  return (
    <div className="animate-fade-in mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">My Profile</h1>
        <p className="mt-1 text-gray-500 dark:text-gray-400">View and manage your personal information</p>
      </div>

      <Card>
        <div className="flex flex-col items-center text-center sm:flex-row sm:items-start sm:text-left">
          <img
            src={currentUser.avatar}
            alt={currentUser.name}
            className="h-24 w-24 rounded-full bg-gray-200 ring-4 ring-primary-100 transition-transform hover:scale-105 dark:ring-primary-900"
          />
          <div className="mt-4 sm:mt-0 sm:ml-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{currentUser.name}</h2>
            <p className="text-primary-600 dark:text-primary-400">{currentUser.role}</p>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{currentUser.department}</p>
            <p className="mt-2 text-xs text-gray-400">
              {yearsAtCompany}+ year{yearsAtCompany !== 1 ? 's' : ''} at company
            </p>
          </div>
        </div>
      </Card>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="!p-4 text-center animate-slide-up">
          <Award className="mx-auto h-6 w-6 text-amber-500" />
          <p className="mt-2 text-2xl font-bold text-gray-900 dark:text-white">{presentDays}</p>
          <p className="text-xs text-gray-500">Days Present</p>
        </Card>
        <Card className="!p-4 text-center animate-slide-up" style={{ animationDelay: '50ms' }}>
          <Calendar className="mx-auto h-6 w-6 text-blue-500" />
          <p className="mt-2 text-2xl font-bold text-gray-900 dark:text-white">{totalLeaveUsed}</p>
          <p className="text-xs text-gray-500">Leave Days Used</p>
        </Card>
        <Card className="!p-4 text-center animate-slide-up" style={{ animationDelay: '100ms' }}>
          <Clock className="mx-auto h-6 w-6 text-green-500" />
          <p className="mt-2 text-2xl font-bold text-gray-900 dark:text-white">
            {attendance.reduce((s, a) => s + a.hoursWorked, 0).toFixed(0)}h
          </p>
          <p className="text-xs text-gray-500">Total Hours</p>
        </Card>
      </div>

      <Card>
        <CardHeader title="Personal Information" />
        <div className="grid gap-4 sm:grid-cols-2">
          {infoItems.map(({ icon: Icon, label, value }, i) => (
            <div
              key={label}
              className="flex items-start gap-3 rounded-lg bg-gray-50 p-3 transition-colors hover:bg-gray-100 dark:bg-gray-800/50 dark:hover:bg-gray-800 animate-slide-up"
              style={{ animationDelay: `${i * 40}ms` }}
            >
              <Icon className="mt-0.5 h-5 w-5 shrink-0 text-gray-400" />
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">{label}</p>
                <p className="text-sm font-medium text-gray-900 dark:text-white">{value}</p>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
