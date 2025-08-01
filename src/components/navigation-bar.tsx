"use client"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, User, MessageSquare, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export default function NavigationBar() {
  const pathname = usePathname()
  const navItems = [
    { href: "/profile", icon: User, label: "الملف الشخصي" },
    { href: "/", icon: Home, label: "الرئيسية" },
    { href: "/search", icon: Search, label: "البحث" },
    { href: "/messages", icon: MessageSquare, label: "الرسائل" },
  ]

  return (
    <nav className="sticky top-16 z-30 w-full border border-white/5 focus:border-transparent text-lg backdrop-blur-sm no-print">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex items-center justify-center gap-4 py-4">
          {navItems.map((item) => (
            <Link key={item.href} href={item.href} passHref>
              <Button
                variant="ghost"
                size="icon"
                className={cn(
                  "flex h-10 w-10 flex-col items-center justify-center bg-white/10 border border-white/30 rounded-full focus:ring-2 focus:ring-blue-400 focus:border-transparent text-white placeholder-white/50 text-lg backdrop-blur-sm transition-all",
                  pathname === item.href ? "text-blue-50" : "text-gray-50 hover:text-blue-50",
                )}
              >
                <item.icon className="h-6 w-6" />
                <span className="sr-only">{item.label}</span>
              </Button>
            </Link>
          ))}
        </div>
      </div>
    </nav>
  )
}
