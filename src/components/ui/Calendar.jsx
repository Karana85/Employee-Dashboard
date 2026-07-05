import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  isToday,
  parseISO,
  addMonths,
  subMonths,
} from 'date-fns';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const EVENT_COLORS = {
  present: 'bg-green-500',
  late: 'bg-amber-500',
  absent: 'bg-red-500',
  leave: 'bg-blue-500',
  pending: 'bg-violet-500',
  weekend: 'bg-gray-300 dark:bg-gray-600',
};

export function Calendar({
  currentDate,
  onDateChange,
  events = {},
  selectedDate,
  onSelectDate,
}) {
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const calendarStart = startOfWeek(monthStart);
  const calendarEnd = endOfWeek(monthEnd);
  const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

  return (
    <div className="select-none">
      <div className="mb-4 flex items-center justify-between">
        <button
          onClick={() => onDateChange(subMonths(currentDate, 1))}
          className="rounded-lg p-2 text-gray-500 transition-colors hover:bg-gray-100 dark:hover:bg-gray-800"
          aria-label="Previous month"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          {format(currentDate, 'MMMM yyyy')}
        </h3>
        <button
          onClick={() => onDateChange(addMonths(currentDate, 1))}
          className="rounded-lg p-2 text-gray-500 transition-colors hover:bg-gray-100 dark:hover:bg-gray-800"
          aria-label="Next month"
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>

      <div className="mb-2 grid grid-cols-7 gap-1">
        {DAY_LABELS.map((day) => (
          <div
            key={day}
            className="py-2 text-center text-xs font-medium text-gray-500 dark:text-gray-400"
          >
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {days.map((day) => {
          const dateKey = format(day, 'yyyy-MM-dd');
          const dayEvents = events[dateKey] || [];
          const inMonth = isSameMonth(day, currentDate);
          const selected = selectedDate && isSameDay(day, selectedDate);
          const today = isToday(day);

          return (
            <button
              key={dateKey}
              onClick={() => onSelectDate?.(day)}
              className={`relative flex min-h-[3.5rem] flex-col items-center rounded-lg p-1 text-sm transition-all sm:min-h-[4.5rem] ${
                inMonth
                  ? 'text-gray-900 hover:bg-gray-100 dark:text-white dark:hover:bg-gray-800'
                  : 'text-gray-300 dark:text-gray-600'
              } ${selected ? 'bg-primary-100 ring-2 ring-primary-500 dark:bg-primary-900/40' : ''} ${
                today && !selected ? 'ring-1 ring-primary-400' : ''
              }`}
            >
              <span
                className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-medium sm:text-sm ${
                  today ? 'bg-primary-600 text-white' : ''
                }`}
              >
                {format(day, 'd')}
              </span>
              {dayEvents.length > 0 && (
                <div className="mt-0.5 flex flex-wrap justify-center gap-0.5">
                  {dayEvents.slice(0, 3).map((evt, i) => (
                    <span
                      key={i}
                      className={`h-1.5 w-1.5 rounded-full ${EVENT_COLORS[evt.type] || 'bg-gray-400'}`}
                      title={evt.label}
                    />
                  ))}
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export function buildCalendarEvents(attendance = [], leaveRequests = []) {
  const events = {};

  const addEvent = (dateKey, event) => {
    if (!events[dateKey]) events[dateKey] = [];
    events[dateKey].push(event);
  };

  attendance.forEach((record) => {
    if (record.status !== 'weekend') {
      addEvent(record.date, {
        type: record.status,
        label: `${record.status}${record.checkIn ? ` (${record.checkIn})` : ''}`,
      });
    }
  });

  leaveRequests.forEach((request) => {
    const start = parseISO(request.startDate);
    const end = parseISO(request.endDate);
    const days = eachDayOfInterval({ start, end });
    days.forEach((day) => {
      addEvent(format(day, 'yyyy-MM-dd'), {
        type: request.status === 'pending' ? 'pending' : 'leave',
        label: `${request.type} leave (${request.status})`,
      });
    });
  });

  return events;
}
