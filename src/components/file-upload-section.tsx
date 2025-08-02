"use client"
import { useState, useEffect } from "react"
import type React from "react"
import { Activity, FolderSync, Search, X, FileText, Users } from "lucide-react"
import type { ProcessingState } from "@/lib/types"
import type { User as SupabaseUser } from "@supabase/supabase-js"
import { createClient } from "@/lib/supabase-browser"
import Link from "next/link"

interface FileUploadSectionProps {
  processing: ProcessingState
  handleFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => Promise<void>
  user: SupabaseUser | null
  studentsCount: number
  loadPublicData?: (fileName: string) => Promise<void>
}

interface PublicFile {
  file_name: string
  students_count: number
  uploader_name: string
  uploaded_at: string
}

export default function FileUploadSection({ 
  processing, 
  handleFileUpload, 
  user,
  studentsCount,
  loadPublicData 
}: FileUploadSectionProps) {
  const [showNotice, setShowNotice] = useState(true)
  const [publicFiles, setPublicFiles] = useState<PublicFile[]>([])
  const [showPublicFiles, setShowPublicFiles] = useState(false)
  const [loadingPublicFiles, setLoadingPublicFiles] = useState(false)
  const supabase = createClient()

  // تحميل الملفات العامة للمستخدمين غير المسجلين
  useEffect(() => {
    if (!user) {
      // تأخير بسيط لتجنب المشاكل مع التحديث المباشر
      const timer = setTimeout(() => {
        loadPublicFiles()
      }, 100)
      return () => clearTimeout(timer)
    }
  }, [user])

  const loadPublicFiles = async () => {
    setLoadingPublicFiles(true)
    try {
      const { data, error } = await supabase
        .from("public_files")
        .select("*")
        .order("uploaded_at", { ascending: false })
        .limit(10)

      if (error) {
        console.error("Supabase error:", error)
        // في حالة عدم وجود الجدول أو خطأ في الاستعلام، نعرض رسالة مناسبة
        setPublicFiles([])
        return
      }
      
      setPublicFiles(data || [])
    } catch (error) {
      console.error("Error loading public files:", error)
      setPublicFiles([])
    } finally {
      setLoadingPublicFiles(false)
    }
  }

  const handleLoadPublicFile = async (fileName: string) => {
    if (!loadPublicData) {
      console.error("loadPublicData function not provided")
      return
    }
    
    try {
      await loadPublicData(fileName)
      setShowPublicFiles(false)
    } catch (error) {
      console.error("Error loading public file:", error)
      // يمكن إضافة رسالة خطأ للمستخدم هنا
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ar-SA', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  return (
    <div className="space-y-4">
      {/* التنويه المهم */}
      {showNotice && (
        <div className="relative bg-gray-950/70 border border-amber-400/30 rounded-2xl p-6 backdrop-blur-sm max-w-md mx-auto">
          <button
            onClick={() => setShowNotice(false)}
            className="absolute top-4 right-4 text-green-400 hover:text-white transition-colors p-1 hover:bg-white/10 rounded-full"
            aria-label="إغلاق التنويه"
          >
            <X className="w-5 h-5" />
          </button>
          
          <div className="pr-8">
            <h3 className="text-xl font-bold text-green-50 mb-3 flex items-center gap-2">
              <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
              تنويه هام
            </h3>
            <div className="text-amber-50/90 leading-relaxed space-y-2">
              <p className="font-medium">مرحبًا بكم في منصة تويزه.</p>
              <p>يرجى العلم أنكم تستخدمون حالياً إصدارًا تجريبيًا من المنصة، قد يحتوي على بعض القيود والتحديثات القادمة قريبًا.</p>
              <p>نشكر لكم تفهمكم وصبركم، ونعمل باستمرار على تحسين التجربة لتلبية احتياجاتكم بأفضل شكل ممكن.</p>
              <p>سجّل الدخول حتى تصلك أحدث التحديثات والمزايا الجديدة أولًا بأول!</p>
            </div>
          </div>
        </div>
      )}

      {/* المحتوى الأصلي */}
      <div className="space-y-2 max-w-md mx-auto px-4 sm:px-6 lg:px-8">
        {/* قسم رفع الملفات - متاح لجميع المستخدمين */}
        <label className="cursor-pointer block border-2 bg-blue-400/5 border-green-400/30 rounded-full p-4 sm:p-6 text-center hover:border-white/50 transition-all duration-300 hover:bg-white/5">
          <FolderSync className="w-14 h-14 md:w-16 md:h-16 text-white mx-auto mb-2" />
          <span className="text-base sm:text-lg font-medium text-white hover:text-blue-200 transition-colors">
            {processing.isProcessing ? "جاري المعالجة..." : "نرجو منكم رفع الملفات"}
          </span>
          <input
            type="file"
            accept=".xlsx,.xls"
            onChange={handleFileUpload}
            disabled={processing.isProcessing}
            className="hidden"
          />
        </label>

        {/* قسم الملفات العامة للمستخدمين غير المسجلين */}
        {!user && (
          <div className="space-y-3">
            {/* فاصل بصري للمستخدمين غير المسجلين */}
            <div className="flex items-center justify-center">
              <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gray-400/30 to-transparent"></div>
              <span className="px-3 text-gray-400 text-sm">أو</span>
              <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gray-400/30 to-transparent"></div>
            </div>

            <button
              onClick={() => setShowPublicFiles(!showPublicFiles)}
              className="w-full border-2 bg-purple-400/5 border-purple-400/30 rounded-full p-4 sm:p-6 text-center hover:border-white/50 transition-all duration-300 hover:bg-white/5"
              disabled={loadingPublicFiles}
            >
              <Users className="w-14 h-14 md:w-16 md:h-16 text-white mx-auto mb-2" />
              <span className="text-base sm:text-lg font-medium text-white hover:text-purple-200 transition-colors">
                {loadingPublicFiles ? "جاري التحميل..." : "تصفح الملفات المتاحة"}
              </span>
            </button>

            {/* قائمة الملفات العامة */}
            {showPublicFiles && publicFiles.length > 0 && (
              <div className="bg-gray-900/50 border border-gray-700/30 rounded-2xl p-4 backdrop-blur-sm">
                <h4 className="text-white font-medium mb-3 flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  الملفات المتاحة للبحث
                </h4>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {publicFiles.map((file) => (
                    <button
                      key={file.file_name}
                      onClick={() => handleLoadPublicFile(file.file_name)}
                      className="w-full text-right p-3 bg-gray-800/50 hover:bg-gray-700/50 rounded-lg transition-colors border border-gray-600/30 hover:border-gray-500/50"
                      disabled={processing.isProcessing}
                    >
                      <div className="flex justify-between items-start">
                        <div className="text-right">
                          <div className="text-white font-medium text-sm truncate max-w-[200px]">
                            {file.file_name.replace(/_\d{4}-\d{2}-\d{2}-\d{2}-\d{2}-\d{2}$/, '')}
                          </div>
                          <div className="text-gray-400 text-xs">
                            {file.students_count} طالب • {file.uploader_name}
                          </div>
                          <div className="text-gray-500 text-xs">
                            {formatDate(file.uploaded_at)}
                          </div>
                        </div>
                        <div className="flex-shrink-0 bg-blue-500/20 text-blue-300 px-2 py-1 rounded text-xs">
                          {file.students_count}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {showPublicFiles && publicFiles.length === 0 && !loadingPublicFiles && (
              <div className="bg-gray-900/50 border border-gray-700/30 rounded-2xl p-4 backdrop-blur-sm text-center text-gray-400 py-8">
                <FileText className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p>لا توجد ملفات متاحة حالياً</p>
                <p className="text-xs mt-1">سجل الدخول لرفع ملفاتك الخاصة</p>
              </div>
            )}
          </div>
        )}

        {/* شريط التقدم */}
        {processing.isProcessing && (
          <div className="space-y-3">
            <div className="flex items-center justify-between text-white/90">
              <span className="truncate overflow-hidden whitespace-nowrap">{processing.message}</span>
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
            <p className="text-green-200 text-center truncate overflow-hidden whitespace-nowrap">{processing.message}</p>
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
          <div className="text-center">
            <div className="flex bg-gray-950/10 backdrop-blur rounded-tl-full p-2 border border-white/20">
              <div className="flex flex-wrap justify-center items-center text-sm text-white/70">
                <span>
                  {user 
                    ? "بصيغة إكسل فقط, نتميّز بسرعة معالجة البيانات"
                    : "ارفع ملفك أو تصفح الملفات المتاحة - بصيغة إكسل فقط"
                  }
                </span>
              </div>
            </div>
            
            {/* رسالة إضافية للمستخدمين غير المسجلين */}
            {!user && (
              <div className="mt-3 p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg">
                <p className="text-amber-200 text-xs">
                  💡 سجل الدخول لحفظ ملفاتك والوصول إليها في أي وقت
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}