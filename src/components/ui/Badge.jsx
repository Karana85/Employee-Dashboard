const variants = {
  success: 'bg-green-50 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800',
  error: 'bg-red-50 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-800',
  warning: 'bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-800',
  info: 'bg-blue-50 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800',
};

const colors = {
  success: 'bg-green-500',
  error: 'bg-red-500',
  warning: 'bg-amber-500',
  info: 'bg-blue-500',
  present: 'bg-green-500',
  late: 'bg-amber-500',
  absent: 'bg-red-500',
  pending: 'bg-amber-500',
  approved: 'bg-green-500',
  rejected: 'bg-red-500',
  active: 'bg-green-500',
  'on-leave': 'bg-amber-500',
  high: 'bg-red-500',
  medium: 'bg-amber-500',
  low: 'bg-green-500',
};

export function Badge({ children, variant = 'info', className = '' }) {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium capitalize ${variants[variant] || variants.info} ${className}`}
    >
      {children}
    </span>
  );
}

export function StatusDot({ status, className = '' }) {
  return (
    <span className={`inline-block h-2 w-2 rounded-full ${colors[status] || 'bg-gray-400'} ${className}`} />
  );
}
