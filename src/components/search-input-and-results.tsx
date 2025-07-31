"use client"

import type React from "react"
import { Search } from "lucide-react"
import type { Student } from "@/lib/types"

interface SearchInputAndResultsProps {
  searchQuery: string
  setSearchQuery: (query: string) => void
  searchResults: Student[]
  selectedStudent: Student | null
  highlightText: (text: string, query: string) => React.ReactNode
  studentsCount: number
}

export default function SearchInputAndResults({
  searchQuery,
  setSearchQuery,
  searchResults,
  selectedStudent,
  highlightText,
  studentsCount,
}: SearchInputAndResultsProps) {
  return (
    <div className="space-y-6">
      <div className="relative">
        <Search className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white/60 w-5 h-5" />
        <input
          type="text"
          placeholder="أدخل رقم الطالب أو الاسم للبحث..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pr-12 pl-4 py-4 bg-white/10 border border-white/30 rounded-xl focus:ring-2 focus:ring-blue-400 focus:border-transparent text-white placeholder-white/50 text-lg backdrop-blur-sm"
          dir="rtl"
        />
      </div>

      {/* نتائج البحث */}
      {searchQuery.trim() && !selectedStudent && searchResults.length > 0 && (
        <div className="mt-4 max-h-64 overflow-y-auto bg-white/95 rounded-xl shadow-lg border border-white/20">
          {searchResults.map((student) => (
            <button
              key={student.Num_Bepc}
              onClick={() => setSearchQuery(student.Num_Bepc.toString())}
              className="w-full text-right px-4 py-3 hover:bg-blue-50 flex items-center justify-between border-b border-gray-100 last:border-b-0 transition-colors"
            >
              <div className="flex-1">
                <p className="font-medium text-gray-900">{highlightText(student.NOM, searchQuery)}</p>
                <p className="text-sm text-gray-500">{student.Ecole}</p>
              </div>
              <div className="text-sm text-gray-600 mr-4">
                <span className="font-mono">{student.Num_Bepc}</span>
              </div>
            </button>
          ))}
        </div>
      )}

      {searchQuery.trim() && searchResults.length === 0 && !selectedStudent && (
        <div className="mt-4 p-4 bg-red-500/20 border border-red-500/30 rounded-lg">
          <p className="text-red-200 text-center">لم يتم العثور على نتائج</p>
        </div>
      )}

      {studentsCount === 0 && (
        <div className="text-center text-white">
          <Search className="w-16 h-16 mx-auto mb-4 text-white/70" />
          <h3 className="text-xl font-bold mb-2">البحث</h3>
          <p className="text-white/70">قم برفع ملف النتائج أولاً</p>
        </div>
      )}
    </div>
  )
}
