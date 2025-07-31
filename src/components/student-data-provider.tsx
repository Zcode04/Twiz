"use client"

import type React from "react"
import { useState, useEffect, useMemo, useRef, useCallback, createContext, useContext } from "react"
import * as XLSX from "xlsx"
import { createClient } from "@/lib/supabase-browser" // Assuming this is your browser client
import type { User as SupabaseUser } from "@supabase/supabase-js"
import { clean, normalizeKey, KEY_MAP } from "@/lib/excel-utils"
import { SearchIndex } from "@/lib/search-index"
import type { Student, ProcessingState } from "@/lib/types"
import { Loader2 } from "lucide-react" // Import Loader2 for loading state

interface StudentDataContextType {
  students: Student[]
  processing: ProcessingState
  searchQuery: string
  setSearchQuery: (query: string) => void
  searchResults: Student[]
  selectedStudent: Student | null
  handleFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => Promise<void>
  highlightText: (text: string, query: string) => React.ReactNode
  user: SupabaseUser | null // Pass user from parent or fetch here
}

const StudentDataContext = createContext<StudentDataContextType | undefined>(undefined)

export function useStudentData() {
  const context = useContext(StudentDataContext)
  if (context === undefined) {
    throw new Error("useStudentData must be used within a StudentDataProvider")
  }
  return context
}

interface StudentDataProviderProps {
  children: React.ReactNode
  // initialUser: SupabaseUser | null // No longer needed as prop
}

