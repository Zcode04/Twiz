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
    <nav className="sticky top-0 z-30 w-full bg-white/90 backdrop-blur-md shadow-lg">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex items-center justify-around py-4">
          {navItems.map((item) => (
            <Link key={item.href} href={item.href}>
              <Button
                variant="ghost"
                size="icon"
                className={cn(
                  "flex h-10 w-10 flex-col items-center justify-center rounded-lg transition-all",
                  pathname === item.href ? "bg-blue-100 text-blue-600" : "text-gray-600 hover:text-blue-600"
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