import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { format, parseISO } from 'date-fns';
import { useApp } from '../context/AppContext';
import { Card, CardHeader } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { PageLoader } from '../components/ui/Loading';

const STATUS_COLORS = {
  present: '#22c55e',
  late: '#f59e0b',
  absent: '#ef4444',
  weekend: '#9ca3af',
};

const STATUS_VARIANTS = {
  present: 'success',
  late: 'warning',
  absent: 'error',
  weekend: 'info',
};

export function Attendance() {
  const { attendance, loading } = useApp();

  if (loading.attendance) {
    return <PageLoader message="Loading attendance data..." />;
  }

  const workDays = attendance.filter((a) => a.status !== 'weekend');
  const statusCounts = workDays.reduce((acc, a) => {
    acc[a.status] = (acc[a.status] || 0) + 1;
    return acc;
  }, {});

  const pieData = Object.entries(statusCounts).map(([name, value]) => ({ name, value }));
  const chartData = attendance
    .filter((a) => a.status !== 'weekend')
    .slice(0, 7)
    .reverse()
    .map((a) => ({
      date: format(parseISO(a.date), 'MMM d'),
      hours: a.hoursWorked,
    }));

  const totalHours = workDays.reduce((sum, a) => sum + a.hoursWorked, 0);
  const avgHours = workDays.length > 0 ? (totalHours / workDays.filter((a) => a.hoursWorked > 0).length).toFixed(1) : 0;

  return (
    <div className="animate-fade-in space-y-6">
      <div>
        <p className="mt-1 text-gray-500 dark:text-gray-400">Track your attendance and working hours</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="!p-4 text-center">
          <p className="text-sm text-gray-500 dark:text-gray-400">Days Present</p>
          <p className="text-3xl font-bold text-green-600">{statusCounts.present || 0}</p>
        </Card>
        <Card className="!p-4 text-center">
          <p className="text-sm text-gray-500 dark:text-gray-400">Total Hours</p>
          <p className="text-3xl font-bold text-primary-600">{totalHours.toFixed(1)}h</p>
        </Card>
        <Card className="!p-4 text-center">
          <p className="text-sm text-gray-500 dark:text-gray-400">Avg Hours/Day</p>
          <p className="text-3xl font-bold text-amber-600">{avgHours}h</p>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader title="Hours Worked" subtitle="Last 7 working days" />
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-700" />
              <XAxis dataKey="date" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'var(--tooltip-bg, #fff)',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                }}
              />
              <Bar dataKey="hours" fill="#3b82f6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <Card>
          <CardHeader title="Attendance Breakdown" />
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={90}
                paddingAngle={4}
                dataKey="value"
                label={({ name, value }) => `${name}: ${value}`}
              >
                {pieData.map((entry) => (
                  <Cell key={entry.name} fill={STATUS_COLORS[entry.name] || '#9ca3af'} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </Card>
      </div>

      <Card>
        <CardHeader title="Attendance Log" />
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700">
                <th className="pb-3 text-left font-medium text-gray-500 dark:text-gray-400">Date</th>
                <th className="pb-3 text-left font-medium text-gray-500 dark:text-gray-400">Check In</th>
                <th className="pb-3 text-left font-medium text-gray-500 dark:text-gray-400">Check Out</th>
                <th className="pb-3 text-left font-medium text-gray-500 dark:text-gray-400">Hours</th>
                <th className="pb-3 text-left font-medium text-gray-500 dark:text-gray-400">Status</th>
              </tr>
            </thead>
            <tbody>
              {attendance.map((record) => (
                <tr key={record.id} className="border-b border-gray-100 dark:border-gray-800">
                  <td className="py-3 text-gray-900 dark:text-white">
                    {format(parseISO(record.date), 'EEE, MMM d')}
                  </td>
                  <td className="py-3 text-gray-600 dark:text-gray-300">{record.checkIn || '—'}</td>
                  <td className="py-3 text-gray-600 dark:text-gray-300">{record.checkOut || '—'}</td>
                  <td className="py-3 text-gray-600 dark:text-gray-300">
                    {record.hoursWorked > 0 ? `${record.hoursWorked}h` : '—'}
                  </td>
                  <td className="py-3">
                    <Badge variant={STATUS_VARIANTS[record.status] || 'info'}>
                      {record.status}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