export function StudentDataProvider({ children }: StudentDataProviderProps) {
  const [students, setStudents] = useState<Student[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [processing, setProcessing] = useState<ProcessingState>({
    isProcessing: false,
    stage: "reading",
    progress: 0,
    message: "",
  })
  const searchIndexRef = useRef<SearchIndex | null>(null)
  const supabase = useMemo(() => createClient(), []) // Memoize Supabase client
  const [user, setUser] = useState<SupabaseUser | null>(null) // Initialize user as null

  // Fetch user session on mount and listen for auth state changes
  useEffect(() => {
    const fetchAndListenUser = async () => {
      // Fetch initial user session
      const {
        data: { user: initialFetchedUser },
      } = await supabase.auth.getUser()
      setUser(initialFetchedUser)

      // Listen for auth state changes
      const {
        data: { subscription },
      } = supabase.auth.onAuthStateChange((_event, session) => {
        setUser(session?.user || null)
      })

      return () => {
        subscription?.unsubscribe()
      }
    }
    fetchAndListenUser()
  }, [supabase]) // Dependency on supabase client

  // تحميل البيانات المحفوظة عند تسجيل الدخول
  useEffect(() => {
    if (!user) return

    const loadUserData = async () => {
      setProcessing({
        isProcessing: true,
        stage: "reading",
        progress: 25,
        message: "جاري تحميل البيانات المحفوظة...",
      })
      try {
        const { data, error } = await supabase.from("students_data").select("*").eq("user_id", user.id)
        if (error) throw error

        if (data && data.length > 0) {
          setProcessing((prev) => ({ ...prev, progress: 75, message: "جاري معالجة البيانات..." }))
          const mappedStudents = data.map(
            (d): Student => ({
              Num_Bepc: d.num_bepc,
              NOM: d.nom,
              LIEU_NAISS: d.lieu_naiss,
              DATE_NAISS: d.date_naiss,
              WILAYA: d.wilaya,
              Ecole: d.ecole,
              Centre: d.centre,
              Moyenne_Bepc: d.moyenne_bepc,
              Decision: d.decision,
            }),
          )
          setStudents(mappedStudents)
          searchIndexRef.current = new SearchIndex(mappedStudents)
          setProcessing({
            isProcessing: false,
            stage: "complete",
            progress: 100,
            message: `تم تحميل ${mappedStudents.length} طالب بنجاح`,
          })
          setTimeout(() => {
            setProcessing((prev) => ({ ...prev, message: "" }))
          }, 2000)
        } else {
          setProcessing({ isProcessing: false, stage: "complete", progress: 0, message: "" })
        }
      } catch (error) {
        console.error("Error loading data:", error)
        setProcessing({
          isProcessing: false,
          stage: "complete",
          progress: 0,
          message: "خطأ في تحميل البيانات",
        })
      }
    }
    loadUserData()
  }, [user, supabase])

  // معالجة رفع الملف المحسنة
  const handleFileUpload = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      if (!file) return

      // التحقق من نوع الملف
      const validTypes = [
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "application/vnd.ms-excel",
      ]
      if (!validTypes.includes(file.type) && !file.name.match(/\.(xlsx|xls)$/i)) {
        alert("يرجى اختيار ملف Excel صحيح (.xlsx أو .xls)")
        return
      }

      setProcessing({
        isProcessing: true,
        stage: "reading",
        progress: 10,
        message: `جاري قراءة الملف: ${file.name}`,
      })

      try {
        const arrayBuffer = await new Promise<ArrayBuffer>((resolve, reject) => {
          const reader = new FileReader()
          reader.onload = (event) => {
            if (event.target?.result) {
              resolve(event.target.result as ArrayBuffer)
            } else {
              reject(new Error("فشل في قراءة الملف"))
            }
          }
          reader.onerror = () => reject(new Error("خطأ في قراءة الملف"))
          reader.readAsArrayBuffer(file)
        })

        setProcessing((prev) => ({
          ...prev,
          stage: "parsing",
          progress: 30,
          message: "جاري تحليل البيانات...",
        }))

        // معالجة الملف
        const workbook = XLSX.read(new Uint8Array(arrayBuffer), {
          type: "array",
          cellDates: true,
          cellNF: false,
          cellText: false,
        })
        if (!workbook.SheetNames.length) {
          throw new Error("الملف لا يحتوي على أوراق عمل")
        }
        const worksheet = workbook.Sheets[workbook.SheetNames[0]]
        const jsonData: Record<string, unknown>[] = XLSX.utils.sheet_to_json(worksheet, {
          defval: "",
          raw: false,
          dateNF: "dd/mm/yyyy",
        })

        if (!jsonData.length) {
          throw new Error("الملف فارغ أو لا يحتوي على بيانات")
        }

        setProcessing((prev) => ({
          ...prev,
          stage: "indexing",
          progress: 50,
          message: `جاري معالجة ${jsonData.length} سجل...`,
        }))

        // تحديد المفاتيح
        const firstRow = jsonData[0]
        const originalKeys = Object.keys(firstRow)
        const normalizedKeys = originalKeys.map(normalizeKey)
        const keyMapping = new Map<keyof Student, number>()

        Object.entries(KEY_MAP).forEach(([targetKey, possibleKeys]) => {
          for (let i = 0; i < normalizedKeys.length; i++) {
            if (possibleKeys.has(normalizedKeys[i])) {
              keyMapping.set(targetKey as keyof Student, i)
              break
            }
          }
        })

        if (keyMapping.size === 0) {
          throw new Error("لم يتم العثور على أعمدة مطابقة في الملف")
        }

        // معالجة البيانات بمجموعات صغيرة لتحسين الأداء
        const batchSize = 1000
        const processedStudents: Student[] = []
        for (let i = 0; i < jsonData.length; i += batchSize) {
          const batch = jsonData.slice(i, i + batchSize)
          const batchStudents = batch
            .map((row) => {
              const student: Partial<Student> = {}
              keyMapping.forEach((columnIndex, studentKey) => {
                const rawValue = row[originalKeys[columnIndex]]
                switch (studentKey) {
                  case "Moyenne_Bepc":
                    student[studentKey] = Number(String(rawValue).replace(",", ".")) || 0
                    break
                  case "Num_Bepc":
                    student[studentKey] = Number(rawValue) || 0
                    break
                  default:
                    student[studentKey] = clean(rawValue) as never
                }
              })
              return student as Student
            })
            .filter((s) => s.Num_Bepc && s.NOM) // تصفية السجلات غير المكتملة
          processedStudents.push(...batchStudents)

          const progress = 50 + ((i + batch.length) / jsonData.length) * 30
          setProcessing((prev) => ({
            ...prev,
            progress,
            message: `تمت معالجة ${i + batch.length} من ${jsonData.length} سجل...`,
          }))
          // إعطاء المتصفح فرصة للتحديث
          await new Promise((resolve) => setTimeout(resolve, 0))
        }

        if (processedStudents.length === 0) {
          throw new Error("لم يتم العثور على بيانات صحيحة في الملف")
        }

        setProcessing((prev) => ({
          ...prev,
          progress: 85,
          message: "جاري إنشاء فهرس البحث...",
        }))

        // إنشاء فهرس البحث
        const searchIndex = new SearchIndex(processedStudents)
        searchIndexRef.current = searchIndex
        setStudents(processedStudents)

        // حفظ في قاعدة البيانات إذا كان المستخدم مسجلاً
        if (user) {
          setProcessing((prev) => ({
            ...prev,
            stage: "saving",
            progress: 90,
            message: "جاري حفظ البيانات...",
          }))
          const dataToInsert = processedStudents.map((student) => ({
            user_id: user.id,
            num_bepc: student.Num_Bepc,
            nom: student.NOM,
            lieu_naiss: student.LIEU_NAISS,
            date_naiss: student.DATE_NAISS,
            wilaya: student.WILAYA,
            ecole: student.Ecole,
            centre: student.Centre,
            moyenne_bepc: student.Moyenne_Bepc,
            decision: student.Decision,
          }))
          // حفظ بمجموعات صغيرة لتجنب مشاكل الحد الأقصى
          const saveBatchSize = 500
          for (let i = 0; i < dataToInsert.length; i += saveBatchSize) {
            const batch = dataToInsert.slice(i, i + saveBatchSize)
            await supabase.from("students_data").upsert(batch, {
              onConflict: "user_id,num_bepc",
            })
          }
        }

        setProcessing({
          isProcessing: false,
          stage: "complete",
          progress: 100,
          message: `تم تحميل ${processedStudents.length} طالب بنجاح!`,
        })
        setTimeout(() => {
          setProcessing((prev) => ({ ...prev, message: "" }))
        }, 3000)
      } catch (error) {
        console.error("Error processing file:", error)
        setProcessing({
          isProcessing: false,
          stage: "complete",
          progress: 0,
          message: `خطأ: ${error instanceof Error ? error.message : "حدث خطأ غير متوقع"}`,
        })
      }
      // إعادة تعيين input
      e.target.value = ""
    },
    [user, supabase],
  )

  // البحث المحسن
  const searchResults = useMemo(() => {
    if (!searchIndexRef.current || !searchQuery.trim()) return []
    return searchIndexRef.current.search(searchQuery)
  }, [searchQuery])

  const selectedStudent = useMemo(() => {
    const qNum = Number(searchQuery.trim())
    if (!searchIndexRef.current || isNaN(qNum)) return null
    return searchIndexRef.current.getById(qNum)
  }, [searchQuery])

  // تمييز النص في نتائج البحث
  const highlightText = (text: string, query: string) => {
    if (!query.trim()) return text
    const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`, "gi")
    const parts = text.split(regex)
    return (
      <>
        {parts.map((part, i) =>
          regex.test(part) ? (
            <mark key={i} className="bg-yellow-300 text-black rounded px-0.5">
              {part}
            </mark>
          ) : (
            <span key={i}>{part}</span>
          ),
        )}
      </>
    )
  }

  const contextValue = useMemo(
    () => ({
      students,
      processing,
      searchQuery,
      setSearchQuery,
      searchResults,
      selectedStudent,
      handleFileUpload,
      highlightText,
      user,
    }),
    [students, processing, searchQuery, setSearchQuery, searchResults, selectedStudent, handleFileUpload, user],
  )

  // Show a loading indicator while data is being processed
  if (processing.isProcessing && students.length === 0) {
    return (
      <div className="flex min-h-[calc(100vh-128px)] flex-col items-center justify-center p-4 text-center bg-gradient-to-br from-gray-900 via-blue-900 to-green-900 text-white">
        <Loader2 className="w-16 h-16 animate-spin text-white/70 mb-4" />
        <h2 className="text-2xl font-bold mb-2">{processing.message}</h2>
        <p className="text-white/70">{processing.progress.toFixed(0)}%</p>
      </div>
    )
  }

  return <StudentDataContext.Provider value={contextValue}>{children}</StudentDataContext.Provider>
}
