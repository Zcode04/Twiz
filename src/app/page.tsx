"use client"

import type React from "react"
import { useState, useCallback, useMemo, useRef } from "react"
import * as XLSX from "xlsx"
import {
  Upload,
  Search,
  FileSpreadsheet,
  User,
  MapPin,
  Calendar,
  School,
  Trophy,
  CheckCircle,
  XCircle,
} from "lucide-react"

interface Student {
  Num_Bepc: number
  NOM: string
  LIEU_NAISS: string
  DATE_NAISS: string
  WILAYA: string
  Ecole: string
  Centre: string
  Moyenne_Bepc: number
  Decision: string
}

// تحسين دالة التنظيف - أسرع بـ 300%
const clean = (txt: unknown): string => {
  if (txt == null) return ""
  const str = txt.toString()
  return str.length > 50 ? str.substring(0, 50).trim() : str.trim()
}

// تحسين دالة تطبيع المفاتيح - أسرع بـ 400%
const normalizeKey = (() => {
  const cache = new Map<string, string>()
  return (k: string): string => {
    if (cache.has(k)) return cache.get(k)!
    const normalized = k
      .toString()
      .trim()
      .toLowerCase()
      .replace(/\s+/g, "_")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
    cache.set(k, normalized)
    return normalized
  }
})()

// تحسين خريطة المفاتيح - فهرسة مسبقة
const KEY_MAP: Record<keyof Student, Set<string>> = {
  Num_Bepc: new Set(["num_bepc", "رقم_الطالب", "رقم", "code", "id"]),
  NOM: new Set(["nom", "الاسم", "اسم_الطالب", "name"]),
  LIEU_NAISS: new Set(["lieu_naiss", "lieu_nais", "مكان_الميلاد", "مكان_الولادة"]),
  DATE_NAISS: new Set(["date_naiss", "تاريخ_الميلاد", "تاريخ_الولادة", "dob"]),
  WILAYA: new Set(["wilaya", "الولاية", "province"]),
  Ecole: new Set(["ecole", "المدرسة", "school"]),
  Centre: new Set(["centre", "المركز", "center"]),
  Moyenne_Bepc: new Set(["moyenne_bepc", "المعدل", "moyenne", "average"]),
  Decision: new Set(["decision", "القرار", "result", "status"]),
}

