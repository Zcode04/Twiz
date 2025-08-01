"use client"
import { Home, Search, User, MessageSquare } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

export function AuthHeader() {
  const pathname = usePathname()
  
  const navItems = [
    { href: "/", icon: Home, label: "الرئيسية" },
    { href: "/search", icon: Search, label: "البحث" },
    { href: "/profile", icon: User, label: "الملف الشخصي" },
    { href: "/messages", icon: MessageSquare, label: "الرسائل" },
  ]

  return (
    <nav className="sticky top-0 z-30 w-full  bg-white/10 border border-white/30 rounded-full  placeholder-white/50 text-lg backdrop-blur-sm">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex items-center justify-around py-4">
          {navItems.map((item) => (
            <Link key={item.href} href={item.href}>
              <Button
                variant="ghost"
                size="icon"
                className={cn(
                  "flex h-10 w-10 flex-col items-center justify-center rounded-full transition-all  bg-white/10 border border-white/30  placeholder-white/50 text-lg backdrop-blur-sm",
                  pathname === item.href ? " text-blue-50" : "text-gray-50 hover:text-green-600"
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