"use client"

import { UserIcon, MapPin, Calendar, School, CheckCircle, XCircle } from "lucide-react"
import type { Student } from "@/lib/types"
import { cn } from "@/lib/utils"

interface StudentDetailsDisplayProps {
  selectedStudent: Student
}

export default function StudentDetailsDisplay({ selectedStudent }: StudentDetailsDisplayProps) {
  return (
    <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
      <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-green-600 text-white p-8">
        <div className="flex items-center gap-4">
          <div className="bg-white/20 p-3 rounded-full">
            <UserIcon className="w-8 h-8" />
          </div>
          <div>
            <h2 className="text-3xl font-bold mb-1">{selectedStudent.NOM}</h2>
            <p className="text-white/90 text-lg">رقم الطالب: {selectedStudent.Num_Bepc}</p>
            <p className="text-white/70">{selectedStudent.WILAYA}</p>
          </div>
        </div>
      </div>
      <div className="p-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* المعلومات الشخصية */}
          <div className="space-y-6">
            <h3 className="text-xl font-bold text-gray-900 border-b-2 border-blue-200 pb-2">المعلومات الشخصية</h3>
            <div className="space-y-4">
              <div className="flex items-start gap-3 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-100">
                <Calendar className="w-5 h-5 text-blue-600 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-gray-600">تاريخ الميلاد</p>
                  <p className="text-lg font-semibold text-gray-900">{selectedStudent.DATE_NAISS}</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border border-purple-100">
                <MapPin className="w-5 h-5 text-purple-600 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-gray-600">مكان الميلاد</p>
                  <p className="text-lg font-semibold text-gray-900">{selectedStudent.LIEU_NAISS}</p>
                </div>
              </div>
            </div>
          </div>
          {/* المعلومات الأكاديمية */}
          <div className="space-y-6">
            <h3 className="text-xl font-bold text-gray-900 border-b-2 border-green-200 pb-2">المعلومات الأكاديمية</h3>
            <div className="space-y-4">
              <div className="flex items-start gap-3 p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-100">
                <School className="w-5 h-5 text-green-600 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-gray-600">المدرسة</p>
                  <p className="text-lg font-semibold text-gray-900">{selectedStudent.Ecole}</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-4 bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl border border-amber-100">
                <MapPin className="w-5 h-5 text-amber-600 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-gray-600">مركز الامتحان</p>
                  <p className="text-lg font-semibold text-gray-900">{selectedStudent.Centre}</p>
                </div>
              </div>
            </div>
          </div>
          {/* النتيجة */}
          <div className="space-y-6">
            <h3 className="text-xl font-bold text-gray-900 border-b-2 border-yellow-200 pb-2">النتيجة النهائية</h3>
            <div className="bg-gradient-to-br from-blue-50 via-purple-50 to-green-50 rounded-2xl p-6 border-2 border-blue-200 shadow-lg">
              <div className="text-center space-y-4">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-2">المعدل العام</p>
                  <p className="text-5xl font-bold text-blue-600 mb-2">{selectedStudent.Moyenne_Bepc.toFixed(2)}</p>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-blue-400 to-green-400 h-2 rounded-full transition-all duration-1000 ease-out"
                      style={{ width: `${Math.min((selectedStudent.Moyenne_Bepc / 20) * 100, 100)}%` }}
                    />
                  </div>
                </div>
                <div className="flex items-center justify-center gap-3">
                  {selectedStudent.Decision.toLowerCase().includes("admis") ||
                  selectedStudent.Decision.toLowerCase().includes("ناجح") ? (
                    <>
                      <div className="bg-green-100 p-2 rounded-full">
                        <CheckCircle className="w-8 h-8 text-green-600" />
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold text-green-600">ناجح</p>
                        <p className="text-sm text-green-500">مبروك النجاح!</p>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="bg-red-100 p-2 rounded-full">
                        <XCircle className="w-8 h-8 text-red-600" />
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold text-red-600">راسب</p>
                        <p className="text-sm text-red-500">حظ أوفر المرة القادمة</p>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* معلومات إضافية */}
        <div className="mt-8 grid md:grid-cols-2 gap-6">
          <div className="bg-gray-50 rounded-xl p-6">
            <h4 className="font-semibold text-gray-900 mb-4">تفاصيل إضافية</h4>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">الولاية:</span>
                <span className="font-medium">{selectedStudent.WILAYA}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">المركز:</span>
                <span className="font-medium">{selectedStudent.Centre}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">القرار:</span>
                <span
                  className={cn(
                    "font-medium",
                    selectedStudent.Decision.toLowerCase().includes("admis") ||
                      selectedStudent.Decision.toLowerCase().includes("ناجح")
                      ? "text-green-600"
                      : "text-red-600",
                  )}
                >
                  {selectedStudent.Decision}
                </span>
              </div>
            </div>
          </div>
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-100">
            <h4 className="font-semibold text-gray-900 mb-4">إحصائيات سريعة</h4>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">المعدل المطلوب:</span>
                <span className="font-medium">10.00</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">الفرق:</span>
                <span
                  className={cn("font-medium", selectedStudent.Moyenne_Bepc >= 10 ? "text-green-600" : "text-red-600")}
                >
                  {selectedStudent.Moyenne_Bepc >= 10 ? "+" : ""}
                  {(selectedStudent.Moyenne_Bepc - 10).toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">النسبة المئوية:</span>
                <span className="font-medium">{((selectedStudent.Moyenne_Bepc / 20) * 100).toFixed(1)}%</span>
              </div>
            </div>
          </div>
        </div>
        {/* زر مشاركة أو طباعة */}
        <div className="mt-8 flex flex-wrap gap-4 justify-center no-print">
          <button
            onClick={() => window.print()}
            className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-300 font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-1"
          >
            طباعة النتيجة
          </button>
          <button
            onClick={() => {
              const text = `نتيجة الطالب ${selectedStudent.NOM}\nرقم الطالب: ${selectedStudent.Num_Bepc}\nالمعدل: ${selectedStudent.Moyenne_Bepc}\nالنتيجة: ${selectedStudent.Decision}`
              navigator.clipboard.writeText(text).then(() => {
                alert("تم نسخ المعلومات!")
              })
            }}
            className="bg-gradient-to-r from-green-600 to-emerald-600 text-white px-6 py-3 rounded-xl hover:from-green-700 hover:to-emerald-700 transition-all duration-300 font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-1"
          >
            نسخ المعلومات
          </button>
        </div>
      </div>
    </div>
  )
}
