import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
  const res = NextResponse.next({ request: req })
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name) { return req.cookies.get(name)?.value },
        set(name, value, opts) { res.cookies.set({ name, value, ...opts }) },
        remove(name, opts) { res.cookies.set({ name, value: '', ...opts }) },
      },
    }
  )
  await supabase.auth.getUser()   // يضمن وجود الجلسة
  return res
}

export const config = { matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'] }