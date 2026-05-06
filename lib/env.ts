import 'server-only'

const warnedKeys = new Set<string>()

function warnOnce(key: string, message: string) {
  if (warnedKeys.has(key)) return
  warnedKeys.add(key)
  console.warn(message)
}

export function getRequiredEnv(name: string) {
  const value = process.env[name]?.trim()

  if (value) {
    return value
  }

  const message = `[env] Missing required environment variable: ${name}`

  if (process.env.NODE_ENV === 'production') {
    throw new Error(message)
  }

  warnOnce(name, message)
  return ''
}

export function getOptionalAdminEmails() {
  const raw = process.env.ADMIN_EMAILS?.trim() || ''

  if (!raw) {
    warnOnce(
      'ADMIN_EMAILS',
      '[env] ADMIN_EMAILS is not set. Admin access will be denied until it is configured.'
    )
    return [] as string[]
  }

  return raw
    .split(',')
    .map((value) => value.trim().toLowerCase())
    .filter(Boolean)
}
