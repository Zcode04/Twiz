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
      {/* حقل البحث */}
      <div className="relative">
        <Search className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white/60 w-5 h-5" />
        <input
          type="text"
          placeholder="أدخل رقم الملف أو الاسم للبحث..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pr-12 pl-4 py-4 bg-white/10 border border-white/30 rounded-full focus:ring-2 focus:ring-blue-400 focus:border-transparent text-white placeholder-white/50 text-lg backdrop-blur-sm"
          dir="rtl"
        />
      </div>

      {/* قائمة نتائج البحث */}
      {searchQuery.trim() && !selectedStudent && searchResults.length > 0 && (
        <div className="mt-4 max-h-96 overflow-y-auto bg-gray-900/5 rounded-xl shadow-lg border border-white/20">
          {searchResults.map((student) => (
            <button
              key={student.NODOSS}
              onClick={() => setSearchQuery(student.NODOSS.toString())}
              className="w-full text-right px-4 py-3 hover:bg-blue-600/20 flex items-center justify-between border-b border-gray-100 last:border-b-0 transition-colors"
            >
              <div className="flex-1">
                <p className="font-medium text-green-400">
                  {highlightText(student.NOM_AR || student.NOM_FR, searchQuery)}
                </p>
                <p className="text-sm text-green-400/80">{student.Etablissement_AR || student.Etablissement}</p>
              </div>
              <div className="text-sm text-green-400 mr-4">
                <span className="font-mono">{student.NODOSS}</span>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* رسالة عدم وجود نتائج */}
      {searchQuery.trim() && searchResults.length === 0 && !selectedStudent && (
        <div className="mt-4 p-4 bg-red-500/20 border border-red-500/30 rounded-xl">
          
<p>لم يتم العثور على نتائج لـ &ldquo;{searchQuery}&rdquo;</p>


        </div>
      )}

      {/* حالة عدم وجود بيانات */}
      {studentsCount === 0 && (
        <div className="text-center text-white py-8">
          <Search className="w-16 h-16 mx-auto mb-4 text-white/70" />
          <h3 className="text-xl font-bold mb-2">البحث عن الطلاب</h3>
          <p className="text-white/70">قم برفع ملف نتائج البكالوريا أولاً للبدء في البحث</p>
        </div>
      )}
    </div>
  )
}