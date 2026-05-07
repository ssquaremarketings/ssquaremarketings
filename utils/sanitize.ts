/**
 * Simple sanitization function that removes HTML tags and escapes dangerous characters
 * This replaces the problematic isomorphic-dompurify dependency
 */
export function sanitize(input: string): string {
  if (typeof input !== 'string') {
    return ''
  }

  // Remove HTML tags
  let sanitized = input.replace(/<[^>]*>/g, '')

  // Decode HTML entities to prevent double-encoding
  sanitized = sanitized
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#x27;/g, "'")
    .replace(/&amp;/g, '&')

  // Escape dangerous characters for display (but not for storage in DB)
  // Just remove/replace potentially harmful characters
  sanitized = sanitized
    .replace(/[<>"']/g, '') // Remove quotes and angle brackets
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+\s*=/gi, '') // Remove event handlers

  return sanitized.trim()
}

