"use client"

import Image from "next/image"
import Link from "next/link"
import { UserCircle, LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useStudentData } from "@/components/student-data-provider"
import { createClient } from "@/lib/supabase-browser" // Import browser client

export default function Header() {
  const { user } = useStudentData()
  const supabase = createClient()

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    // Optionally, redirect to home or login page after sign out
    window.location.href = "/"
  }

  const handleSignIn = async () => {
    // Redirect to Supabase OAuth login page
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: "google", // يمكنك تغيير 'google' إلى أي مزود آخر قمت بتهيئته في Supabase (مثل 'github', 'discord', إلخ.)
      options: {
      redirectTo: `${window.location.origin}/auth/callback?next=${window.location.pathname}`,
 // هذا هو المسار الذي سيعيد Supabase التوجيه إليه بعد المصادقة
      },
    })

    if (error) {
      console.error("Error signing in:", error)
      alert("حدث خطأ أثناء تسجيل الدخول: " + error.message)
    } else if (data.url) {
      // إذا كان هناك URL، قم بإعادة توجيه المستخدم إليه لبدء عملية OAuth
      window.location.href = data.url
    }
  }

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background no-print">
      <div className="container flex h-16 items-center justify-between px-4 md:px-6">
        <Link href="/" className="flex items-center gap-2 font-semibold">
          <Image src="/placeholder.svg?height=32&width=32" width={32} height={32} alt="Logo" className="rounded-full" />
          <span className="sr-only">اسم التطبيق</span>
          <span className="text-lg">تطبيقي</span>
        </Link>
        <div className="flex items-center gap-2">
          {user ? (
            <Button variant="ghost" onClick={handleSignOut} className="flex items-center gap-2 text-sm font-medium">
              <LogOut className="h-6 w-6" />
              <span>تسجيل الخروج</span>
            </Button>
          ) : (
            <Button variant="ghost" onClick={handleSignIn} className="flex items-center gap-2 text-sm font-medium">
              <UserCircle className="h-6 w-6" />
              <span>تسجيل الدخول</span>
            </Button>
          )}
        </div>
      </div>
    </header>
  )
}
