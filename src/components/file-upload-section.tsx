"use client"
import type React from "react"
import { Activity, FolderSync, Search } from "lucide-react"
import type { ProcessingState } from "@/lib/types"
import type { User as SupabaseUser } from "@supabase/supabase-js"
import Link from "next/link"

interface FileUploadSectionProps {
  processing: ProcessingState
  handleFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => Promise<void>
  user: SupabaseUser | null
  studentsCount: number
}

export default function FileUploadSection({ processing, handleFileUpload, studentsCount }: FileUploadSectionProps) {
  return (
    <div className="space-y-2 max-w-md mx-auto px-4 sm:px-6 lg:px-8">
      {/* Added max-w-md, mx-auto, and responsive padding */}
      <label className="cursor-pointer block border-2 bg-blue-400/5 border-green-400/30 rounded-full p-4 sm:p-6 text-center hover:border-white/50 transition-all duration-300 hover:bg-white/5">
        <FolderSync className="w-14 h-14 md:w-16 md:h-16 text-white mx-auto mb-2" /> {/* Made icon responsive */}
        <span className="text-base sm:text-lg font-medium text-white hover:text-blue-200 transition-colors">
          {processing.isProcessing ? "جاري المعالجة..." : "ارفع الملف بصيغة"}
        </span>
        <input
          type="file"
          accept=".xlsx,.xls"
          onChange={handleFileUpload}
          disabled={processing.isProcessing}
          className="hidden"
        />
      </label>
      {/* شريط التقدم */}
      {processing.isProcessing && (
        <div className="space-y-3">
          <div className="flex items-center justify-between text-white/90">
            <span className="truncate overflow-hidden whitespace-nowrap">{processing.message}</span>{" "}
            {/* Added truncation classes */}
            <span>{processing.progress.toFixed(0)}%</span>
          </div>
          <div className="w-full bg-white/20 rounded-full h-2 overflow-hidden">
            <div
              className="bg-gradient-to-r from-blue-50 to-green-400 h-full rounded-full transition-all duration-300 ease-out"
              style={{ width: `${processing.progress}%` }}
            />
          </div>
          <div className="flex items-center justify-center gap-2 text-white/70">
            <Activity className="w-4 h-4 animate-spin" />
            <span className="text-sm">
              {processing.stage === "reading" && "قراءة الملف..."}
              {processing.stage === "parsing" && "تحليل البيانات..."}
              {processing.stage === "indexing" && "إنشاء الفهرس..."}
              {processing.stage === "saving" && "حفظ البيانات..."}
            </span>
          </div>
        </div>
      )}
      {processing.message && !processing.isProcessing && (
        <div className="p-3 bg-green-500/20 border border-green-500/30 rounded-full">
          <p className="text-green-200 text-center truncate overflow-hidden whitespace-nowrap">{processing.message}</p>{" "}
          {/* Added truncation classes */}
        </div>
      )}

      {/* زر التوجه إلى البحث - يظهر فقط عند وجود طلاب */}
      {studentsCount > 0 && !processing.isProcessing && (
        <div className="pt-4">
          <Link href="/search" className="block">
            <button className="w-full bg-gradient-to-r from-blue-500 to-green-500 hover:from-blue-600 hover:to-green-600 text-white font-medium py-3 px-6 rounded-full transition-all duration-300 transform hover:scale-105 hover:shadow-lg flex items-center justify-center gap-2">
              <Search className="w-5 h-5" />
              <span>ابدأ البحث في البيانات</span>
              <span className="bg-white/20 px-2 py-1 rounded-full text-sm">
                {studentsCount} طالب
              </span>
            </button>
          </Link>
        </div>
      )}

      {/* رسالة ترحيب عند عدم وجود بيانات */}
      {studentsCount === 0 && !processing.isProcessing && (
        <div className="text-center py-1 ">
          <div className="flex bg-white/10 backdrop-blur-md rounded-full p-2 border border-white/20">
            <div className="flex flex-wrap justify-center items-center text-sm text-white/60">
              <span> يدعم ملفات .xlsx و .xls</span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}