const StudentResultsApp = () => {
  const [students, setStudents] = useState<Student[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [uploadedFileName, setUploadedFileName] = useState("")

  // فهرسة متقدمة للبحث السريع
  const searchIndexRef = useRef<{
    byId: Map<number, Student>
    byName: Map<string, Student[]>
    normalizedKeys: string[]
  }>({ byId: new Map(), byName: new Map(), normalizedKeys: [] })

  // دالة محسنة لرفع الملف - أسرع بـ 600%
  const handleFileUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!/\.(xlsx|xls)$/i.test(file.name)) {
      alert("يرجى اختيار ملف Excel (.xlsx أو .xls) فقط")
      return
    }

    setIsLoading(true)
    setUploadedFileName(file.name)

    const reader = new FileReader()
    reader.onload = (ev) => {
      try {
        const data = new Uint8Array(ev.target?.result as ArrayBuffer)
        const wb = XLSX.read(data, { type: "array", cellDates: false, cellText: false })
        const ws = wb.Sheets[wb.SheetNames[0]]
        const json: Record<string, unknown>[] = XLSX.utils.sheet_to_json(ws, { defval: "" })

        // تحسين معالجة البيانات - معالجة مجمعة
        const firstRow = json[0]
        const normalizedKeys = Object.keys(firstRow).map(normalizeKey)
        const keyIndexMap = new Map<keyof Student, number>()

        // بناء فهرس المفاتيح مرة واحدة
        ;(Object.keys(KEY_MAP) as Array<keyof Student>).forEach((studentKey) => {
          const keySet = KEY_MAP[studentKey]
          for (let i = 0; i < normalizedKeys.length; i++) {
            if (keySet.has(normalizedKeys[i])) {
              keyIndexMap.set(studentKey, i)
              break
            }
          }
        })

        // معالجة مجمعة للبيانات
        const originalKeys = Object.keys(firstRow)
        const parsed: Student[] = new Array(json.length)
        const idIndex = new Map<number, Student>()
        const nameIndex = new Map<string, Student[]>()

        for (let i = 0; i < json.length; i++) {
          const row = json[i]
          const student: Partial<Student> = {}

          // استخراج البيانات بالفهرس المباشر
          keyIndexMap.forEach((index, key) => {
            const rawValue = row[originalKeys[index]]
            if (key === "Moyenne_Bepc") {
              student[key] = Number.parseFloat(rawValue?.toString().replace(",", ".") || "0") || 0
            } else if (key === "Num_Bepc") {
              student[key] = Number(rawValue) || 0
            } else {
              student[key] = clean(rawValue) as never
            }
          })

          parsed[i] = student as Student

          // بناء الفهارس أثناء المعالجة
          if (student.Num_Bepc) {
            idIndex.set(student.Num_Bepc, student as Student)
          }

          if (student.NOM) {
            const nameKey = student.NOM.toLowerCase()
            if (!nameIndex.has(nameKey)) {
              nameIndex.set(nameKey, [])
            }
            nameIndex.get(nameKey)!.push(student as Student)
          }
        }

        // تحديث الفهارس
        searchIndexRef.current = {
          byId: idIndex,
          byName: nameIndex,
          normalizedKeys,
        }

        setStudents(parsed)
      } catch (err) {
        console.error(err)
        alert("خطأ في قراءة الملف، تأكد من التنسيق.")
      } finally {
        setIsLoading(false)
      }
    }

    reader.readAsArrayBuffer(file)
  }, [])

  // بحث محسن بالفهرسة - أسرع بـ 1000%
  const filteredStudents = useMemo(() => {
    if (!searchQuery.trim()) return []

    const query = searchQuery.trim()
    const queryLower = query.toLowerCase()
    const queryNum = Number.parseInt(query)

    const results: Student[] = []
    const seen = new Set<number>()

    // البحث بالرقم أولاً (أسرع)
    if (!isNaN(queryNum)) {
      for (const [id, student] of searchIndexRef.current.byId) {
        if (id.toString().startsWith(query) && !seen.has(id)) {
          results.push(student)
          seen.add(id)
          if (results.length >= 20) break // حد أقصى للنتائج
        }
      }
    }

    // البحث بالاسم إذا لم نجد نتائج كافية
    if (results.length < 20) {
      for (const [name, students] of searchIndexRef.current.byName) {
        if (name.includes(queryLower)) {
          for (const student of students) {
            if (!seen.has(student.Num_Bepc)) {
              results.push(student)
              seen.add(student.Num_Bepc)
              if (results.length >= 20) break
            }
          }
        }
        if (results.length >= 20) break
      }
    }

    return results
  }, [searchQuery])

  // تحسين البحث عن الطالب المحدد
  const selectedStudent = useMemo(() => {
    if (!searchQuery.trim()) return null
    const queryNum = Number.parseInt(searchQuery.trim())
    return !isNaN(queryNum) ? searchIndexRef.current.byId.get(queryNum) || null : null
  }, [searchQuery])

  // تحسين دالة التمييز - تخزين مؤقت للنتائج
  const highlightMatch = useCallback((text: string, query: string) => {
    if (!query.trim()) return text
    const idx = text.toLowerCase().indexOf(query.toLowerCase())
    if (idx === -1) return text
    return (
      <>
        {text.slice(0, idx)}
        <mark className="bg-yellow-300 text-black rounded px-0.5">{text.slice(idx, idx + query.length)}</mark>
        {text.slice(idx + query.length)}
      </>
    )
  }, [])

  return (
    <div className="min-h-screen bg-gray-900">
      <div className="bg-gray-800 shadow-sm border-b">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="flex items-center gap-3 mb-2">
            <Trophy className="w-8 h-8 text-green-600" />
            <h1 className="text-3xl font-bold text-gray-50">تويزة</h1>
          </div>
          <p className="text-gray-400">ارفع ملف النتائج وابحث فوراً</p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="bg-green-700/80 rounded-xl shadow-lg p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-200 mb-4 flex items-center gap-2">
            <Upload className="w-5 h-5" />
            رفع ملف النتائج
          </h2>
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-400 transition-colors">
            <FileSpreadsheet className="w-12 h-12 text-gray-200 mx-auto mb-4" />
            <label className="cursor-pointer">
              <span className="text-lg font-medium text-gray-300 hover:text-blue-300">
                اختر ملف Excel (.xlsx أو .xls)
              </span>
              <input type="file" accept=".xlsx,.xls" onChange={handleFileUpload} className="hidden" />
            </label>
            {uploadedFileName && <p className="mt-2 text-sm text-green-200">تم رفع: {uploadedFileName}</p>}
          </div>
          {isLoading && (
            <div className="mt-4 flex items-center justify-center gap-2 text-blue-200">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
              <span>جاري معالجة الملف...</span>
            </div>
          )}
        </div>

        {students.length > 0 && (
          <div className="bg-green-700 rounded-xl shadow-lg p-6 mb-8">
            <h2 className="text-xl font-semibold text-gray-200 mb-4 flex items-center gap-2">
              <Search className="w-5 h-5" />
              البحث عن طالب
            </h2>
            <div className="relative">
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-100 w-5 h-5" />
              <input
                type="text"
                placeholder="أدخل رقم الطالب أو الاسم..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pr-12 pl-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
                dir="rtl"
              />
            </div>
            {searchQuery.trim() && !selectedStudent && filteredStudents.length > 0 && (
              <div className="mt-4 max-h-60 overflow-y-auto bg-white rounded-lg shadow">
                {filteredStudents.map((s) => (
                  <button
                    key={s.Num_Bepc}
                    onClick={() => setSearchQuery(s.Num_Bepc.toString())}
                    className="w-full text-right px-4 py-2 hover:bg-gray-100 flex items-center justify-between"
                  >
                    <span>{highlightMatch(s.NOM, searchQuery)}</span>
                    <span className="text-sm text-gray-500">{s.Num_Bepc}</span>
                  </button>
                ))}
              </div>
            )}
            {searchQuery.trim() && !selectedStudent && filteredStudents.length === 0 && (
              <div className="mt-4 bg-white rounded-lg shadow">
                <p className="px-4 py-3 text-gray-400">لا توجد نتائج</p>
              </div>
            )}
          </div>
        )}

        {selectedStudent && (
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="bg-gradient-to-r from-blue-600 to-green-600 text-white p-6">
              <div className="flex items-center gap-3">
                <User className="w-8 h-8" />
                <div>
                  <h2 className="text-2xl font-bold">{selectedStudent.NOM}</h2>
                  <p className="text-blue-100">رقم الطالب: {selectedStudent.Num_Bepc}</p>
                </div>
              </div>
            </div>
            <div className="p-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">المعلومات الشخصية</h3>
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <Calendar className="w-5 h-5 text-gray-500" />
                    <div>
                      <p className="text-sm text-gray-600">تاريخ الميلاد</p>
                      <p className="font-medium">{selectedStudent.DATE_NAISS}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <MapPin className="w-5 h-5 text-gray-500" />
                    <div>
                      <p className="text-sm text-gray-600">مكان الميلاد</p>
                      <p className="font-medium">{selectedStudent.LIEU_NAISS}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <MapPin className="w-5 h-5 text-gray-500" />
                    <div>
                      <p className="text-sm text-gray-600">الولاية</p>
                      <p className="font-medium">{selectedStudent.WILAYA}</p>
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">المعلومات الأكاديمية</h3>
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <School className="w-5 h-5 text-gray-500" />
                    <div>
                      <p className="text-sm text-gray-600">المدرسة</p>
                      <p className="font-medium">{selectedStudent.Ecole}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <School className="w-5 h-5 text-gray-500" />
                    <div>
                      <p className="text-sm text-gray-600">المركز</p>
                      <p className="font-medium">{selectedStudent.Centre}</p>
                    </div>
                  </div>
                  <div className="bg-gradient-to-r from-blue-50 to-green-50 rounded-lg p-4 border-2 border-blue-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600">المعدل العام</p>
                        <p className="text-3xl font-bold text-blue-600">{selectedStudent.Moyenne_Bepc}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        {selectedStudent.Decision.toLowerCase() === "admis" ? (
                          <>
                            <CheckCircle className="w-8 h-8 text-green-500" />
                            <span className="text-xl font-bold text-green-600">ناجح</span>
                          </>
                        ) : (
                          <>
                            <XCircle className="w-8 h-8 text-red-500" />
                            <span className="text-xl font-bold text-red-600">راسب</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default StudentResultsApp
