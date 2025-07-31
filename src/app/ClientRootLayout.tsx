"use client"

import type React from "react"
import { Inter } from "next/font/google"
import "./globals.css"
import ClientLayout from "@/app/client-layout"

const inter = Inter({ subsets: ["latin"] })

export default function ClientRootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  // RootLayout is now purely a Server Component.
  // ClientLayout will handle ThemeProvider and StudentDataProvider.
  return (
    <html lang="ar" dir="rtl" suppressHydrationWarning>
      <body className={`${inter.className} min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-green-900`}>
        <ClientLayout>{children}</ClientLayout>
      </body>
      {/* أنماط الطباعة */}
      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .print-section, .print-section * {
            visibility: visible;
          }
          .print-section {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }
          .no-print {
            display: none !important;
          }
        }
      `}</style>
    </html>
  )
}
