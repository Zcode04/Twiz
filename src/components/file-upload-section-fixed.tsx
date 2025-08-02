"use client"
import { useState, useEffect } from "react"
import type React from "react"
import { Activity, FolderSync, Search, X, FileText, Users, Database } from "lucide-react"
import { createClient } from "@/lib/supabase-browser"
import Link from "next/link"

// تعريف الأنواع محلياً لتجنب مشاكل الاستيراد
interface ProcessingState {
  isProcessing: boolean
  stage: "reading" | "parsing" | "indexing" | "saving" | "complete"
  progress: number
  message: string
}

interface User {
  id: string
  email?: string
}

interface FileUploadSectionProps {
  processing: ProcessingState
  handleFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => Promise<void>
  user: User | null
  studentsCount: number
  loadPublicData?: (fileName: string) => Promise<void>
}

interface PublicFile {
  file_name: string
  students_count: number
  uploader_name: string
  uploaded_at: string
}

interface UserFile {
  file_name: string
  students_count: number
  uploaded_at: string
}

function FileUploadSectionFixed({
  processing,
  handleFileUpload,
  user,
  studentsCount,
  loadPublicData,
}: FileUploadSectionProps) {
  const [showNotice, setShowNotice] = useState(true)
  const [publicFiles, setPublicFiles] = useState<PublicFile[]>([])
  const [userFiles, setUserFiles] = useState<UserFile[]>([])
  const [showPublicFiles, setShowPublicFiles] = useState(false)
  const [showUserFiles, setShowUserFiles] = useState(false)
  const [loadingPublicFiles, setLoadingPublicFiles] = useState(false)
  const [loadingUserFiles, setLoadingUserFiles] = useState(false)

  const supabase = createClient()

  // تحميل الملفات العامة للمستخدمين غير المسجلين
  useEffect(() => {
    if (!user) {
      const timer = setTimeout(() => {
        loadPublicFiles()
      }, 100)
      return () => clearTimeout(timer)
    }
  }, [user])

  // تحميل ملفات المستخدم المسجل
  useEffect(() => {
    if (user) {
      loadUserFiles()
    }
  }, [user])

  const loadPublicFiles = async () => {
    setLoadingPublicFiles(true)
    try {
      console.log("Loading public files...")
      const { data, error } = await supabase
        .from("public_files")
        .select("*")
        .order("uploaded_at", { ascending: false })
        .limit(10)

      if (error) {
        console.error("Supabase error loading public files:", error)
        setPublicFiles([])
        return
      }

      console.log("Public files loaded:", data)
      setPublicFiles(data || [])
    } catch (error) {
      console.error("Error loading public files:", error)
      setPublicFiles([])
    } finally {
      setLoadingPublicFiles(false)
    }
  }

  const loadUserFiles = async () => {
    if (!user) return

    setLoadingUserFiles(true)
    try {
      console.log("Loading user files for:", user.id)
      const { data, error } = await supabase
        .from("user_files")
        .select("*")
        .eq("user_id", user.id)
        .order("uploaded_at", { ascending: false })
        .limit(10)

      if (error) {
        console.error("Supabase error loading user files:", error)
        setUserFiles([])
        return
      }

      console.log("User files loaded:", data)
      setUserFiles(data || [])
    } catch (error) {
      console.error("Error loading user files:", error)
      setUserFiles([])
    } finally {
      setLoadingUserFiles(false)
    }
  }

  const handleLoadPublicFile = async (fileName: string) => {
    if (!loadPublicData) {
      console.error("loadPublicData function not provided")
      return
    }

    try {
      console.log("Loading public file:", fileName)
      await loadPublicData(fileName)
      setShowPublicFiles(false)
    } catch (error) {
      console.error("Error loading public file:", error)
    }
  }

  const handleLoadUserFile = async (fileName: string) => {
    if (!user) return

    try {
      console.log("Loading user file:", fileName)
      // إعادة تحميل الصفحة لتحديث البيانات
      window.location.reload()
    } catch (error) {
      console.error("Error loading user file:", error)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("ar-SA", {
      year: "numeric",
      month: "short",
      day: "numeric",
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
              <p>يرجى العلم أنكم تستخدمون حالياً إصدارًا تجريبيًا من المنصة.</p>
              {user ? (
                <p>✅ أنت مسجل الدخول - بياناتك محفوظة بأمان!</p>
              ) : (
                <p>💡 سجّل الدخول لحفظ ملفاتك والوصول إليها دائماً!</p>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="space-y-2 max-w-md mx-auto px-4 sm:px-6 lg:px-8">
        {/* قسم رفع الملفات */}
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

        {/* قسم الملفات للمستخدمين المسجلين */}
        {user && (
          <div className="space-y-3">
            <div className="flex items-center justify-center">
              <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gray-400/30 to-transparent"></div>
              <span className="px-3 text-gray-400 text-sm">ملفاتك المحفوظة</span>
              <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gray-400/30 to-transparent"></div>
            </div>

            <button
              onClick={() => setShowUserFiles(!showUserFiles)}
              className="w-full border-2 bg-green-400/5 border-green-400/30 rounded-full p-4 sm:p-6 text-center hover:border-white/50 transition-all duration-300 hover:bg-white/5"
              disabled={loadingUserFiles}
            >
              <Database className="w-14 h-14 md:w-16 md:h-16 text-white mx-auto mb-2" />
              <span className="text-base sm:text-lg font-medium text-white hover:text-green-200 transition-colors">
                {loadingUserFiles ? "جاري التحميل..." : "ملفاتي المحفوظة"}
              </span>
              {userFiles.length > 0 && <div className="mt-1 text-xs text-green-300">{userFiles.length} ملف محفوظ</div>}
            </button>

            {/* قائمة ملفات المستخدم */}
            {showUserFiles && (
              <div className="bg-gray-900/50 border border-gray-700/30 rounded-2xl p-4 backdrop-blur-sm">
                <h4 className="text-white font-medium mb-3 flex items-center gap-2">
                  <Database className="w-4 h-4" />
                  ملفاتك المحفوظة
                </h4>
                {userFiles.length > 0 ? (
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {userFiles.map((file) => (
                      <button
                        key={file.file_name}
                        onClick={() => handleLoadUserFile(file.file_name)}
                        className="w-full text-right p-3 bg-green-800/20 hover:bg-green-700/30 rounded-lg transition-colors border border-green-600/30 hover:border-green-500/50"
                        disabled={processing.isProcessing}
                      >
                        <div className="flex justify-between items-start">
                          <div className="text-right">
                            <div className="text-white font-medium text-sm truncate max-w-[200px]">
                              {file.file_name.replace(/_\d{4}-\d{2}-\d{2}-\d{2}-\d{2}-\d{2}$/, "")}
                            </div>
                            <div className="text-green-400 text-xs">{file.students_count} طالب</div>
                            <div className="text-gray-500 text-xs">{formatDate(file.uploaded_at)}</div>
                          </div>
                          <div className="flex-shrink-0 bg-green-500/20 text-green-300 px-2 py-1 rounded text-xs">
                            {file.students_count}
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="text-center text-gray-400 py-8">
                    <Database className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p>لا توجد ملفات محفوظة</p>
                    <p className="text-xs mt-1">قم برفع ملف جديد لحفظه</p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* قسم الملفات العامة للمستخدمين غير المسجلين */}
        {!user && (
          <div className="space-y-3">
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
                            {file.file_name.replace(/_\d{4}-\d{2}-\d{2}-\d{2}-\d{2}-\d{2}$/, "")}
                          </div>
                          <div className="text-gray-400 text-xs">
                            {file.students_count} طالب • {file.uploader_name}
                          </div>
                          <div className="text-gray-500 text-xs">{formatDate(file.uploaded_at)}</div>
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

        {/* رسالة معالجة */}
        {processing.message && !processing.isProcessing && (
          <div className="p-3 bg-green-500/20 border border-green-500/30 rounded-full">
            <p className="text-green-200 text-center truncate overflow-hidden whitespace-nowrap">
              {processing.message}
            </p>
          </div>
        )}

        {/* زر البحث */}
        {studentsCount > 0 && !processing.isProcessing && (
          <div className="pt-4">
            <Link href="/search" className="block">
              <button className="w-full bg-gradient-to-r from-blue-500 to-green-500 hover:from-blue-600 hover:to-green-600 text-white font-medium py-3 px-6 rounded-full transition-all duration-300 transform hover:scale-105 hover:shadow-lg flex items-center justify-center gap-2">
                <Search className="w-5 h-5" />
                <span>ابدأ البحث في البيانات</span>
                <span className="bg-white/20 px-2 py-1 rounded-full text-sm">{studentsCount} طالب</span>
              </button>
            </Link>
          </div>
        )}

        {/* رسالة ترحيب */}
        {studentsCount === 0 && !processing.isProcessing && (
          <div className="text-center">
            <div className="flex bg-gray-950/10 backdrop-blur rounded-tl-full p-2 border border-white/20">
              <div className="flex flex-wrap justify-center items-center text-sm text-white/70">
                <span>
                  {user
                    ? "بصيغة إكسل فقط, نتميّز بسرعة معالجة البيانات"
                    : "ارفع ملفك أو تصفح الملفات المتاحة - بصيغة إكسل فقط"}
                </span>
              </div>
            </div>

            {!user && (
              <div className="mt-3 p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg">
                <p className="text-amber-200 text-xs">💡 سجل الدخول لحفظ ملفاتك والوصول إليها في أي وقت</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

// تصدير المكون كـ default export
export default FileUploadSectionFixed
