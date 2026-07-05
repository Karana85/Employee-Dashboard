export function Card({ children, className = '', hover = false, padding = true, shine = false, ...props }) {
  return (
    <div
      className={`rounded-2xl border border-slate-200/70 bg-white shadow-[0_1px_3px_rgba(15,23,42,0.06),0_4px_16px_rgba(15,23,42,0.04)] dark:border-slate-800 dark:bg-slate-900 dark:shadow-[0_1px_3px_rgba(0,0,0,0.3)] ${
        padding ? 'p-5' : ''
      } ${shine ? 'card-shine' : ''} ${
        hover ? 'transition-all duration-300 hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-[0_8px_30px_rgba(37,99,235,0.12)] dark:hover:border-blue-800' : ''
      } ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({ title, subtitle, action, icon: Icon, compact = false }) {
  return (
    <div className={`flex items-start justify-between gap-3 ${compact ? 'mb-4' : 'mb-5'}`}>
      <div className="flex items-start gap-3">
        {Icon && (
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-950 dark:text-blue-400">
            <Icon className="h-4 w-4" />
          </div>
        )}
        <div>
          <h2 className="text-[15px] font-semibold tracking-tight text-slate-900 dark:text-white">{title}</h2>
          {subtitle && <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">{subtitle}</p>}
        </div>
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}
