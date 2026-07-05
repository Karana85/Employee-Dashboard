import { Link } from 'react-router-dom';
import { useMemo } from 'react';
import {
  CalendarDays,
  FileText,
  Users,
  Megaphone,
  Clock,
  TrendingUp,
  CheckCircle2,
  ArrowUpRight,
  Zap,
  BarChart3,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { useApp } from '../context/AppContext';
import { Card, CardHeader } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { PageLoader } from '../components/ui/Loading';
import { buildCalendarEvents } from '../components/ui/Calendar';
import { format, parseISO } from 'date-fns';

const STATUS_VARIANTS = { approved: 'success', pending: 'warning', rejected: 'error' };

const QUICK_ACTIONS = [
  { to: '/leave', icon: FileText, label: 'Request Leave', desc: 'Apply for time off', color: 'bg-emerald-500' },
  { to: '/attendance', icon: CalendarDays, label: 'Attendance', desc: 'View your logs', color: 'bg-blue-500' },
  { to: '/team', icon: Users, label: 'Team', desc: 'Find colleagues', color: 'bg-violet-500' },
  { to: '/announcements', icon: Megaphone, label: 'News', desc: 'Company updates', color: 'bg-orange-500' },
];

export function Dashboard() {
  const { attendance, leaves, announcements, employees, loading } = useApp();

  const calendarEvents = useMemo(
    () => buildCalendarEvents(attendance, leaves?.requests || []),
    [attendance, leaves]
  );

  const trendData = useMemo(
    () =>
      attendance
        .filter((a) => a.status !== 'weekend' && a.hoursWorked > 0)
        .slice(0, 7)
        .reverse()
        .map((a) => ({
          date: format(parseISO(a.date), 'MMM d'),
          hours: a.hoursWorked,
          fill: a.status === 'late' ? '#f59e0b' : '#3b82f6',
        })),
    [attendance]
  );

  if (loading.user || loading.attendance || loading.leaves) {
    return <PageLoader message="Loading dashboard..." />;
  }

  const workDays = attendance.filter((a) => a.status !== 'weekend');
  const presentCount = workDays.filter((a) => a.status === 'present').length;
  const lateDays = workDays.filter((a) => a.status === 'late').length;
  const absentDays = workDays.filter((a) => a.status === 'absent').length;
  const presentDays = presentCount + lateDays;
  const attendanceRate = workDays.length ? Math.round((presentDays / workDays.length) * 100) : 0;
  const totalHours = workDays.reduce((sum, a) => sum + a.hoursWorked, 0);
  const weekHours = attendance.filter((a) => a.status !== 'weekend').slice(0, 5).reduce((s, a) => s + a.hoursWorked, 0);
  const totalLeaveRemaining = Object.values(leaves?.balance || {}).reduce((s, b) => s + b.remaining, 0);
  const pendingLeaves = leaves?.requests.filter((r) => r.status === 'pending') || [];
  const highAnnouncements = announcements.filter((a) => a.priority === 'high');
  const todayRecord = attendance.find((a) => a.date === format(new Date(), 'yyyy-MM-dd'));
  const todayStatus = todayRecord?.status || 'weekend';

  return (
    <div className="dashboard-grid animate-fade-in space-y-6">
      <section className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <KpiCard
          icon={CheckCircle2}
          label="Present Days"
          value={presentCount}
          sub={`${lateDays} late · ${absentDays} absent`}
          accent="emerald"
          delay={0}
        />
        <KpiCard
          icon={Clock}
          label="Total Hours"
          value={`${totalHours.toFixed(0)}h`}
          sub={`Avg ${(totalHours / (presentDays || 1)).toFixed(1)}h per day`}
          accent="blue"
          delay={60}
        />
        <KpiCard
          icon={FileText}
          label="Annual Leave"
          value={leaves?.balance.annual.remaining}
          sub={`${pendingLeaves.length} pending request${pendingLeaves.length !== 1 ? 's' : ''}`}
          accent="amber"
          delay={120}
        />
        <KpiCard
          icon={Megaphone}
          label="Announcements"
          value={announcements.length}
          sub={`${highAnnouncements.length} high priority`}
          accent="violet"
          delay={180}
        />
      </section>

      <section className="grid gap-4 lg:grid-cols-12 lg:gap-5">
        <Card className="lg:col-span-8" hover shine>
          <CardHeader
            icon={BarChart3}
            title="Working Hours"
            subtitle="Daily hours over the last 7 working days"
            action={
              <Link to="/attendance" className="flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-700">
                Full report <ArrowUpRight className="h-3.5 w-3.5" />
              </Link>
            }
            compact
          />
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={trendData} barSize={28}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
              <XAxis dataKey="date" tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} domain={[0, 12]} />
              <Tooltip
                cursor={{ fill: 'rgba(59,130,246,0.06)', radius: 8 }}
                contentStyle={{ borderRadius: 12, border: '1px solid #e2e8f0', boxShadow: '0 8px 24px rgba(0,0,0,0.08)' }}
                formatter={(v) => [`${v}h`, 'Hours']}
              />
              <Bar dataKey="hours" radius={[6, 6, 0, 0]}>
                {trendData.map((entry, i) => (
                  <Cell key={i} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <Card className="lg:col-span-4" hover shine>
          <CardHeader icon={TrendingUp} title="Attendance" subtitle="Current period" compact />
          <div className="flex flex-col items-center">
            <div className="relative flex h-36 w-36 items-center justify-center">
              <svg className="h-full w-full -rotate-90" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="42" fill="none" stroke="#e2e8f0" strokeWidth="8" className="dark:stroke-slate-700" />
                <circle
                  cx="50" cy="50" r="42" fill="none"
                  stroke="url(#ringGrad)" strokeWidth="8" strokeLinecap="round"
                  strokeDasharray={`${attendanceRate * 2.64} 264`}
                />
                <defs>
                  <linearGradient id="ringGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#3b82f6" />
                    <stop offset="100%" stopColor="#8b5cf6" />
                  </linearGradient>
                </defs>
              </svg>
              <div className="absolute text-center">
                <p className="text-3xl font-bold text-slate-900 dark:text-white">{attendanceRate}%</p>
                <p className="text-[10px] font-medium uppercase tracking-wider text-slate-400">On time</p>
              </div>
            </div>
            <div className="mt-2 grid w-full grid-cols-3 gap-2">
              <MiniStat label="Present" value={presentCount} color="text-emerald-600" bg="bg-emerald-50 dark:bg-emerald-950/40" />
              <MiniStat label="Late" value={lateDays} color="text-amber-600" bg="bg-amber-50 dark:bg-amber-950/40" />
              <MiniStat label="Absent" value={absentDays} color="text-red-600" bg="bg-red-50 dark:bg-red-950/40" />
            </div>
            {todayRecord && todayStatus !== 'weekend' && (
              <div className="mt-3 w-full rounded-xl bg-slate-50 px-3 py-2.5 text-center dark:bg-slate-800/60">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Today</p>
                <p className="mt-0.5 text-sm font-semibold text-slate-800 dark:text-slate-200">
                  {todayRecord.checkIn || '—'} → {todayRecord.checkOut || 'In progress'}
                </p>
              </div>
            )}
            {todayStatus === 'weekend' && (
              <div className="mt-3 w-full rounded-xl bg-slate-50 px-3 py-2.5 text-center dark:bg-slate-800/60">
                <p className="text-sm font-medium text-slate-500">Enjoy your weekend!</p>
              </div>
            )}
          </div>
        </Card>

        <Card className="lg:col-span-4" hover>
          <CardHeader
            icon={FileText}
            title="Leave Balance"
            subtitle="Days remaining by type"
            action={<Link to="/leave" className="text-xs font-semibold text-blue-600 hover:underline">Apply</Link>}
            compact
          />
          <div className="space-y-4">
            {Object.entries(leaves?.balance || {}).map(([type, data]) => (
              <LeaveBar key={type} type={type} data={data} />
            ))}
          </div>
        </Card>

        <Card className="lg:col-span-4" hover>
          <CardHeader icon={Zap} title="Quick Actions" subtitle="Jump to key features" compact />
          <div className="grid grid-cols-2 gap-2.5">
            {QUICK_ACTIONS.map(({ to, icon: Icon, label, desc, color }) => (
              <Link
                key={to}
                to={to}
                className="group flex flex-col gap-2 rounded-xl border border-slate-100 bg-slate-50/80 p-3.5 transition-all hover:border-blue-200 hover:bg-white hover:shadow-md dark:border-slate-800 dark:bg-slate-800/40 dark:hover:border-blue-800 dark:hover:bg-slate-800"
              >
                <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${color} text-white shadow-sm`}>
                  <Icon className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-800 group-hover:text-blue-600 dark:text-slate-200">{label}</p>
                  <p className="text-[10px] text-slate-400">{desc}</p>
                </div>
              </Link>
            ))}
          </div>
        </Card>


        <Card className="lg:col-span-4" hover>
          <CardHeader
            icon={Users}
            title="Team Directory"
            subtitle={`${employees.length} members`}
            action={<Link to="/team" className="text-xs font-semibold text-blue-600 hover:underline">View all</Link>}
            compact
          />
          <div className="flex items-center gap-1 mb-4">
            {employees.slice(0, 6).map((emp, i) => (
              <img
                key={emp.id}
                src={emp.avatar}
                alt={emp.name}
                title={emp.name}
                className="h-9 w-9 rounded-full border-2 border-white object-cover shadow-sm dark:border-slate-900"
                style={{ marginLeft: i > 0 ? '-8px' : 0, zIndex: 6 - i }}
              />
            ))}
            {employees.length > 6 && (
              <div className="flex h-9 w-9 items-center justify-center rounded-full border-2 border-white bg-slate-100 text-[10px] font-bold text-slate-600 dark:border-slate-900 dark:bg-slate-800 dark:text-slate-300" style={{ marginLeft: '-8px' }}>
                +{employees.length - 6}
              </div>
            )}
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div className="rounded-xl bg-violet-50 p-3 dark:bg-violet-950/30">
              <p className="text-lg font-bold text-violet-700 dark:text-violet-300">{[...new Set(employees.map((e) => e.department))].length}</p>
              <p className="text-[10px] font-medium text-violet-500">Departments</p>
            </div>
            <div className="rounded-xl bg-emerald-50 p-3 dark:bg-emerald-950/30">
              <p className="text-lg font-bold text-emerald-700 dark:text-emerald-300">{employees.filter((e) => e.status === 'active').length}</p>
              <p className="text-[10px] font-medium text-emerald-500">Active now</p>
            </div>
          </div>
        </Card>


        <Card className="lg:col-span-12" hover shine>
          <CardHeader
            icon={Megaphone}
            title="Company Announcements"
            subtitle={`${announcements.length} total · ${highAnnouncements.length} urgent`}
            compact
          />
          <div className="grid gap-3 sm:grid-cols-3">
            {announcements.slice(0, 3).map((ann) => (
              <Link
                key={ann.id}
                to="/announcements"
                className="group relative overflow-hidden rounded-2xl border border-slate-100 bg-slate-50/50 p-4 transition-all hover:border-blue-200 hover:bg-white hover:shadow-lg dark:border-slate-800 dark:bg-slate-800/30 dark:hover:border-blue-800"
              >
                <div className={`mb-3 inline-flex rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${
                  ann.priority === 'high' ? 'bg-red-100 text-red-600 dark:bg-red-950/50 dark:text-red-400'
                    : ann.priority === 'medium' ? 'bg-amber-100 text-amber-600 dark:bg-amber-950/50 dark:text-amber-400'
                    : 'bg-emerald-100 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400'
                }`}>
                  {ann.priority}
                </div>
                <h3 className="line-clamp-2 text-sm font-semibold leading-snug text-slate-900 group-hover:text-blue-600 dark:text-white">
                  {ann.title}
                </h3>
                <p className="mt-2 text-[11px] text-slate-400">{ann.author} · {format(parseISO(ann.date), 'MMM d, yyyy')}</p>
                <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-slate-500 dark:text-slate-400">{ann.content}</p>
                <ArrowUpRight className="absolute right-3 top-3 h-4 w-4 text-slate-300 transition-all group-hover:text-blue-500 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </Link>
            ))}
          </div>
        </Card>
      </section>
    </div>
  );
}

const accentMap = {
  emerald: { icon: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400', border: 'hover:border-emerald-200 dark:hover:border-emerald-800' },
  blue: { icon: 'bg-blue-100 text-blue-600 dark:bg-blue-950 dark:text-blue-400', border: 'hover:border-blue-200 dark:hover:border-blue-800' },
  amber: { icon: 'bg-amber-100 text-amber-600 dark:bg-amber-950 dark:text-amber-400', border: 'hover:border-amber-200 dark:hover:border-amber-800' },
  violet: { icon: 'bg-violet-100 text-violet-600 dark:bg-violet-950 dark:text-violet-400', border: 'hover:border-violet-200 dark:hover:border-violet-800' },
};

function KpiCard({ icon: Icon, label, value, sub, accent, delay = 0 }) {
  const a = accentMap[accent];
  return (
    <div
      className={`animate-slide-up rounded-2xl border border-slate-200/70 bg-white p-4 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg dark:border-slate-800 dark:bg-slate-900 ${a.border}`}
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className={`mb-3 flex h-9 w-9 items-center justify-center rounded-xl ${a.icon}`}>
        <Icon className="h-4 w-4" />
      </div>
      <p className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">{value}</p>
      <p className="mt-0.5 text-xs font-semibold text-slate-600 dark:text-slate-400">{label}</p>
      <p className="mt-1 text-[10px] text-slate-400">{sub}</p>
    </div>
  );
}

function MiniStat({ label, value, color, bg }) {
  return (
    <div className={`rounded-xl ${bg} px-2 py-2 text-center`}>
      <p className={`text-base font-bold ${color}`}>{value}</p>
      <p className="text-[9px] font-medium uppercase tracking-wide text-slate-400">{label}</p>
    </div>
  );
}

const leaveColors = { annual: '#3b82f6', sick: '#8b5cf6', personal: '#f59e0b' };

function LeaveBar({ type, data }) {
  const pct = (data.remaining / data.total) * 100;
  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between">
        <span className="text-xs font-semibold capitalize text-slate-700 dark:text-slate-300">{type}</span>
        <span className="text-xs font-bold text-slate-900 dark:text-white">
          {data.remaining} <span className="font-normal text-slate-400">/ {data.total} left</span>
        </span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${pct}%`, backgroundColor: leaveColors[type] || '#3b82f6' }}
        />
      </div>
      <p className="mt-1 text-[10px] text-slate-400">{data.used} days used</p>
    </div>
  );
}
