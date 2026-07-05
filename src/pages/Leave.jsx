import { useState } from 'react';
import { parseISO, format } from 'date-fns';
import { Calendar, Send } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Card, CardHeader } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Input, Select, Textarea } from '../components/ui/Input';
import { PageLoader } from '../components/ui/Loading';
import {
  getBusinessDays,
  validateLeaveReason,
  validateLeaveBalance,
  sortLeaveRequests,
  pluralize,
} from '../utils/leaveUtils';

const LEAVE_TYPES = [
  { value: 'annual', label: 'Annual Leave' },
  { value: 'sick', label: 'Sick Leave' },
  { value: 'personal', label: 'Personal Leave' },
];

const STATUS_VARIANTS = {
  approved: 'success',
  pending: 'warning',
  rejected: 'error',
};

export function Leave() {
  const { leaves, loading, submitLeaveRequest, addNotification } = useApp();
  const [form, setForm] = useState({
    startDate: '',
    endDate: '',
    type: 'annual',
    reason: '',
  });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [lastSubmitted, setLastSubmitted] = useState(null);

  if (loading.leaves) {
    return <PageLoader message="Loading leave data..." />;
  }

  const requestedDays =
    form.startDate && form.endDate
      ? getBusinessDays(form.startDate, form.endDate)
      : 0;

  const sortedRequests = sortLeaveRequests(leaves.requests);

  const validate = () => {
    const newErrors = {};
    if (!form.startDate) newErrors.startDate = 'Start date is required';
    if (!form.endDate) newErrors.endDate = 'End date is required';
    if (form.startDate && form.endDate && form.startDate > form.endDate) {
      newErrors.endDate = 'End date must be on or after start date';
    }
    if (form.startDate && form.endDate && requestedDays <= 0) {
      newErrors.endDate = 'Selected range has no business days';
    }

    const reasonError = validateLeaveReason(form.reason);
    if (reasonError) newErrors.reason = reasonError;

    const balanceError = validateLeaveBalance(leaves.balance, form.type, requestedDays);
    if (!newErrors.endDate && !newErrors.startDate && balanceError) {
      newErrors.balance = balanceError;
    }

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) {
      addNotification({
        type: 'error',
        title: 'Cannot Submit Request',
        message: newErrors.balance || Object.values(newErrors)[0],
      });
    }
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    try {
      const result = await submitLeaveRequest(form);
      setLastSubmitted(result);
      setForm({ startDate: '', endDate: '', type: 'annual', reason: '' });
      setErrors({});
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="animate-fade-in space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Leave Management</h1>
        <p className="mt-1 text-gray-500 dark:text-gray-400">
          Track balances and submit leave requests
        </p>
      </div>

      {lastSubmitted && (
        <div className="animate-slide-up rounded-xl border border-green-200 bg-green-50 p-4 dark:border-green-800 dark:bg-green-900/20">
          <p className="font-semibold text-green-800 dark:text-green-300">
            Leave request submitted successfully!
          </p>
          <p className="mt-1 text-sm text-green-700 dark:text-green-400">
            {lastSubmitted.type} leave · {lastSubmitted.days}{' '}
            {pluralize(lastSubmitted.days, 'day')} ·{' '}
            {format(parseISO(lastSubmitted.startDate), 'MMM d')} –{' '}
            {format(parseISO(lastSubmitted.endDate), 'MMM d, yyyy')} ·{' '}
            <Badge variant="warning">{lastSubmitted.status}</Badge>
          </p>
          <p className="mt-1 text-xs text-green-600 dark:text-green-500">
            Reason: {lastSubmitted.reason}
          </p>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-3">
        {Object.entries(leaves.balance).map(([type, data]) => (
          <Card key={type} className="!p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-50 dark:bg-primary-900/20">
                <Calendar className="h-5 w-5 text-primary-600" />
              </div>
              <div>
                <p className="text-sm capitalize text-gray-500 dark:text-gray-400">{type} Leave</p>
                <p className="text-xl font-bold text-gray-900 dark:text-white">
                  {data.remaining}{' '}
                  <span className="text-sm font-normal text-gray-500">remaining</span>
                </p>
              </div>
            </div>
            <div className="mt-3 h-2 overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
              <div
                className="h-full rounded-full bg-primary-500 transition-all"
                style={{ width: `${(data.used / data.total) * 100}%` }}
              />
            </div>
            <p className="mt-1.5 text-xs text-gray-500">
              {data.used} of {data.total} {pluralize(data.total, 'day')} used · {data.remaining}{' '}
              {pluralize(data.remaining, 'day')} left
            </p>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2 ">
        <Card className="md:h-100">
          <CardHeader title="Request Leave" subtitle="All fields are required" />
          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="grid gap-3 sm:grid-cols-2">
              <Input
                label="Start Date"
                type="date"
                value={form.startDate}
                onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                error={errors.startDate}
                min={new Date().toISOString().split('T')[0]}
              />
              <Input
                label="End Date"
                type="date"
                value={form.endDate}
                onChange={(e) => setForm({ ...form, endDate: e.target.value })}
                error={errors.endDate}
                min={form.startDate || new Date().toISOString().split('T')[0]}
              />
            </div>
            <Select
              label="Leave Type"
              value={form.type}
              onChange={(e) => setForm({ ...form, type: e.target.value })}
            >
              {LEAVE_TYPES.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label} ({leaves.balance[t.value]?.remaining ?? 0}{' '}
                  {pluralize(leaves.balance[t.value]?.remaining ?? 0, 'day')} left)
                </option>
              ))}
            </Select>
            <Textarea
              label="Reason"
              placeholder="e.g. Family wedding ceremony out of town"
              value={form.reason}
              onChange={(e) => setForm({ ...form, reason: e.target.value })}
              error={errors.reason}
              rows={1}
            />
            {errors.balance && (
              <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600 dark:bg-red-900/20 dark:text-red-400">
                {errors.balance}
              </p>
            )}
            {requestedDays > 0 && (
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Requesting <strong>{requestedDays}</strong> business{' '}
                {pluralize(requestedDays, 'day')}
                {leaves.balance[form.type] && (
                  <> · {leaves.balance[form.type].remaining - requestedDays} will remain after approval</>
                )}
              </p>
            )}
            <Button type="submit" loading={submitting} className="w-full sm:w-auto">
              <Send className="h-4 w-4" />
              Submit Request
            </Button>
          </form>
        </Card>

        <Card>
          <CardHeader title="Leave Summary" subtitle={`${sortedRequests.length} total requests`} />
          <div className="space-y-3">
            {sortedRequests.map((request) => (
              <div
                key={request.id}
                className="rounded-lg border border-gray-100 p-4 dark:border-gray-800"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-medium capitalize text-gray-900 dark:text-white">
                      {request.type} Leave · {request.days}{' '}
                      {pluralize(request.days, 'day')}
                    </p>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                      {format(parseISO(request.startDate), 'MMM d')} –{' '}
                      {format(parseISO(request.endDate), 'MMM d, yyyy')}
                    </p>
                    <p className="mt-0.5 text-xs text-gray-400">
                      Submitted {format(parseISO(request.submittedAt), 'MMM d, yyyy')}
                    </p>
                  </div>
                  <Badge variant={STATUS_VARIANTS[request.status]}>{request.status}</Badge>
                </div>
                <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">{request.reason}</p>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
