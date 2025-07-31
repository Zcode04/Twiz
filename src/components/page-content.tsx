"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"

interface PageContentProps {
  title: string
  description: string
  nextPagePath: string
  nextPageLabel: string
}

export default function PageContent({ title, description, nextPagePath, nextPageLabel }: PageContentProps) {
  return (
    <main className="flex min-h-[calc(100vh-128px)] flex-col items-center justify-center p-4 text-center">
      <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl">{title}</h1>
      <p className="mt-4 max-w-2xl text-lg text-muted-foreground md:text-xl">{description}</p>
      <div className="mt-8">
        <Link href={nextPagePath} passHref>
          <Button size="lg">{nextPageLabel}</Button>
        </Link>
      </div>
    </main>
  )
}
