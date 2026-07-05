import { useState, useMemo } from 'react';
import { format, parseISO } from 'date-fns';
import { Calendar as CalendarIcon } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Card, CardHeader } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { PageLoader } from '../components/ui/Loading';
import { Calendar, buildCalendarEvents } from '../components/ui/Calendar';

const LEGEND_COLORS = {
  present: 'bg-green-500',
  late: 'bg-amber-500',
  absent: 'bg-red-500',
  leave: 'bg-blue-500',
  pending: 'bg-violet-500',
};

const LEGEND = [
  { type: 'present', label: 'Present' },
  { type: 'late', label: 'Late' },
  { type: 'absent', label: 'Absent' },
  { type: 'leave', label: 'Approved Leave' },
  { type: 'pending', label: 'Pending Leave' },
];

export function CalendarPage() {
  const { attendance, leaves, loading } = useApp();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());

  const events = useMemo(
    () => buildCalendarEvents(attendance, leaves?.requests || []),
    [attendance, leaves]
  );

  const selectedKey = format(selectedDate, 'yyyy-MM-dd');
  const selectedEvents = events[selectedKey] || [];

  if (loading.attendance || loading.leaves) {
    return <PageLoader message="Loading calendar..." />;
  }

  return (
    <div className="animate-fade-in space-y-6">
      <div>
        <p className="mt-1 text-gray-500 dark:text-gray-400">
          View attendance and leave schedule at a glance
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader
            title="Monthly View"
            subtitle="Click a date to see details"
            action={<CalendarIcon className="h-5 w-5 text-primary-600" />}
          />
          <Calendar
            currentDate={currentDate}
            onDateChange={setCurrentDate}
            events={events}
            selectedDate={selectedDate}
            onSelectDate={setSelectedDate}
          />
        </Card>
        
        <Card className="h-80">
          <CardHeader
            title="Legend"
            subtitle="What each color means"
          />
          <div className="space-y-3 mt-10">
            {LEGEND.map(({ type, label }) => (
              <div key={type} className="flex items-center gap-3 m-5 text-sm text-gray-700 dark:text-gray-300">
                <span className={`h-4 w-4 rounded-full ${LEGEND_COLORS[type]}`} />
                {label}
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
