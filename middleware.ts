import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import { isAuthorizedAdmin } from '@/lib/auth'
import { getRequiredEnv } from '@/lib/env'

function isSensitiveApiPath(pathname: string, method: string) {
  if (pathname.startsWith('/api/mux/')) {
    return true
  }

  if (pathname === '/api/projects') {
    return method === 'POST'
  }

  if (pathname.startsWith('/api/projects/')) {
    return method === 'PUT' || method === 'DELETE'
  }

  return false
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  if (!pathname.startsWith('/admin')) {
    if (!isSensitiveApiPath(pathname, request.method)) {
      return NextResponse.next()
    }
  }

  if (pathname === '/admin/login') {
    return NextResponse.next()
  }

  let response = NextResponse.next({ request })
  const supabase = createServerClient(
    getRequiredEnv('NEXT_PUBLIC_SUPABASE_URL'),
    getRequiredEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY'),
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options: Record<string, unknown>) {
          response.cookies.set({ name, value, ...options })
        },
        remove(name: string, options: Record<string, unknown>) {
          response.cookies.set({ name, value: '', ...options })
        }
      }
    }
  )

  const { data: { session } } = await supabase.auth.getSession()

  if (!isAuthorizedAdmin(session)) {
    if (pathname.startsWith('/api/')) {
      return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 })
    }

    return NextResponse.redirect(new URL('/admin/login', request.url))
  }

  return response
}

export const config = {
  matcher: ['/admin/:path*']
}
