export function Badge({ variant = 'neutral', children }) {
  const styles = {
    success: 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200',
    warning: 'bg-amber-50 text-amber-700 ring-1 ring-amber-200',
    danger: 'bg-red-50 text-red-700 ring-1 ring-red-200',
    neutral: 'bg-slate-100 text-slate-600 ring-1 ring-slate-200',
    info: 'bg-blue-50 text-blue-700 ring-1 ring-blue-200',
  }
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-semibold tracking-wide ${styles[variant]}`}>
      {children}
    </span>
  )
}
