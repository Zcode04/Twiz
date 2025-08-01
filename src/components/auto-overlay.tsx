"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { XIcon } from "lucide-react"

interface AutoOverlayProps {
  text: string
}

export default function AutoOverlay({ text }: AutoOverlayProps) {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    // Show the overlay automatically when the component mounts
    setIsVisible(true)
  }, [])

  if (!isVisible) {
    return null
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="relative w-full max-w-md rounded-lg bg-white p-6 shadow-lg dark:bg-gray-800">
        <Button
          className="absolute right-4 top-4 rounded-full"
          variant="ghost"
          size="icon"
          onClick={() => setIsVisible(false)}
          aria-label="Close"
        >
          <XIcon className="h-5 w-5" />
        </Button>
        <div className="text-center text-lg font-semibold text-gray-900 dark:text-gray-50">{text}</div>
      </div>
    </div>
  )
}
