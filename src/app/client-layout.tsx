"use client"

import type React from "react"

import { ThemeProvider } from "@/components/theme-provider"
import Header from "@/components/header"
import NavigationBar from "@/components/navigation-bar"
import { StudentDataProvider } from "@/components/student-data-provider"



export default function ClientLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
      <StudentDataProvider>
        <Header />
        <NavigationBar />
        <div className="max-w-6xl mx-auto px-4 py-8">{children}</div>
      </StudentDataProvider>
    </ThemeProvider>
  )
}
