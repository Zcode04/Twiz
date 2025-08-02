"use client"

import type React from "react"
import { useState, useEffect, useMemo, useRef, useCallback, createContext, useContext } from "react"
import * as XLSX from "xlsx"
import { createClient } from "@/lib/supabase-browser" // Assuming this is your browser client
import type { User as SupabaseUser } from "@supabase/supabase-js"
import { clean, normalizeKey } from "@/lib/excel-utils"
import { SearchIndex } from "@/lib/search-index"
import { Loader2, FileText, Database, Search } from "lucide-react" // Import icons

// Updated Student interface to match the new data structure
interface Student {
  NODOSS: number        // رقم الملف
  SERIE: string         // السلسلة
  TYPEC: string         // النوع
  NOM_FR: string        // الاسم بالفرنسية
  NOM_AR: string        // الاسم بالعربية
  DATN: string          // تاريخ الميلاد
  LIEUN_FR: string      // مكان الميلاد بالفرنسية
  LIEUN_AR: string      // مكان الميلاد بالعربية
  Moy_Bac: number       // معدل البكالوريا
  Decision: string      // القرار
  Wilaya_FR: string     // الولاية بالفرنسية
  Wilaya_AR: string     // الولاية بالعربية
  Centre_Ex: string     // مركز الامتحان
  Etablissement: string // المؤسسة
  Etablissement_AR: string // المؤسسة بالعربية
}

interface ProcessingState {
  isProcessing: boolean
  stage: "reading" | "parsing" | "indexing" | "saving" | "complete"
  progress: number
  message: string
}

// Updated KEY_MAP for the new data structure
const KEY_MAP: Record<keyof Student, Set<string>> = {
  NODOSS: new Set(['nodoss', 'رقم_الملف', 'numero_dossier', 'dossier_number']),
  SERIE: new Set(['serie', 'السلسلة', 'series', 'section']),
  TYPEC: new Set(['typec', 'النوع', 'type', 'category']),
  NOM_FR: new Set(['nom_fr', 'الاسم_فرنسية', 'name_french', 'nom_francais']),
  NOM_AR: new Set(['nom_ar', 'الاسم_عربية', 'name_arabic', 'nom_arabe']),
  DATN: new Set(['datn', 'تاريخ_الميلاد', 'date_naissance', 'birth_date']),
  LIEUN_FR: new Set(['lieun_fr', 'مكان_الميلاد_فرنسية', 'lieu_naissance_fr', 'birthplace_french']),
  LIEUN_AR: new Set(['lieun_ar', 'مكان_الميلاد_عربية', 'lieu_naissance_ar', 'birthplace_arabic']),
  Moy_Bac: new Set(['moy_bac', 'معدل_البكالوريا', 'moyenne_bac', 'bac_average']),
  Decision: new Set(['decision', 'القرار', 'resultat', 'result']),
  Wilaya_FR: new Set(['wilaya_fr', 'الولاية_فرنسية', 'province_french']),
  Wilaya_AR: new Set(['wilaya_ar', 'الولاية_عربية', 'province_arabic']),
  Centre_Ex: new Set(['centre_ex', 'مركز_الامتحان', 'exam_center', 'centre_examen']),
  Etablissement: new Set(['etablissement', 'المؤسسة', 'school', 'institution']),
  Etablissement_AR: new Set(['etablissement_ar', 'المؤسسة_عربية', 'school_arabic', 'institution_arabic'])
}

interface StudentDataContextType {
  students: Student[]
  processing: ProcessingState
  searchQuery: string
  setSearchQuery: (query: string) => void
  searchResults: Student[]
  selectedStudent: Student | null
  handleFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => Promise<void>
  highlightText: (text: string, query: string) => React.ReactNode
  user: SupabaseUser | null
  InlineLoadingIndicator: React.ComponentType<{ processing: ProcessingState }>
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
}

