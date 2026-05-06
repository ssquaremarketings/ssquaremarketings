type ToastProps = {
  message: string
  type?: 'success' | 'error' | 'info'
}

const classes: Record<NonNullable<ToastProps['type']>, string> = {
  success: 'bg-emerald-600 text-white',
  error: 'bg-red-600 text-white',
  info: 'bg-slate-900 text-white'
}

export function Toast({ message, type = 'info' }: ToastProps) {
  return (
    <div className={`fixed right-4 top-4 z-[60] rounded-2xl px-4 py-3 text-sm font-medium shadow-xl ${classes[type]}`}>
      {message}
    </div>
  )
}
