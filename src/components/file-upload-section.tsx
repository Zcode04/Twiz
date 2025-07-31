"use client"

import type React from "react"
import { Upload, Loader2, FileText } from "lucide-react"
import type { ProcessingState } from "@/lib/types"
import type { User as SupabaseUser } from "@supabase/supabase-js"

interface FileUploadSectionProps {
  processing: ProcessingState
  handleFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => Promise<void>
  user: SupabaseUser | null
  studentsCount: number
}

export default function FileUploadSection({
  processing,
  handleFileUpload,
  user,
  studentsCount,
}: FileUploadSectionProps) {
  return (
    <div className="space-y-6">
      <div className="border-2 border-dashed border-white/30 rounded-2xl p-8 text-center hover:border-white/50 transition-all duration-300 hover:bg-white/5">
        <Upload className="w-16 h-16 text-white/70 mx-auto mb-4" />
        <label className="cursor-pointer block">
          <span className="text-lg font-medium text-white hover:text-blue-200 transition-colors">
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
      </div>

      {/* شريط التقدم */}
      {processing.isProcessing && (
        <div className="space-y-3">
          <div className="flex items-center justify-between text-white/90">
            <span>{processing.message}</span>
            <span>{processing.progress.toFixed(0)}%</span>
          </div>
          <div className="w-full bg-white/20 rounded-full h-2 overflow-hidden">
            <div
              className="bg-gradient-to-r from-blue-200 to-green-400 h-full rounded-full transition-all duration-300 ease-out"
              style={{ width: `${processing.progress}%` }}
            />
          </div>
          <div className="flex items-center justify-center gap-2 text-white/70">
            <Loader2 className="w-4 h-4 animate-spin" />
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
        <div className="p-3 bg-green-500/20 border border-green-500/30 rounded-lg">
          <p className="text-green-200 text-center">{processing.message}</p>
        </div>
      )}

      {!user && (
        <div className="p-3 bg-yellow-500/20 border border-yellow-500/30 rounded-lg">
          <p className="text-yellow-200 text-center">سجّل الدخول بحساب Google لحفظ بياناتك تلقائياً</p>
        </div>
      )}

      {/* رسالة ترحيب عند عدم وجود بيانات */}
      {studentsCount === 0 && !processing.isProcessing && (
        <div className="text-center py-16">
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-12 border border-white/20">
            <FileText className="w-24 h-24 text-white/50 mx-auto mb-6" />
            <h3 className="text-2xl font-bold text-white mb-4">مرحباً بك!</h3>
            <p className="text-white/70 text-lg mb-6 max-w-md mx-auto">
              ابدأ برفع ملف Excel يحتوي على نتائج الطلاب للبحث والاستعلام عن النتائج بسهولة
            </p>
            <div className="flex flex-wrap justify-center gap-4 text-sm text-white/60">
              <span>✓ يدعم ملفات .xlsx و .xls</span>
              <span>✓ بحث سريع بالرقم أو الاسم</span>
              <span>✓ حفظ تلقائي للبيانات</span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
