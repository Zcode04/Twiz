"use client" // Make it a client component to use useStudentData if needed later

import { MessageSquare } from "lucide-react"
// import { useStudentData } from "@/components/student-data-provider" // Uncomment if you need student data here

export default function MessagesPage() {
  return (
    <div className="bg-white/10 backdrop-blur-md rounded-2xl shadow-2xl p-6 mb-8 border border-white/20">
      <div className="text-center text-white">
        <MessageSquare className="w-16 h-16 mx-auto mb-4 text-white/70" />
        <h3 className="text-xl font-bold mb-2">الرسائل</h3>
        <p className="text-white/70">قريباً...</p>
      </div>
    </div>
  )
}