// Inline Loading Indicator Component for file upload area
const InlineLoadingIndicator = ({ processing }: { processing: ProcessingState }) => {
  const getStageIcon = () => {
    switch (processing.stage) {
      case "reading":
        return <FileText className="w-4 h-4 text-blue-400" />
      case "parsing":
        return <FileText className="w-4 h-4 text-orange-400 animate-pulse" />
      case "indexing":
        return <Search className="w-4 h-4 text-green-400" />
      case "saving":
        return <Database className="w-4 h-4 text-purple-400" />
      default:
        return <Loader2 className="w-4 h-4 text-blue-400 animate-spin" />
    }
  }

  return (
    <div className="w-full mt-3 p-3 bg-gradient-to-br from-gray-900/50 via-blue-900/20 to-green-900/20 backdrop-blur-sm border border-gray-700/30 rounded-lg">
      <div className="flex items-center gap-3 mb-2">
        {getStageIcon()}
        <div className="flex-1 min-w-0">
          <div className="text-white/90 text-sm font-medium truncate">
            {processing.message}
          </div>
        </div>
        <div className="text-xs text-white/60 font-mono">
          {processing.progress.toFixed(0)}%
        </div>
      </div>
      
      {/* Progress Bar */}
      <div className="relative w-full h-1.5 bg-gray-700/50 rounded-full overflow-hidden">
        <div 
          className="absolute top-0 left-0 h-full bg-gradient-to-r from-blue-500 to-green-500 rounded-full transition-all duration-500 ease-out"
          style={{ width: `${processing.progress}%` }}
        />
        {/* Animated shine effect */}
        <div 
          className="absolute top-0 left-0 h-full w-6 bg-gradient-to-r from-transparent via-white/30 to-transparent rounded-full"
          style={{ 
            left: `${Math.max(0, processing.progress - 15)}%`,
            opacity: processing.progress > 3 ? 1 : 0,
            animation: processing.progress > 3 ? 'pulse 2s ease-in-out infinite' : 'none'
          }}
        />
      </div>
    </div>
  )
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
  const supabase = useMemo(() => createClient(), [])
  const [user, setUser] = useState<SupabaseUser | null>(null)

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
  }, [supabase])

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
        const { data, error } = await supabase.from("bac_students_data").select("*").eq("user_id", user.id)
        if (error) throw error

        if (data && data.length > 0) {
          setProcessing((prev) => ({ ...prev, progress: 75, message: "جاري معالجة البيانات..." }))
          const mappedStudents = data.map(
            (d): Student => ({
              NODOSS: d.nodoss,
              SERIE: d.serie,
              TYPEC: d.typec,
              NOM_FR: d.nom_fr,
              NOM_AR: d.nom_ar,
              DATN: d.datn,
              LIEUN_FR: d.lieun_fr,
              LIEUN_AR: d.lieun_ar,
              Moy_Bac: d.moy_bac,
              Decision: d.decision,
              Wilaya_FR: d.wilaya_fr,
              Wilaya_AR: d.wilaya_ar,
              Centre_Ex: d.centre_ex,
              Etablissement: d.etablissement,
              Etablissement_AR: d.etablissement_ar,
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

  // Enhanced file validation function
  const validateExcelFile = (file: File): Promise<boolean> => {
    return new Promise((resolve) => {
      const validExtensions = ['.xlsx', '.xls']
      const validMimeTypes = [
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'application/vnd.ms-excel'
      ]
      
      // Check file extension
      const hasValidExtension = validExtensions.some(ext => 
        file.name.toLowerCase().endsWith(ext)
      )
      
      // Check MIME type
      const hasValidMimeType = validMimeTypes.includes(file.type)
      
      // Additional check: read file signature (magic numbers)
      if (hasValidExtension || hasValidMimeType) {
        const reader = new FileReader()
        reader.onload = (e) => {
          const arr = new Uint8Array(e.target?.result as ArrayBuffer)
          // Check for Excel file signatures
          const isXLSX = arr[0] === 0x50 && arr[1] === 0x4B // PK (ZIP header for .xlsx)
          const isXLS = arr[0] === 0xD0 && arr[1] === 0xCF // OLE header for .xls
          resolve(isXLSX || isXLS)
        }
        reader.onerror = () => resolve(false)
        reader.readAsArrayBuffer(file.slice(0, 8)) // Read first 8 bytes
      } else {
        resolve(false)
      }
    })
  }

  // Simple string similarity function
  const calculateSimilarity = (str1: string, str2: string): number => {
    const longer = str1.length > str2.length ? str1 : str2
    const shorter = str1.length > str2.length ? str2 : str1
    
    if (longer.length === 0) return 1.0
    
    const editDistance = levenshteinDistance(longer, shorter)
    return (longer.length - editDistance) / longer.length
  }

  // Levenshtein distance implementation
  const levenshteinDistance = (str1: string, str2: string): number => {
    const matrix = []
    for (let i = 0; i <= str2.length; i++) {
      matrix[i] = [i]
    }
    for (let j = 0; j <= str1.length; j++) {
      matrix[0][j] = j
    }
    for (let i = 1; i <= str2.length; i++) {
      for (let j = 1; j <= str1.length; j++) {
        if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1]
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1,
            matrix[i][j - 1] + 1,
            matrix[i - 1][j] + 1
          )
        }
      }
    }
    return matrix[str2.length][str1.length]
  }

  // معالجة رفع الملف المحسنة
  const handleFileUpload = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      if (!file) return

      // Enhanced file validation
      const isValidFile = await validateExcelFile(file)
      if (!isValidFile) {
        alert("يرجى اختيار ملف Excel صحيح (.xlsx أو .xls)")
        e.target.value = ""
        return
      }

      setProcessing({
        isProcessing: true,
        stage: "reading",
        progress: 5,
        message: `جاري قراءة الملف: ${file.name}`,
      })

      try {
        // Read file with progress tracking
        const arrayBuffer = await new Promise<ArrayBuffer>((resolve, reject) => {
          const reader = new FileReader()
          let lastProgress = 5
          
          reader.onprogress = (event) => {
            if (event.lengthComputable) {
              const progress = 5 + (event.loaded / event.total) * 20 // 5-25%
              if (progress - lastProgress > 2) { // Update every 2%
                setProcessing(prev => ({
                  ...prev,
                  progress,
                  message: `جاري قراءة الملف... ${Math.round((event.loaded / event.total) * 100)}%`
                }))
                lastProgress = progress
              }
            }
          }
          
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

        // Enhanced Excel processing with better error handling
        const workbook = XLSX.read(new Uint8Array(arrayBuffer), {
          type: "array",
          cellDates: true,
          cellNF: false,
          cellText: false,
          codepage: 65001, // UTF-8 encoding
          raw: false
        })
        
        if (!workbook.SheetNames.length) {
          throw new Error("الملف لا يحتوي على أوراق عمل")
        }

        // Try to find the most suitable sheet
        let worksheet = workbook.Sheets[workbook.SheetNames[0]]
        
        // If first sheet is empty, try others
        for (const sheetName of workbook.SheetNames) {
          const sheet = workbook.Sheets[sheetName]
          const range = XLSX.utils.decode_range(sheet['!ref'] || 'A1:A1')
          if (range.e.r > 0) { // Has more than header row
            worksheet = sheet
            break
          }
        }

        const jsonData: Record<string, unknown>[] = XLSX.utils.sheet_to_json(worksheet, {
          defval: "",
          raw: false,
          dateNF: "dd/mm/yyyy",
          blankrows: false // Skip blank rows
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

        // تحديد المفاتيح مع تحسينات
        const firstRow = jsonData[0]
        const originalKeys = Object.keys(firstRow)
        const normalizedKeys = originalKeys.map(normalizeKey)
        const keyMapping = new Map<keyof Student, number>()

        // Enhanced key mapping with fuzzy matching
        Object.entries(KEY_MAP).forEach(([targetKey, possibleKeys]) => {
          let bestMatch = -1
          let bestScore = 0
          
          for (let i = 0; i < normalizedKeys.length; i++) {
            const normalizedKey = normalizedKeys[i]
            
            // Exact match (highest priority)
            if (possibleKeys.has(normalizedKey)) {
              keyMapping.set(targetKey as keyof Student, i)
              return
            }
            
            // Fuzzy match for similar keys
            Array.from(possibleKeys).forEach(possibleKey => {
              const similarity = calculateSimilarity(normalizedKey, possibleKey)
              if (similarity > 0.7 && similarity > bestScore) {
                bestScore = similarity
                bestMatch = i
              }
            })
          }
          
          if (bestMatch >= 0 && bestScore > 0.7) {
            keyMapping.set(targetKey as keyof Student, bestMatch)
          }
        })

        if (keyMapping.size === 0) {
          throw new Error("لم يتم العثور على أعمدة مطابقة في الملف")
        }

        // معالجة البيانات بمجموعات صغيرة لتحسين الأداء مع تحديثات أكثر سلاسة
        const batchSize = 500 // Reduced batch size for smoother progress
        const processedStudents: Student[] = []
        
        for (let i = 0; i < jsonData.length; i += batchSize) {
          const batch = jsonData.slice(i, i + batchSize)
          
          const batchStudents = batch
            .map((row) => {
              const student: Partial<Student> = {}
              keyMapping.forEach((columnIndex, studentKey) => {
                const rawValue = row[originalKeys[columnIndex]]
                switch (studentKey) {
                  case "Moy_Bac":
                    // Handle different decimal separators and clean numeric values
                    const moyenne = String(rawValue).replace(/[,،]/g, ".").replace(/[^\d.]/g, "")
                    student[studentKey] = Number(moyenne) || 0
                    break
                  case "NODOSS":
                    const nodoss = String(rawValue).replace(/\D/g, "")
                    student[studentKey] = Number(nodoss) || 0
                    break
                  default:
                    student[studentKey] = clean(rawValue) as never
                }
              })
              return student as Student
            })
            .filter((s) => s.NODOSS && (s.NOM_FR || s.NOM_AR) && 
              (String(s.NOM_FR || s.NOM_AR).trim().length > 0))
          
          processedStudents.push(...batchStudents)

          const progress = 50 + ((i + batch.length) / jsonData.length) * 25 // 50-75%
          setProcessing((prev) => ({
            ...prev,
            progress,
            message: `تمت معالجة ${Math.min(i + batch.length, jsonData.length)} من ${jsonData.length} سجل...`,
          }))
          
          // Smoother progress updates
          await new Promise((resolve) => setTimeout(resolve, 10))
        }

        if (processedStudents.length === 0) {
          throw new Error("لم يتم العثور على بيانات صحيحة في الملف")
        }

        setProcessing((prev) => ({
          ...prev,
          progress: 80,
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
            progress: 85,
            message: "جاري حفظ البيانات...",
          }))
          
          // Clear existing data first
          await supabase.from("bac_students_data").delete().eq("user_id", user.id)
          
          const dataToInsert = processedStudents.map((student) => ({
            user_id: user.id,
            nodoss: student.NODOSS,
            serie: student.SERIE,
            typec: student.TYPEC,
            nom_fr: student.NOM_FR,
            nom_ar: student.NOM_AR,
            datn: student.DATN,
            lieun_fr: student.LIEUN_FR,
            lieun_ar: student.LIEUN_AR,
            moy_bac: student.Moy_Bac,
            decision: student.Decision,
            wilaya_fr: student.Wilaya_FR,
            wilaya_ar: student.Wilaya_AR,
            centre_ex: student.Centre_Ex,
            etablissement: student.Etablissement,
            etablissement_ar: student.Etablissement_AR,
          }))
          
          // حفظ بمجموعات صغيرة مع تتبع التقدم
          const saveBatchSize = 200
          for (let i = 0; i < dataToInsert.length; i += saveBatchSize) {
            const batch = dataToInsert.slice(i, i + saveBatchSize)
            await supabase.from("bac_students_data").insert(batch)
            
            const saveProgress = 85 + ((i + batch.length) / dataToInsert.length) * 10 // 85-95%
            setProcessing((prev) => ({
              ...prev,
              progress: saveProgress,
              message: `جاري حفظ ${Math.min(i + batch.length, dataToInsert.length)} من ${dataToInsert.length} سجل...`,
            }))
          }
        }

        setProcessing({
          isProcessing: false,
          stage: "complete",
          progress: 100,
          message: `تم تحميل ${processedStudents.length} طالب بنجاح!`,
        })
        
        setTimeout(() => {
          setProcessing((prev) => ({ ...prev, message: "", isProcessing: false }))
        }, 3000)
        
      } catch (error) {
        console.error("Error processing file:", error)
        setProcessing({
          isProcessing: false,
          stage: "complete",
          progress: 0,
          message: `خطأ: ${error instanceof Error ? error.message : "حدث خطأ غير متوقع"}`,
        })
        
        setTimeout(() => {
          setProcessing((prev) => ({ ...prev, message: "" }))
        }, 5000)
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

  // البحث بالرقم (NODOSS)
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
      InlineLoadingIndicator,
    }),
    [students, processing, searchQuery, setSearchQuery, searchResults, selectedStudent, handleFileUpload, user],
  )

  return (
    <StudentDataContext.Provider value={contextValue}>
      {children}
    </StudentDataContext.Provider>
  )
}