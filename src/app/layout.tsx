import type React from "react"
import type { Metadata } from "next"
import ClientRootLayout from "./ClientRootLayout"

export const metadata: Metadata = {
  title: "Twize",
  description: "from kan ai",
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return <ClientRootLayout>{children}</ClientRootLayout>
}
