"use client"
import type { User } from "@supabase/supabase-js"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase-browser"
import { Button } from "@/components/ui/button"

export default function AuthButtons({ user }: { user: User | null }) {
  const router = useRouter()
  const supabase = createClient()

  const signIn = () =>
    supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${location.origin}/auth/callback` },
    })

  const signOut = async () => {
    await supabase.auth.signOut()
    router.refresh()            // يجبر Server Component على إعادة التشغيل
  }

  return user ? (
    <div className="flex items-center gap-4">
      <span className="text-gray-300 text-sm hidden md:block">
        مرحباً، {user.email ?? user.user_metadata?.full_name ?? "مستخدم"}
      </span>
      <Button onClick={signOut} variant="outline" className="bg-red-500 hover:bg-red-600 text-white">
        تسجيل الخروج
      </Button>
    </div>
  ) : (
    <Button onClick={signIn} variant="default" className="bg-blue-500 hover:bg-blue-600 text-white">
      تسجيل الدخول
    </Button>
  )
}