import type React from "react"
import type { Metadata } from "next"
import ClientRootLayout from "./ClientRootLayout"

export const metadata: Metadata = {
  title: "تطبيق ويب حديث",
  description: "بنية تطبيق ويب هجينة باستخدام Next.js 15",
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return <ClientRootLayout>{children}</ClientRootLayout>
}
