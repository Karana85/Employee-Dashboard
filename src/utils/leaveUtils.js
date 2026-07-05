import { differenceInBusinessDays, parseISO, eachDayOfInterval, isWeekend } from 'date-fns';

export function getBusinessDays(startDate, endDate) {
  const start = typeof startDate === 'string' ? parseISO(startDate) : startDate;
  const end = typeof endDate === 'string' ? parseISO(endDate) : endDate;
  if (end < start) return 0;
  return differenceInBusinessDays(end, start) + 1;
}

export function pluralize(count, singular, plural = `${singular}s`) {
  return count === 1 ? singular : plural;
}

export function validateLeaveReason(reason) {
  const trimmed = reason.trim();
  if (!trimmed) return 'Reason is required';
  if (trimmed.length < 10) return 'Reason must be at least 10 characters';
  if (!/^[a-zA-Z0-9\s.,'"-]+$/.test(trimmed)) {
    return 'Reason must use only letters, numbers, and basic punctuation';
  }
  const words = trimmed.split(/\s+/).filter((w) => w.length >= 2);
  if (words.length < 2) return 'Please provide at least 2 meaningful words';
  if (!/[aeiouAEIOU]/.test(trimmed)) return 'Please enter a valid reason in plain English';
  return null;
}

export function validateLeaveBalance(balance, type, requestedDays) {
  const leaveType = balance?.[type];
  if (!leaveType) return 'Invalid leave type';
  if (requestedDays <= 0) return 'Select valid start and end dates';
  if (requestedDays > leaveType.remaining) {
    return `Insufficient ${type} leave. You have ${leaveType.remaining} ${pluralize(leaveType.remaining, 'day')} remaining but requested ${requestedDays}.`;
  }
  return null;
}

export function computeLeaveBalance(total, requests) {
  const used = { annual: 0, sick: 0, personal: 0 };

  requests
    .filter((r) => r.status === 'approved')
    .forEach((r) => {
      const days = r.days ?? getBusinessDays(r.startDate, r.endDate);
      if (used[r.type] !== undefined) used[r.type] += days;
    });

  const balance = {};
  Object.keys(total).forEach((type) => {
    const t = total[type];
    const usedDays = used[type] ?? 0;
    balance[type] = {
      total: t,
      used: usedDays,
      remaining: t - usedDays,
    };
  });

  return balance;
}

export function sortLeaveRequests(requests) {
  return [...requests].sort(
    (a, b) => new Date(b.submittedAt || b.startDate) - new Date(a.submittedAt || a.startDate)
  );
}
