import DOMPurify from 'isomorphic-dompurify'

export function sanitize(input: string) {
  return DOMPurify.sanitize(input, {
    ALLOWED_TAGS: [],
    ALLOWED_ATTR: []
  })
}

