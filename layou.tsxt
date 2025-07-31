import "./globals.css"
import { Inter } from "next/font/google"
import { Trophy } from "lucide-react"
import AuthButtons from "@/components/auth-buttons"
import { createClient } from "@/utils/supabase/server"

const inter = Inter({ subsets: ["latin"] })

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  return (
    <html lang="ar" dir="rtl">
      <body className={inter.className}>
        <header className="bg-gray-800 shadow-sm border-b">
          <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
            <div className="flex items-center gap-3">
              <Trophy className="w-8 h-8 text-green-600" />
              <h1 className="text-3xl font-bold text-gray-50">تويزة</h1>
            </div>
            <AuthButtons user={user} />
          </div>
        </header>
        {children}
      </body>
    </html>
  )
}